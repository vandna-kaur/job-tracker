import mongoose from "mongoose";

export const STATUSES = ["Wishlist", "Applied", "Interview", "Offer", "Rejected"];

const jobSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    company: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, required: true, trim: true, maxlength: 120 },
    status: { type: String, enum: STATUSES, default: "Applied" },
    location: { type: String, trim: true, maxlength: 120, default: "" },
    link: { type: String, trim: true, maxlength: 500, default: "" },
    notes: { type: String, trim: true, maxlength: 2000, default: "" },
    appliedOn: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
