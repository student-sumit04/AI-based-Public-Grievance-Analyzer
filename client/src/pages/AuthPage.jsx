import { useState } from "react";
import { ArrowRight, Building2, Clock3, FileText, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import BrandMark from "../components/BrandMark.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

const highlights = [
  { label: "Complaint intake", text: "Citizens submit issues with location and attachments.", icon: FileText },
  { label: "AI prioritization", text: "Urgency, sentiment, duplicates, and escalation risk are detected.", icon: ShieldCheck },
  { label: "Department routing", text: "Officers receive the right complaints with clear context.", icon: Building2 }
];

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Citizen", department: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      if (mode === "login") await login({ email: form.email, password: form.password });
      else await register(form);
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <main className="auth-screen min-h-screen px-4 py-8">
      <section className="auth-layout">
        <div className="auth-story">
          <BrandMark />
          <div className="auth-intro">
            <p className="section-kicker">Public Service Desk</p>
            <h2>Resolve citizen complaints with clearer priorities.</h2>
            <p>
              A simple workspace for citizens, officers, and admins to track grievances from submission to resolution.
            </p>
          </div>

          <div className="auth-feature-list">
            {highlights.map((item) => (
              <div className="auth-feature" key={item.label}>
                <div className="auth-feature-icon">
                  <item.icon size={18} />
                </div>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="auth-preview-card">
            <div className="auth-preview-head">
              <span>Live Preview</span>
              <strong>High Priority</strong>
            </div>
            <h3>Open electric wire near school</h3>
            <p>Routed to Electricity Board with negative sentiment and high escalation risk.</p>
            <div className="auth-preview-meta">
              <span><Clock3 size={14} /> 12 min ago</span>
              <span>Risk 82%</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="mb-6">
            <p className="section-kicker text-civic">Secure Access</p>
            <h1 className="mt-1 text-2xl font-semibold">{mode === "login" ? "Login to dashboard" : "Create your workspace"}</h1>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-md border border-stone-200 bg-stone-50 p-1">
            <button className={`segmented ${mode === "login" ? "segmented-active" : ""}`} onClick={() => setMode("login")}>
              Login
            </button>
            <button className={`segmented ${mode === "register" ? "segmented-active" : ""}`} onClick={() => setMode("register")}>
              Register
            </button>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            {mode === "register" && (
              <label className="input-with-icon">
                <UserRound size={18} />
                <input placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
            )}
            <label className="input-with-icon">
              <Mail size={18} />
              <input type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </label>
            <label className="input-with-icon">
              <LockKeyhole size={18} />
              <input type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            </label>
            {mode === "register" && (
              <>
                <select className="input" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                  <option>Citizen</option>
                  <option>Officer</option>
                  <option>Admin</option>
                </select>
                {form.role === "Officer" && (
                  <input
                    className="input"
                    placeholder="Department"
                    value={form.department}
                    onChange={(event) => setForm({ ...form, department: event.target.value })}
                  />
                )}
              </>
            )}
            {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button className="primary-button flex w-full items-center justify-center gap-2" type="submit">
              {mode === "login" ? "Login" : "Create account"}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
