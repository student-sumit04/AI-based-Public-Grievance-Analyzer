const tones = {
  Submitted: "bg-slate-100 text-slate-700",
  "Under Review": "bg-sky-100 text-sky-800",
  Assigned: "bg-indigo-100 text-indigo-800",
  "In Progress": "bg-amber-100 text-amber-800",
  Resolved: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-rose-100 text-rose-800",
  Low: "bg-emerald-100 text-emerald-800",
  Medium: "bg-amber-100 text-amber-800",
  High: "bg-orange-100 text-orange-800",
  Critical: "bg-red-100 text-red-800"
};

export default function StatusBadge({ value }) {
  return <span className={`rounded px-2 py-1 text-xs font-semibold ${tones[value] || "bg-stone-100 text-stone-700"}`}>{value}</span>;
}
