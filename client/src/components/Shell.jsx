import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BarChart3, BellRing, Building2, CheckCircle2, ClipboardList, FilePlus2, LogOut } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import BrandMark from "./BrandMark.jsx";
import { api } from "../api/client.js";
import { useAuth } from "../contexts/AuthContext.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/submit", label: "Submit", icon: FilePlus2, roles: ["Citizen", "Admin"] },
  { to: "/complaints", label: "Complaints", icon: ClipboardList },
  { to: "/admin", label: "Admin", icon: Building2, roles: ["Admin"] }
];

export default function Shell() {
  const { user, logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ["header-complaints"],
    queryFn: async () => (await api.get("/complaints")).data,
    refetchInterval: 30000
  });

  const notifications = useMemo(() => {
    const complaints = data?.complaints || [];
    const highRisk = complaints.filter((complaint) => complaint.escalationRisk >= 70);
    const active = complaints.filter((complaint) => !["Resolved", "Rejected"].includes(complaint.status));
    const latest = complaints[0];

    return [
      ...highRisk.slice(0, 2).map((complaint) => ({
        id: `risk-${complaint._id}`,
        icon: AlertTriangle,
        tone: "alert",
        title: "High escalation risk",
        text: `${complaint.title} is at ${complaint.escalationRisk}% risk.`
      })),
      active.length > 0 && {
        id: "active",
        icon: ClipboardList,
        tone: "default",
        title: `${active.length} active complaint${active.length > 1 ? "s" : ""}`,
        text: "Review items that still need department action."
      },
      latest && {
        id: "latest",
        icon: CheckCircle2,
        tone: "success",
        title: "Latest update",
        text: `${latest.title} is currently ${latest.status}.`
      }
    ].filter(Boolean).slice(0, 4);
  }, [data]);

  return (
    <div className="app-shell min-h-screen text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-ink text-white lg:block">
        <div className="px-5 py-5">
          <BrandMark />
        </div>
        <div className="mx-4 rounded-lg border border-white/10 bg-white/10 p-4">
          <p className="text-xs font-semibold uppercase text-teal-100">Routing Engine</p>
          <div className="mt-3 h-2 rounded-full bg-white/10">
            <div className="h-2 w-4/5 rounded-full bg-[#9be7c7]" />
          </div>
          <p className="mt-3 text-sm text-stone-300">AI triage, duplicate clustering, and escalation scoring are active.</p>
        </div>
        <nav className="space-y-1 px-3 py-5">
          {links
            .filter((link) => !link.roles || link.roles.includes(user?.role))
            .map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === "/"} className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}>
                <link.icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            ))}
        </nav>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-civic">{user?.role} Workspace</p>
              <h2 className="text-lg font-semibold">Welcome, {user?.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button className="icon-button relative" title="Live alerts" onClick={() => setNotificationsOpen((open) => !open)}>
                  <BellRing size={18} />
                  {notifications.length > 0 && <span className="notification-dot">{notifications.length}</span>}
                </button>
                {notificationsOpen && (
                  <div className="notification-menu">
                    <div className="notification-head">
                      <span>Live Alerts</span>
                      <button onClick={() => setNotificationsOpen(false)}>Close</button>
                    </div>
                    {notifications.length ? (
                      <div className="space-y-2">
                        {notifications.map((item) => (
                          <div className={`notification-item notification-${item.tone}`} key={item.id}>
                            <item.icon size={17} />
                            <div>
                              <strong>{item.title}</strong>
                              <p>{item.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="notification-empty">No active alerts right now.</p>
                    )}
                  </div>
                )}
              </div>
              <nav className="flex gap-1 lg:hidden">
                {links
                  .filter((link) => !link.roles || link.roles.includes(user?.role))
                  .map((link) => (
                    <NavLink key={link.to} to={link.to} end={link.to === "/"} className="icon-button" title={link.label}>
                      <link.icon size={18} />
                    </NavLink>
                  ))}
              </nav>
              <button className="icon-button" onClick={logout} title="Log out">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>
        <div className="px-4 py-6 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
