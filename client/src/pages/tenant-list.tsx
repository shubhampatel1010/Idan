import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Users,Trash2  } from "lucide-react";
import { Layout } from "@/components/layout";
import { fetchTenants, updateTenantStatus ,deleteTenant  } from "@/lib/airtable";
import type { Tenant } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { Switch } from "@headlessui/react";

/* ================= CONSTANT ================= */

const FILTER_KEY = "tenant_filters";

/* ================= HELPERS ================= */

function normalizeToArray(value?: string | string[]): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function extractBudgets(value?: string | string[]): number[] {
  return normalizeToArray(value)
    .flatMap((v) => v.replace(/,/g, "").match(/\d+/g) || [])
    .map(Number);
}

function extractRooms(value?: string | string[]): number[] {
  return normalizeToArray(value)
    .map((v) => {
      const match = v.match(/\d+/);
      return match ? Number(match[0]) : null;
    })
    .filter(Boolean) as number[];
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ================= COMPONENT ================= */

export default function TenantList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null); // track deleting tenant

  /* ---------- FILTER STATES ---------- */

  const [status, setStatus] = useState<"all" | "Active" | "Inactive">("all");
  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(50000);
  const [rooms, setRooms] = useState(0);
  const [nameSearch, setNameSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  /* ---------- LOAD FILTERS FROM STORAGE ---------- */

  useEffect(() => {
    const saved = localStorage.getItem(FILTER_KEY);
    if (!saved) return;

    const f = JSON.parse(saved);
    setStatus(f.status ?? "all");
    setMinBudget(f.minBudget ?? 0);
    setMaxBudget(f.maxBudget ?? 50000);
    setRooms(f.rooms ?? 0);
    setNameSearch(f.nameSearch ?? "");
    setDateFrom(f.dateFrom ?? "");
    setDateTo(f.dateTo ?? "");
  }, []);

  /* ---------- SAVE FILTERS ---------- */

  useEffect(() => {
    localStorage.setItem(
      FILTER_KEY,
      JSON.stringify({
        status,
        minBudget,
        maxBudget,
        rooms,
        nameSearch,
        dateFrom,
        dateTo,
      })
    );
  }, [status, minBudget, maxBudget, rooms, nameSearch, dateFrom, dateTo]);

  /* ---------- DATA ---------- */

  const {
    data: tenants = [],
    isLoading,
    isFetching,
  } = useQuery<Tenant[]>({
    queryKey: ["tenants"],
    queryFn: fetchTenants,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["tenants"] });
  }, []);

  function Loader() {
    return (
      <div className="p-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-blue-600">Loading tenants...</span>
      </div>
    );
  }

  /* ---------- FILTER LOGIC ---------- */

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      /* Name filter */
      if (
        nameSearch &&
        !t.Full_name?.toLowerCase().includes(nameSearch.toLowerCase())
      ) {
        return false;
      }

      /* Status filter */
      if (status !== "all" && t.Status !== status) {
        return false;
      }

      /* Budget filter */
      const budgets = extractBudgets(t.Current_budget);
      if (budgets.length) {
        const match = budgets.some((b) => b >= minBudget && b <= maxBudget);
        if (!match) return false;
      }

      /* Rooms filter */
      const roomValues = extractRooms(t.Number_of_Rooms);
      if (rooms > 0 && roomValues.length && !roomValues.includes(rooms)) {
        return false;
      }

      /* Date filter */
      if (dateFrom) {
        if (!t.Created || new Date(t.Created) < new Date(dateFrom)) {
          return false;
        }
      }

      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (!t.Created || new Date(t.Created) > end) {
          return false;
        }
      }

      return true;
    })
    /* ✅ SORT BY CREATED DATE DESC (LATEST FIRST) */
    .sort((a, b) => {
      const dateA = a.Created ? new Date(a.Created).getTime() : 0;
      const dateB = b.Created ? new Date(b.Created).getTime() : 0;
      return dateB - dateA;
    });
  }, [
    tenants,
    status,
    minBudget,
    maxBudget,
    rooms,
    nameSearch,
    dateFrom,
    dateTo,
  ]);

  /* ---------- STATUS TOGGLE ---------- */

  const handleToggleStatus = async (tenant: Tenant) => {
    const newStatus = tenant.Status === "Active" ? "Inactive" : "Active";
    await updateTenantStatus(tenant.id, newStatus);

    queryClient.setQueryData<Tenant[]>(["tenants"], (old = []) =>
      old.map((t) => (t.id === tenant.id ? { ...t, Status: newStatus } : t))
    );
  };

  /* ================= UI ================= */

  
  /* ---------- DELETE TENANT ---------- */
  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm("Are you sure you want to delete this tenant?")) return;

    try {
      setDeletingId(tenantId);
      await deleteTenant(tenantId); // <- your API call to delete tenant
      queryClient.setQueryData<Tenant[]>(["tenants"], (old = []) =>
        old.filter((t) => t.id !== tenantId)
      );
    } catch (error) {
      console.error("Failed to delete tenant:", error);
      alert("Failed to delete tenant");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ================= FILTERS ================= */}
        <aside className="w-full lg:w-64 bg-white p-4 rounded shadow space-y-4">
          <h2 className="font-semibold text-lg">Filters</h2>
            <label className="block text-sm mb-1">Search by Name</label>
          <input
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            placeholder="Search by name"
            className="w-full border p-2 rounded"
          />
            <label className="block text-sm mb-1">Tenant Status</label>
  
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full border p-2 rounded"
          >
            <option value="all">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
            <label className="block text-sm mb-1">Budget(₪)</label>
  
          <div className="flex gap-2">
            <input
              type="number"
              value={minBudget}
              onChange={(e) => setMinBudget(+e.target.value || 0)}
              placeholder="Min Budget"
              className="w-1/2 border p-2 rounded"
            />
            <input
              type="number"
              value={maxBudget}
              onChange={(e) => setMaxBudget(+e.target.value || 0)}
              placeholder="Max Budget"
              className="w-1/2 border p-2 rounded"
            />
          </div>
            <label className="block text-sm mb-1">Bedrooms</label>
  
          <input
            type="number"
            value={rooms}
            onChange={(e) => setRooms(+e.target.value || 0)}
            placeholder="Rooms"
            className="w-full border p-2 rounded"
          />

          <div>
            <label className="text-sm">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="text-sm">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
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
              setDateFrom("");
              setDateTo("");
              localStorage.removeItem(FILTER_KEY);
            }}
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            Reset
          </button>
        </aside>

        {/* ================= TABLE ================= */}
        <div className="flex-1 bg-white rounded shadow overflow-x-auto">
          <div className="p-4 border-b flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h2 className="font-semibold text-lg">
              Tenants ({filteredTenants.length})
            </h2>
          </div>

          {isLoading || isFetching ? (
            <p className="p-4">Loading tenants...</p>
          ) : (
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
                  <th className="p-5">Edit</th>
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
                          t.Status === "Active" ? "bg-green-500" : "bg-gray-200"
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
                        className="text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      &nbsp;
                      {/* <button
                        onClick={() => handleDeleteTenant(t.id)}
                        disabled={deletingId === t.id}
                        className="text-red-600"
                      >
                        {deletingId === t.id ? (
                          <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-red-600 rounded-full" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
