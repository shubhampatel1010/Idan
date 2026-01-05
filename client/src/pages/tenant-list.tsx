// TenantList.tsx
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Users } from "lucide-react";
import { Layout } from "@/components/layout";
import { fetchTenants, updateTenantStatus } from "@/lib/airtable"; // we will define updateTenantStatus
import type { Tenant } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { Switch } from "@headlessui/react";

/* ---------------- HELPERS ---------------- */

function normalizeToArray(value?: string | string[]): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function extractBudgets(value?: string | string[]): number[] {
  const arr = normalizeToArray(value);
  return arr
    .flatMap((v) => v.replace(/,/g, "").match(/\d+/g) || [])
    .map(Number);
}

function extractRooms(value?: string | string[]): number[] {
  const arr = normalizeToArray(value);
  return arr
    .map((v) => {
      const match = v.match(/\d+/);
      return match ? Number(match[0]) : null;
    })
    .filter(Boolean) as number[];
}

/* ---------------- COMPONENT ---------------- */

export default function TenantList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<"all" | "Active" | "Inactive">("all");
  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(50000);
  const [rooms, setRooms] = useState(0);
  const [nameSearch, setNameSearch] = useState("");

  const { data: tenants = [], isLoading } = useQuery<Tenant[]>({
    queryKey: ["tenants"],
    queryFn: fetchTenants,
  });

  /* ---------------- FILTER LOGIC ---------------- */

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      // ✅ Name search (case-insensitive)
      if (
        nameSearch &&
        !t.Full_name?.toLowerCase().includes(nameSearch.toLowerCase())
      ) {
        return false;
      }
      if (status !== "all" && t.Status !== status) return false;
      const budgets = extractBudgets(t.Current_budget);
      if (budgets.length) {
        const validBudget = budgets.some(
          (b) => b >= minBudget && b <= maxBudget
        );
        if (!validBudget) return false;
      }
      const roomValues = extractRooms(t.Number_of_Rooms);
      if (rooms > 0 && roomValues.length && !roomValues.includes(rooms))
        return false;

      return true;
    });
  }, [tenants, status, minBudget, maxBudget, rooms, nameSearch]);

  /* ---------------- HANDLE STATUS TOGGLE ---------------- */

  const handleToggleStatus = async (tenant: Tenant) => {
    const newStatus = tenant.Status === "Active" ? "Inactive" : "Active";
    try {
      await updateTenantStatus(tenant.id, newStatus);
      // Optimistic update in React Query cache
      queryClient.setQueryData<Tenant[]>(["tenants"], (old = []) =>
        old.map((t) => (t.id === tenant.id ? { ...t, Status: newStatus } : t))
      );
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status");
    }
  };

  function formatDate(value?: string) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* FILTER SIDEBAR */}
        <aside className="w-full lg:w-64 bg-white p-4 rounded shadow space-y-4">
          <h2 className="font-semibold text-lg">Filters</h2>
          <div>
            <label className="block text-sm mb-1">Search by Name</label>
            <input
              type="text"
              placeholder="Enter tenant name"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full border rounded p-2"
            >
              <option value="all">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Budget Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minBudget}
                onChange={(e) => setMinBudget(Number(e.target.value || 0))}
                className="w-1/2 border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value || 0))}
                className="w-1/2 border p-2 rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Rooms</label>
            <input
              type="number"
              placeholder="Rooms"
              value={rooms}
              onChange={(e) => setRooms(Number(e.target.value || 0))}
              className="w-full border p-2 rounded"
            />
          </div>
          <button
            onClick={() => {
              setStatus("all");
              setMinBudget(0);
              setMaxBudget(50000);
              setRooms(0);
              setNameSearch("");
            }}
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            Reset
          </button>
        </aside>

        {/* TENANT TABLE */}
        <div className="flex-1 bg-white rounded shadow overflow-x-auto">
          <div className="p-4 border-b flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h2 className="font-semibold text-lg">
              Tenants ({filteredTenants.length})
            </h2>
          </div>

          {isLoading ? (
            <p className="p-4">Loading tenants...</p>
          ) : filteredTenants.length === 0 ? (
            <p className="p-4 text-muted-foreground">No tenants found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Rooms</th>
                    <th className="p-3">Budget</th>
                    <th className="p-3">Elevator</th>
                    <th className="p-3">Parking</th>
                    <th className="p-3">Area For Looking</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map((t) => (
                    <tr key={t.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{formatDate(t.Created)}</td>

                      <td className="p-3">{t.Full_name}</td>
                      <td className="p-3">{t.Phone_number}</td>
                      <td className="p-3">
                        {normalizeToArray(t.Number_of_Rooms).join(", ")}
                      </td>
                      <td className="p-3">
                        {normalizeToArray(t.Current_budget).join(", ")}
                      </td>
                      <td className="p-3">{t.Elevator}</td>
                      <td className="p-3">{t.Parking}</td>
                      <td className="p-3">{t.In_which_area_are_you_looking}</td>
                      <td className="p-3">
                        <Switch
                          checked={t.Status === "Active"}
                          onChange={() => handleToggleStatus(t)}
                          className={`${
                            t.Status === "Active"
                              ? "bg-green-500"
                              : "bg-gray-200"
                          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                        >
                          <span
                            className={`${
                              t.Status === "Active"
                                ? "translate-x-6"
                                : "translate-x-1"
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          />
                        </Switch>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => navigate(`/tenants/edit/${t.id}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
