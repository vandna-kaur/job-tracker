import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import jobRoutes from "./routes/jobs.js";

if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET. Add it to server/.env.");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: "20kb" }));
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);

// Serve the built React app in production
const dist = path.join(__dirname, "../client/dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

let localDb = null;

// Uses MONGO_URI (Atlas or any MongoDB) when set.
// Otherwise starts a local database that saves to server/.data
async function connectDb() {
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected (MONGO_URI)");
    } catch (e) {
      console.error("MongoDB connection failed:", e.message);
      if (/auth/i.test(e.message)) {
        console.error("The username or password in MONGO_URI is wrong. Or delete MONGO_URI to use the local database.");
      }
      process.exit(1);
    }
    return;
  }
  const { MongoMemoryServer } = await import("mongodb-memory-server");
  const dbPath = path.join(__dirname, ".data");
  fs.mkdirSync(dbPath, { recursive: true });
  console.log("Starting local database (first run downloads MongoDB, this can take a minute)...");
  localDb = await MongoMemoryServer.create({ instance: { dbPath, storageEngine: "wiredTiger" } });
  await mongoose.connect(localDb.getUri("job-tracker"));
  console.log("Local database ready. Data is saved in server/.data");
}

async function shutdown() {
  try { await mongoose.disconnect(); if (localDb) await localDb.stop(); } catch {}
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

connectDb()
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server on http://localhost:${port}`));
  })
  .catch((e) => {
    console.error("Could not start the database:", e.message);
    process.exit(1);
  });
