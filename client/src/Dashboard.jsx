import { useCallback, useEffect, useState } from "react";
import { api, STATUSES } from "./api";
import JobForm from "./JobForm";

export default function Dashboard({ onAuthError }) {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({});
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [editing, setEditing] = useState(null); // null | "new" | job
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handle = useCallback((err) => {
    if (err.status === 401) onAuthError();
    else setError(err.message);
  }, [onAuthError]);

  // Wait 300ms after typing before searching
  useEffect(() => {
    const t = setTimeout(() => { setQuery(q); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page });
      if (status) params.set("status", status);
      if (query) params.set("q", query);
      const [list, s] = await Promise.all([api(`/jobs?${params}`), api("/jobs/stats")]);
      setJobs(list.jobs);
      setPages(list.pages);
      setStats(s);
    } catch (err) {
      handle(err);
    } finally {
      setLoading(false);
    }
  }, [page, status, query, handle]);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(job, next) {
    try {
      await api(`/jobs/${job._id}`, { method: "PUT", body: { status: next } });
      load();
    } catch (err) { handle(err); }
  }

  async function remove(job) {
    if (!window.confirm(`Delete ${job.role} at ${job.company}?`)) return;
    try {
      await api(`/jobs/${job._id}`, { method: "DELETE" });
      load();
    } catch (err) { handle(err); }
  }

  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <>
      <section className="stats" aria-label="Application counts">
        <button className={!status ? "stat on" : "stat"} onClick={() => { setStatus(""); setPage(1); }}>
          <strong>{total}</strong> All
        </button>
        {STATUSES.map((s) => (
          <button key={s} className={status === s ? "stat on" : "stat"} onClick={() => { setStatus(s); setPage(1); }}>
            <strong>{stats[s] ?? 0}</strong> {s}
          </button>
        ))}
      </section>

      <div className="toolbar">
        <input type="search" placeholder="Search company or role" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        <button className="primary" onClick={() => setEditing("new")}>Add application</button>
      </div>

      {editing && (
        <JobForm
          job={editing === "new" ? null : editing}
          onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

      {error && <p className="error" role="alert">{error}</p>}
      {loading && <p className="muted">Loading…</p>}
      {!loading && jobs.length === 0 && (
        <p className="empty">
          {query || status ? "No applications match these filters." : "No applications yet. Add your first one."}
        </p>
      )}

      <ul className="jobs">
        {jobs.map((j) => (
          <li className="card job" key={j._id}>
            <div className="jobmain">
              <h3>{j.role}</h3>
              <p>{j.company}{j.location && ` – ${j.location}`}</p>
              <p className="muted">Applied {new Date(j.appliedOn).toLocaleDateString()}</p>
              {j.notes && <p className="notes">{j.notes}</p>}
              {j.link && <a href={j.link} target="_blank" rel="noreferrer">View posting</a>}
            </div>
            <div className="jobside">
              <select className={`badge ${j.status}`} value={j.status} onChange={(e) => changeStatus(j, e.target.value)} aria-label="Status">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <div className="row">
                <button onClick={() => setEditing(j)}>Edit</button>
                <button className="danger" onClick={() => remove(j)}>Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <div className="pager">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}
