export default function StatCard({ label, value, tone = "default", icon: Icon }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-card-head">
        <span>{label}</span>
        {Icon && (
          <div className="stat-icon">
            <Icon size={18} />
          </div>
        )}
      </div>
      <strong>{value}</strong>
    </div>
  );
}
