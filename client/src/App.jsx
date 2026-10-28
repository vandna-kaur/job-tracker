import { useEffect, useState } from "react";
import { api } from "./api";
import AuthForm from "./AuthForm";
import Dashboard from "./Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    if (!checking) return;
    api("/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setChecking(false));
  }, [checking]);

  const logout = () => { localStorage.removeItem("token"); setUser(null); };

  if (checking) return <p className="muted center">Loading…</p>;
  if (!user) return <AuthForm onLogin={setUser} />;

  return (
    <div className="app">
      <header>
        <h1>Job Tracker</h1>
        <div className="row">
          <span className="muted">{user.name}</span>
          <button onClick={logout}>Log out</button>
        </div>
      </header>
      <Dashboard onAuthError={logout} />
    </div>
  );
}
