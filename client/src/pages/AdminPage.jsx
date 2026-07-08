import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus } from "lucide-react";
import { useState } from "react";
import { api } from "../api/client.js";

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ departmentName: "", email: "", location: "", serviceKeywords: "" });
  const { data, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => (await api.get("/departments")).data
  });

  const create = useMutation({
    mutationFn: async () =>
      (await api.post("/departments", {
        ...form,
        serviceKeywords: form.serviceKeywords.split(",").map((keyword) => keyword.trim()).filter(Boolean)
      })).data,
    onSuccess: () => {
      setForm({ departmentName: "", email: "", location: "", serviceKeywords: "" });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    }
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <section className="panel">
        <h2 className="panel-title">Create Department</h2>
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); create.mutate(); }}>
          <input className="input" placeholder="Department name" value={form.departmentName} onChange={(event) => setForm({ ...form, departmentName: event.target.value })} />
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input className="input" placeholder="Location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
          <input
            className="input"
            placeholder="Keywords, comma separated"
            value={form.serviceKeywords}
            onChange={(event) => setForm({ ...form, serviceKeywords: event.target.value })}
          />
          <button className="primary-button inline-flex items-center gap-2">
            <Plus size={18} />
            Add department
          </button>
        </form>
      </section>

      <section className="panel">
        <h2 className="panel-title">Departments</h2>
        {isLoading ? (
          <p>Loading departments...</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {data.departments.map((department) => (
              <article className="complaint-card" key={department._id}>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded bg-stone-100 text-civic">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{department.departmentName}</h3>
                    <p className="text-sm text-stone-500">{department.email}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-stone-600">{department.location}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
