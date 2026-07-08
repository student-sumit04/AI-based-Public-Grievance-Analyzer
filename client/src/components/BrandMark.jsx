import { BrainCircuit, ShieldCheck } from "lucide-react";

export default function BrandMark({ compact = false }) {
  return (
    <div className="brand-lockup">
      <div className="brand-mark">
        <ShieldCheck size={compact ? 18 : 22} />
        <BrainCircuit size={compact ? 15 : 18} className="brand-mark-ai" />
      </div>
      <div>
        <p className="brand-eyebrow">AI Public</p>
        <h1 className={compact ? "brand-title brand-title-compact" : "brand-title"}>Grievance Analyzer</h1>
      </div>
    </div>
  );
}
