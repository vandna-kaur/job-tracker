import { useState } from "react";
import { api, STATUSES } from "./api";

const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export default function JobForm({ job, onSaved, onCancel }) {
  const [form, setForm] = useState({
    company: job?.company || "",
    role: job?.role || "",
    status: job?.status || "Applied",
    location: job?.location || "",
    link: job?.link || "",
    notes: job?.notes || "",
    appliedOn: toInputDate(job?.appliedOn || new Date()),
  });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const saved = job
        ? await api(`/jobs/${job._id}`, { method: "PUT", body: form })
        : await api("/jobs", { method: "POST", body: form });
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="card jobform" onSubmit={submit}>
      <h2>{job ? "Edit application" : "Add application"}</h2>
      <div className="grid">
        <label>Company<input value={form.company} onChange={set("company")} required /></label>
        <label>Role<input value={form.role} onChange={set("role")} required /></label>
        <label>Status
          <select value={form.status} onChange={set("status")}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>Date applied<input type="date" value={form.appliedOn} onChange={set("appliedOn")} /></label>
        <label>Location<input value={form.location} onChange={set("location")} /></label>
        <label>Job link<input type="url" value={form.link} onChange={set("link")} placeholder="https://" /></label>
      </div>
      <label>Notes<textarea rows="3" value={form.notes} onChange={set("notes")} /></label>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="row">
        <button className="primary">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
