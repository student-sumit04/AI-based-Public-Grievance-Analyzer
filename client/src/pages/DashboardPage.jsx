import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ClipboardList, Gauge } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api/client.js";
import StatCard from "../components/StatCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const colors = ["#126b6f", "#7c3f00", "#b93815", "#386641", "#4f46e5", "#64748b"];

function normalize(rows) {
  return rows.map((row) => ({ name: row._id || "Unknown", value: row.count }));
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/dashboard")).data
  });

  if (isLoading) return <p>Loading dashboard...</p>;

  const status = normalize(data.charts.status);
  const category = normalize(data.charts.category);
  const sentiment = normalize(data.charts.sentiment);
  const urgency = normalize(data.charts.urgency);

  return (
    <div className="space-y-6">
      <section className="dashboard-hero">
        <div>
          <p className="section-kicker">AI Operations Overview</p>
          <h1>Public grievance intelligence center</h1>
          <p>Monitor complaint flow, escalation risk, citizen sentiment, duplicate pressure, and department workload from one place.</p>
        </div>
        <div className="hero-risk">
          <span>Escalation Signal</span>
          <strong>{Math.round(data.totals.avgRisk || 0)}%</strong>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total complaints" value={data.totals.total} icon={ClipboardList} />
        <StatCard label="Average escalation risk" value={`${Math.round(data.totals.avgRisk || 0)}%`} tone="risk" icon={Gauge} />
        <StatCard label="High risk complaints" value={data.totals.highRisk} tone="alert" icon={AlertTriangle} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="panel">
          <h3 className="panel-title">Complaint Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={status}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e2d7" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#126b6f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <h3 className="panel-title">Category Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={category} dataKey="value" nameKey="name" outerRadius={95} label>
                  {category.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="panel">
          <h3 className="panel-title">Sentiment</h3>
          <div className="flex flex-wrap gap-3">
            {sentiment.map((item) => (
              <div key={item.name} className="metric-row">
                <span>{item.name}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <h3 className="panel-title">Urgency</h3>
          <div className="flex flex-wrap gap-3">
            {urgency.map((item) => (
              <div key={item.name} className="metric-row">
                <span>{item.name}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel">
        <h3 className="panel-title">Recent Complaints</h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Department</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.map((complaint) => (
                <tr key={complaint._id}>
                  <td>{complaint.title}</td>
                  <td>{complaint.department}</td>
                  <td>
                    <StatusBadge value={complaint.urgency} />
                  </td>
                  <td>
                    <StatusBadge value={complaint.status} />
                  </td>
                  <td>{complaint.escalationRisk}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
