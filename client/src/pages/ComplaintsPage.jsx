import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { api } from "../api/client.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

const statuses = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved", "Rejected"];

export default function ComplaintsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState({});
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["complaints"],
    queryFn: async () => (await api.get("/complaints")).data
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: async () => (await api.get("/departments")).data,
    enabled: user.role !== "Citizen"
  });

  const selectedComplaintQuery = useQuery({
    queryKey: ["complaint", selectedComplaintId],
    queryFn: async () => (await api.get(`/complaints/${selectedComplaintId}`)).data,
    enabled: Boolean(selectedComplaintId)
  });

  const update = useMutation({
    mutationFn: async ({ id, status, department, remarks }) =>
      (await api.put(`/complaints/${id}/status`, { status, department, remarks })).data,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint", variables.id] });
    }
  });

  useEffect(() => {
    if (!data?.complaints?.length) return;
    if (!selectedComplaintId) setSelectedComplaintId(data.complaints[0]._id);
  }, [data, selectedComplaintId]);

  useEffect(() => {
    if (!user?.id) return undefined;

    const socketBaseUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const socket = io(socketBaseUrl);

    socket.emit("join:user", user.id);
    if (user.role !== "Citizen" && user.department) {
      socket.emit("join:department", user.department);
    }

    const refresh = (complaint) => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint", complaint._id] });
    };

    socket.on("complaint:updated", refresh);

    return () => {
      socket.off("complaint:updated", refresh);
      socket.disconnect();
    };
  }, [queryClient, user?.department, user?.id, user?.role]);

  if (isLoading) return <p>Loading complaints...</p>;

  const selectedComplaint = selectedComplaintQuery.data?.complaint || null;
  const complaintLogs = selectedComplaintQuery.data?.logs || [];
  const departmentOptions = departmentsQuery.data?.departments || [];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="panel-title">Complaints</h2>
          <button className="secondary-button inline-flex items-center gap-2" onClick={() => queryClient.invalidateQueries({ queryKey: ["complaints"] })}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {data.complaints.map((complaint) => {
            const draft = drafts[complaint._id] || {};
            return (
              <article className="complaint-card" key={complaint._id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{complaint.title}</h3>
                    <p className="mt-1 text-sm text-stone-600">{complaint.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge value={complaint.urgency} />
                    <StatusBadge value={complaint.status} />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <div className="mini-stat"><span>Department</span><strong>{complaint.department}</strong></div>
                  <div className="mini-stat"><span>Category</span><strong>{complaint.category}</strong></div>
                  <div className="mini-stat"><span>Sentiment</span><strong>{complaint.sentiment}</strong></div>
                  <div className="mini-stat"><span>Risk</span><strong>{complaint.escalationRisk}%</strong></div>
                </div>

                <p className="mt-4 rounded border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">{complaint.aiSummary}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="secondary-button inline-flex items-center gap-2" onClick={() => setSelectedComplaintId(complaint._id)}>
                    <Clock3 size={16} />
                    View updates
                  </button>
                </div>

                {user.role !== "Citizen" && (
                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_220px_auto]">
                    <input
                      className="input"
                      placeholder="Officer remarks"
                      value={draft.remarks ?? ""}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [complaint._id]: { ...prev[complaint._id], remarks: event.target.value }
                        }))
                      }
                    />
                    <select
                      className="input"
                      value={draft.status ?? complaint.status}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [complaint._id]: { ...prev[complaint._id], status: event.target.value }
                        }))
                      }
                    >
                      {statuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                    {user.role === "Admin" ? (
                      <select
                        className="input"
                        value={draft.department ?? complaint.department}
                        onChange={(event) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [complaint._id]: { ...prev[complaint._id], department: event.target.value }
                          }))
                        }
                      >
                        <option value={complaint.department}>Keep current department</option>
                        {departmentOptions
                          .filter((department) => department.departmentName !== complaint.department)
                          .map((department) => (
                            <option key={department._id} value={department.departmentName}>
                              {department.departmentName}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <div className="input flex items-center text-sm text-stone-500">Department reassignment is admin only</div>
                    )}
                    <button
                      className="secondary-button inline-flex items-center gap-2"
                      onClick={() =>
                        update.mutate({
                          id: complaint._id,
                          status: draft.status ?? complaint.status,
                          department: user.role === "Admin" ? draft.department : undefined,
                          remarks: draft.remarks ?? ""
                        })
                      }
                    >
                      <CheckCircle2 size={18} />
                      Update
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <aside className="panel">
        <div className="flex items-center justify-between gap-3">
          <h2 className="panel-title">Complaint timeline</h2>
          {selectedComplaint && <StatusBadge value={selectedComplaint.status} />}
        </div>

        {selectedComplaint ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{selectedComplaint.title}</h3>
              <p className="mt-1 text-sm text-stone-600">{selectedComplaint.department}</p>
            </div>

            <div className="space-y-3">
              {complaintLogs.length > 0 ? (
                complaintLogs.map((log) => (
                  <div key={log._id} className="rounded border border-stone-200 bg-stone-50 p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <strong>{log.action}</strong>
                      <span className="text-xs text-stone-500">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    {log.note ? <p className="mt-2 text-stone-600">{log.note}</p> : null}
                    {log.officer?.name ? <p className="mt-2 text-xs text-stone-500">By {log.officer.name}</p> : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-stone-600">No timeline entries yet.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-600">Select a complaint to see reassignment and status history.</p>
        )}
      </aside>
    </div>
  );
}
