import { AlertTriangle, Building2, CheckCircle2, FileSearch, RadioTower } from "lucide-react";

const nodes = [
  { label: "Complaint", icon: FileSearch, className: "signal-node-left" },
  { label: "AI Risk", icon: AlertTriangle, className: "signal-node-top" },
  { label: "Department", icon: Building2, className: "signal-node-right" },
  { label: "Resolved", icon: CheckCircle2, className: "signal-node-bottom" }
];

export default function CivicSignal() {
  return (
    <div className="civic-signal" aria-hidden="true">
      <div className="signal-grid" />
      <div className="signal-core">
        <RadioTower size={34} />
        <span>Live Routing</span>
      </div>
      {nodes.map((node) => (
        <div className={`signal-node ${node.className}`} key={node.label}>
          <node.icon size={18} />
          <span>{node.label}</span>
        </div>
      ))}
    </div>
  );
}
