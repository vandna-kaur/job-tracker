import { Router } from "express";
import mongoose from "mongoose";
import Job, { STATUSES } from "../models/Job.js";
import auth from "../middleware/auth.js";

const router = Router();
router.use(auth);

const FIELDS = ["company", "role", "status", "location", "link", "notes", "appliedOn"];
const pick = (body) => Object.fromEntries(FIELDS.filter((k) => k in body).map((k) => [k, body[k]]));
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// List with search, status filter and pagination
router.get("/", async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = 8;
  const filter = { user: req.userId };
  if (STATUSES.includes(req.query.status)) filter.status = req.query.status;
  if (req.query.q) {
    const rx = new RegExp(escapeRegex(String(req.query.q)), "i");
    filter.$or = [{ company: rx }, { role: rx }];
  }
  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ appliedOn: -1 }).skip((page - 1) * limit).limit(limit),
    Job.countDocuments(filter),
  ]);
  res.json({ jobs, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
});

// Count per status (MongoDB aggregation)
router.get("/stats", async (req, res) => {
  const rows = await Job.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(req.userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const stats = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  rows.forEach((r) => (stats[r._id] = r.count));
  res.json(stats);
});

router.post("/", async (req, res) => {
  try {
    const job = await Job.create({ ...pick(req.body), user: req.userId });
    res.status(201).json(job);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      pick(req.body),
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ error: "Job not found." });
    res.json(job);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!job) return res.status(404).json({ error: "Job not found." });
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: "Invalid job id." });
  }
});

export default router;
