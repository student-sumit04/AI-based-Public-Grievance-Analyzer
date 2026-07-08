import { useMutation } from "@tanstack/react-query";
import { FileImage, Send } from "lucide-react";
import { useState } from "react";
import { api } from "../api/client.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function SubmitComplaintPage() {
  const [form, setForm] = useState({ title: "", description: "", location: "" });
  const [files, setFiles] = useState([]);
  const [created, setCreated] = useState(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      Array.from(files).forEach((file) => payload.append("attachments", file));
      return (await api.post("/complaints", payload, { headers: { "Content-Type": "multipart/form-data" } })).data;
    },
    onSuccess: (data) => {
      setCreated(data.complaint);
      setForm({ title: "", description: "", location: "" });
      setFiles([]);
    }
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="panel">
        <h2 className="panel-title">Submit Complaint</h2>
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
          <input className="input" placeholder="Complaint title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <textarea
            className="input min-h-40"
            placeholder="Describe the issue"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            required
          />
          <input className="input" placeholder="Location or ward" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
          <label className="file-drop">
            <FileImage size={18} />
            <span>{files.length ? `${files.length} file selected` : "Upload images or PDFs"}</span>
            <input className="hidden" type="file" multiple accept="image/*,.pdf" onChange={(event) => setFiles(event.target.files)} />
          </label>
          {mutation.error && <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{mutation.error.response?.data?.message || "Unable to submit complaint"}</p>}
          <button className="primary-button inline-flex items-center gap-2" disabled={mutation.isPending}>
            <Send size={18} />
            {mutation.isPending ? "Analyzing..." : "Submit complaint"}
          </button>
        </form>
      </section>

      <aside className="panel">
        <h2 className="panel-title">AI Result</h2>
        {created ? (
          <div className="space-y-4">
            <p className="text-sm text-stone-600">{created.aiSummary}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="mini-stat"><span>Category</span><strong>{created.category}</strong></div>
              <div className="mini-stat"><span>Risk</span><strong>{created.escalationRisk}%</strong></div>
              <div className="mini-stat"><span>Urgency</span><StatusBadge value={created.urgency} /></div>
              <div className="mini-stat"><span>Sentiment</span><strong>{created.sentiment}</strong></div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-stone-500">Department</p>
              <p className="font-semibold">{created.department}</p>
            </div>
            <p className="rounded border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">{created.aiExplanation}</p>
            {created.duplicateCandidates?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase text-stone-500">Possible Duplicates</p>
                <ul className="mt-2 space-y-2">
                  {created.duplicateCandidates.map((candidate) => (
                    <li className="rounded border border-stone-200 p-2 text-sm" key={candidate.complaintId}>
                      {candidate.title} - {Math.round(candidate.similarity * 100)}%
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-stone-600">The AI summary, category, department, duplicate score, and escalation risk appear here after submission.</p>
        )}
      </aside>
    </div>
  );
}
