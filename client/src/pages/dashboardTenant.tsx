import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Users,
  MapPin,
  Bed,
  Bath,
  User,
  Copy,
  Check,
  MessageCircle,
  Phone,
  Building,
  Mail,
  ArrowUpDown,
  Car,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { StatsCard } from "@/components/stats-card";
import { StatsCardSkeleton, TenantCardSkeleton } from "@/components/loading";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  fetchProperties,
  fetchTenants,
  updateTenantAgent,
  fetchTemplateMessage,
} from "@/lib/airtable";
import type {
  Property,
  Tenant,
  TenantMatch,
  PropertyFilters,
} from "@/lib/types";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

/* -------------------- Helpers -------------------- */
const getLoggedInAgentName = () => {
  try {
    const user = JSON.parse(localStorage.getItem("userData") || "{}");
    return user?.Name || "Unknown Agent";
  } catch {
    return "Unknown Agent";
  }
};

const formatPhoneForWhatsApp = (phone: string) => phone.replace(/\D/g, "");

const generateDefaultMessage = (
  tenantName: string,
  propertyName: string,
  propertyUrl: string,
) =>
  `Property Match Update\n\nHi ${tenantName},\n\nWe found a property that matches your preferences.\n\nProperty: ${propertyName}\n\nView details:\n${propertyUrl}\n\nPlease let us know if you are interested.\n\nRegards,\nProperty Team`;

/* -------------------- Tenant Card -------------------- */
function TenantListItem({
  tenant,
  isSelected,
  onSelect,
}: {
  tenant: Tenant;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [cstatus, setCStatus] = useState(tenant.Current_Status || "חָדָשׁ");
  const [cloading, setCLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [sending, setSending] = useState(false);

  const WEBHOOK_URL = "https://hook.eu2.make.com/9ts9wq1y6hqf8pps2qg660qatfhen4gb"; // 👈 change

  const handleSendChat = async () => {
    if (!chatMessage.trim()) return;

    setSending(true);

    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: tenant.id,
          phone: tenant.Phone_number,
          message: chatMessage,
          agentName: getLoggedInAgentName(),
        }),
      });

      setChatMessage("");
      setShowChat(false);
    } catch (err) {
      console.error("Webhook failed", err);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const STATUS_OPTIONS = [
    "חָדָשׁ",
    "מוּצָע",
    "נִקרָא",
    "מְתוּאָם",
    "לא רלוונטי",
  ];
  const STATUS_COLORS: Record<string, string> = {
    חָדָשׁ: "bg-blue-100 text-blue-700",
    מוּצָע: "bg-purple-100 text-purple-700",
    נִקרָא: "bg-green-100 text-green-700",
    מְתוּאָם: "bg-yellow-100 text-yellow-800",
    "לא רלוונטי": "bg-red-100 text-red-700",
  };

  const updateTenantStatus = async (recordId: string, newStatus: string) => {
    const response = await fetch(
      `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/${import.meta.env.VITE_TENANTTABLE}/${recordId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            Current_Status: newStatus,
            Agent_Name: getLoggedInAgentName(), // Update agent name on status change
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update status");
    }

    return response.json();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setCStatus(newStatus);
    setCLoading(true);

    try {
      await updateTenantStatus(tenant.id, newStatus);
    } catch (err) {
      console.error("Failed to update status");
    } finally {
      setCLoading(false);
    }
  };
  return (
    <Card
      onClick={onSelect}
      className={`cursor-pointer border transition-all ${
        isSelected
          ? "border-slate-400 bg-slate-50 dark:bg-slate-900"
          : "hover:shadow-sm"
      }`}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={tenant.Profile_Photo} />
            <AvatarFallback>
              <User size={16} />
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* Name + Status */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-medium text-sm truncate max-w-[180px]">
                {tenant.Full_name}
              </h3>

              <select
                dir="ltl"
                value={cstatus}
                onChange={handleChange}
                disabled={cloading}
                onClick={(e) => e.stopPropagation()}
                className={`text-xs px-2 py-1 rounded-full border outline-none max-w-[140px]
                ${STATUS_COLORS[cstatus]}`}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Agent */}
            {tenant.Agent_Name && (
              <p className="text-xs text-slate-500">
                By: <b>{tenant.Agent_Name}</b>
              </p>
            )}

            <div className="relative inline-block">
              {/* PHONE NUMBER (click target) */}
              <p
                onClick={() => setShowChat((p) => !p)}
                className="text-xs flex items-center gap-1 mt-1 cursor-pointer text-blue-600 hover:underline"
              >
                <Phone size={12} /> {tenant.Phone_number}
              </p>

              {/* CHAT POPUP */}
              {showChat && (
                <div className="absolute top-full mb-2 left-0 z-50 w-64 bg-white dark:bg-slate-900 border rounded-lg shadow-xl p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold">
                      Send Message On WhatsApp
                    </span>
                    <button
                      onClick={() => {
                        setShowChat(false);
                        setChatMessage("");
                      }}
                      className="text-xs text-gray-500 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type message..."
                    className="w-full text-xs border rounded p-2 resize-none focus:outline-none focus:ring"
                  />

                  <Button
                    size="sm"
                    className="w-full"
                    disabled={sending}
                    onClick={handleSendChat}
                  >
                    {sending ? "Sending..." : "Send"}
                  </Button>
                </div>
              )}
            </div>

            {/* Features */}
            <p className="text-xs flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1">
                <Bed size={12} /> {tenant.Number_of_Rooms || "NA"}
              </span>
              <span className="flex items-center gap-1">
                <ArrowUpDown size={12} /> {tenant.Elevator || "NA"}
              </span>
              <span className="flex items-center gap-1">
                <Car size={12} /> {tenant.Parking_Importance || "NA"}
              </span>
            </p>

            {/* Area */}
            <p className="text-xs flex items-center gap-1">
              <MapPin size={12} />{" "}
              {tenant.In_which_area_are_you_looking || "NA"}
            </p>

            {/* Budget */}
            <p className="text-xs font-medium">
              ₪{tenant.Current_budget || "-"} / mo
            </p>

            {/* Bottom Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <Badge
                variant={tenant.Status === "Active" ? "default" : "secondary"}
                className="text-xs"
              >
                {tenant.Status ?? "Inactive"}
              </Badge>

              <Button
                size="sm"
                variant={isSelected ? "default" : "secondary"}
                onClick={(e) => e.stopPropagation()}
              >
                View
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------- Property Card -------------------- */
function MatchedPropertyCard({
  property,
  tenant,
  templateMessage,
}: {
  property: Property;
  tenant: Tenant;
  templateMessage?: string;
}) {
  const messageText = `שלום ${tenant.Full_name},\n\n${
    templateMessage || ""
  }\n\nView Property details:`;

  const propertyPath = `/property-view/${property.id}`;
  const propertyUrl = `${window.location.origin}${propertyPath}`;

  const fullMessageForShare = `${messageText}\n${propertyUrl}`;

  const [copied, setCopied] = useState(false);
  const navigate = useNavigate(); // 👈 ADD THIS

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullMessageForShare);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    const agentName = getLoggedInAgentName();
    try {
      await updateTenantAgent(tenant.id, agentName);
    } catch (err) {
      console.error("Airtable update failed", err);
    }
  };

  const handleWhatsAppClick = async () => {
    const agentName = getLoggedInAgentName();
    try {
      await updateTenantAgent(tenant.id, agentName);
    } catch (err) {
      console.error("Airtable update failed", err);
    }
  };

  return (
    <Card className="border">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium truncate">
            {property.Property_Address}
          </h4>
          <div>
            <Link to={`/property/${property.id}`}>
              <Badge variant={"default"} className="text-xs">
                View Property Details
              </Badge>
            </Link>
            &nbsp;
            <Badge
              variant="outline"
              className={`text-xs text-white ${
                property.Is_the_apartment_available === "Available"
                  ? "bg-emerald-600"
                  : "bg-gray-500"
              }`}
            >
              {property.Is_the_apartment_available || "NA"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin size={12} /> {property.Area_registered_in_Arnona || "NA"}
          <MapPin size={12} /> {property.In_which_area_is_the_property || "NA"}
          <Mail size={12} /> {property.Email || "NA"}
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="font-semibold text-sm">
            ₪{property.Asking_price || 0}/mo
          </span>
          <span className="text-xs text-muted-foreground flex gap-3">
            <span className="flex items-center gap-1">
              <Bed size={12} /> {property.How_many_rooms || 0}
            </span>
            <span className="flex items-center gap-1">
              <Building size={12} /> {property.Floor || "-"}
            </span>
            <span className="flex items-center gap-1">
              <ArrowUpDown size={12} /> {property.Elevator || "-"}
            </span>
            <span className="flex items-center gap-1">
              <Car size={12} /> {property.Parking_Type || "-"}
            </span>
          </span>
        </div>

        <div className="relative border rounded-md bg-muted/40 p-3 text-xs whitespace-pre-line">
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopy}
              className="h-7 w-7"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </Button>

            <a
              href={`https://wa.me/${formatPhoneForWhatsApp(
                tenant.Phone_number || "",
              )}?text=${encodeURIComponent(fullMessageForShare)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
            >
              <Button
                size="icon"
                className="h-7 w-7 bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle size={14} />
              </Button>
            </a>
          </div>
          <div className="space-y-1">
            <p className="whitespace-pre-line">{messageText}</p>

            <span
              onClick={() => navigate(propertyPath)}
              className="text-blue-600 underline cursor-pointer font-medium"
            >
              {propertyUrl}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------- Dashboard -------------------- */
export default function TenantDashboard() {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // <-- Tenant search term
  const navigate = useNavigate(); // 👈 ADD THIS
  const [filters, setFilters] = useState<PropertyFilters & { Status?: string }>(
    {
      minRent: 0,
      maxRent: 50000,
      bedrooms: 0,
      availability: "Available",
      Status: "Active",
      Current_Status: "all",
    },
  );

  const {
    data: tenants,
    isLoading: tLoading,
    error: tError,
  } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
    queryFn: fetchTenants,
    staleTime: 0, // ensures data is considered stale immediately
    refetchOnWindowFocus: true, // optional: refetch if user switches tab
  });

  const {
    data: properties,
    isLoading: pLoading,
    error: pError,
  } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: fetchProperties,
    staleTime: 0, // ensures data is considered stale immediately
    refetchOnWindowFocus: true, // optional: refetch if user switches tab
  });

  const {
    data: templateData,
    refetch: refetchTemplate,
    isFetching: isTemplateFetching,
  } = useQuery({
    queryKey: ["/api/templateMessage"],
    queryFn: fetchTemplateMessage,
    staleTime: 0, // ensures data is considered stale immediately
    refetchOnWindowFocus: true, // optional: refetch if user switches tab
  });

  const templateMessage = templateData || "";

  const selectedTenant = useMemo(
    () => tenants?.find((t) => t.id === selectedTenantId) || null,
    [selectedTenantId, tenants],
  );

  const parseBudgetLimits = (value: unknown): number[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value.flatMap(parseBudgetLimits);
    if (typeof value === "number" && !isNaN(value)) return [value];
    if (typeof value === "string") {
      const cleaned = value.replace(/[₪\s]/g, "").replace(/,/g, "");
      const matches = cleaned.match(/\d+/g);
      if (!matches) return [];
      return matches.map(Number).filter((n) => !isNaN(n));
    }
    return [];
  };

  const parseRoomNumbers = (value: unknown): number[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value.flatMap(parseRoomNumbers);
    if (typeof value === "number" && !isNaN(value)) return [value];
    if (typeof value === "string") {
      const matches = value.match(/\d+/g);
      if (!matches) return [];
      return matches.map(Number).filter((n) => !isNaN(n));
    }
    return [];
  };

  /* -------------------- Tenant Name Filter -------------------- */
  const filteredTenants = useMemo(() => {
    if (!tenants) return [];

    const term = searchTerm.toLowerCase();

    return tenants.filter((t) => {
      /* ---------------- Search ---------------- */
      const matchesSearch =
        t.Full_name?.toLowerCase().includes(term) ||
        t.Phone_number?.toLowerCase().includes(term);

      /* ---------------- Status ---------------- */
      const matchesStatus =
        filters.Status === "all" || t.Status === filters.Status;

      const matchesCurrentStatus =
        filters.Current_Status === "all" ||
        t.Current_Status === filters.Current_Status;

      /* ---------------- Rooms ---------------- */
      const tenantRooms = parseRoomNumbers(t.Number_of_Rooms);
      const matchesRooms =
        filters.bedrooms === 0 ||
        tenantRooms.some((r) => r >= filters.bedrooms);

      /* ---------------- Budget ---------------- */
      const tenantBudgets = parseBudgetLimits(t.Current_budget);
      const matchesBudget =
        tenantBudgets.length === 0 ||
        tenantBudgets.some((b) => b >= filters.minRent && b <= filters.maxRent);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRooms &&
        matchesBudget &&
        matchesCurrentStatus
      );
    });
  }, [tenants, searchTerm, filters]);

  const matchedProperties = useMemo(() => {
    if (!selectedTenant || !properties) return [];

    const normalize = (v?: string) => v?.toString().trim().toLowerCase() ?? "";

    const parseMultiSelect = (value?: string | string[]) => {
      if (Array.isArray(value)) {
        return value.map((v) => v.toLowerCase());
      }
      return value
        ? value
            .split(",")
            .map((v) => v.trim().toLowerCase())
            .filter(Boolean)
        : [];
    };

    const tenantBudgets = parseBudgetLimits(selectedTenant.Current_budget);
    const tenantRooms = parseRoomNumbers(selectedTenant.Number_of_Rooms);
    const tenantAreas = parseMultiSelect(
      selectedTenant.In_which_area_are_you_looking,
    );

    const BUDGET_TOLERANCE_DOWN = 1500; // allowed below tenant budget
    const BUDGET_TOLERANCE_UP = 500; // allowed above tenant budget

    return properties.filter((p) => {
      const price = Number(p.Asking_price);

      const extractNumber = (value: string | number | undefined) => {
        if (value === undefined || value === null) return 0;
        const match = value.toString().match(/[\d.]+/); // matches digits and decimal point
        return match ? parseFloat(match[0]) : 0;
      };
      const rooms = extractNumber(p.How_many_rooms);
      // const rooms = Number(p.How_many_rooms);

      if (isNaN(price) || isNaN(rooms)) return false;

      /* ---------------- Availability ---------------- */
      const isAvailabilityMatch =
        filters.availability === "all" ||
        p.Is_the_apartment_available === filters.availability;

      if (!isAvailabilityMatch) return false;

      /* ---------------- AREA (Hard gate – 25%) ---------------- */
      const propertyArea = normalize(p.In_which_area_is_the_property);
      const isAreaMatch = propertyArea && tenantAreas.includes(propertyArea);

      if (!isAreaMatch) return false;

      /* ---------------- BUDGET (Hard gate – 25%) ---------------- */
      const isBudgetMatch = tenantBudgets.some((budget) => {
        const min = budget - BUDGET_TOLERANCE_DOWN;
        const max = budget + BUDGET_TOLERANCE_UP;
        return price >= min && price <= max;
      });

      if (!isBudgetMatch) return false;

      /* ---------------- SCORING ---------------- */
      let score = 50; // Area (25) + Budget (25)
      const matchedCriteria: string[] = ["Area Match", "Within Budget"];

      /* ---------------- ROOMS (Core – 25%) ---------------- */
      const isRoomMatch = tenantRooms.some((tenantRoom) => {
        const min = tenantRoom - 0.5;
        const max = tenantRoom + 1;
        return rooms >= min && rooms <= max;
      });
      if (!isRoomMatch) return false; // ❌ reject property

      if (isRoomMatch) {
        score += 25;
        matchedCriteria.push("Rooms Match");
      }

      /* ---------------- ELEVATOR (Bonus – 12.5%) ---------------- */
      if (selectedTenant.Elevator === p.Elevator) {
        score += 12.5;
        matchedCriteria.push("Elevator Match");
      }

      /* ---------------- PARKING (Rule-based – 12.5%) ---------------- */

      const tenantParking =
        selectedTenant.Parking_Importance?.toString().trim();

      const propertyParking = p.Parking_Type?.toString().trim();

      let isParkingMatch = false;

      // Must have parking → only Private parking allowed
      if (tenantParking === "חייבת חניה (ללא חניה זה לא רלוונטי)") {
        isParkingMatch = propertyParking === "חניה פרטית";
      }

      // Desirable → Private OR Shared allowed
      else if (tenantParking === "רצוי שתהיה חניה אך לא חובה") {
        isParkingMatch =
          propertyParking === "חניה פרטית" ||
          propertyParking === "אֵין חֲנִייָה" ||
          propertyParking === "חניה משותפת / על בסיס מקום פנוי";
      }

      // No parking required → always OK
      else if (tenantParking === "אין צורך בחניה") {
        isParkingMatch = propertyParking === "אֵין חֲנִייָה";
      }

      // 🚨 HARD GATE → reject if no match
      if (!isParkingMatch) return null;

      score += 12.5;
      matchedCriteria.push("Parking Match");

      const matchPercentage = Math.round(score);

      /* ---------------- FINAL VISIBILITY RULE ---------------- */
      return matchPercentage >= 65;
    });
  }, [selectedTenant, properties, filters]);

  if (pError || tError)
    return (
      <Layout>
        <ErrorState message="Failed to load dashboard data" />
      </Layout>
    );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {pLoading || tLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Properties"
                value={properties?.length || 0}
                icon={Building2}
              />
              <StatsCard
                title="Available Properties"
                value={
                  properties?.filter(
                    (p) => p.Is_the_apartment_available === "Available",
                  ).length || 0
                }
                icon={Building2}
              />
              <StatsCard
                title="Tenants"
                value={tenants?.length || 0}
                icon={Users}
              />
              <StatsCard
                title="Active Tenants"
                value={
                  tenants?.filter((t) => t.Status === "Active").length || 0
                }
                icon={Users}
              />
              <StatsCard
                title="Matches"
                value={matchedProperties.length}
                icon={Users}
              />
              <StatsCard
                title="New Tenants Registered Today"
                value={
                  tenants?.filter((p) => {
                    if (!p.Submission_time) return false;

                    const today = new Date();
                    const submissionDate = new Date(p.Submission_time);

                    return (
                      submissionDate.getFullYear() === today.getFullYear() &&
                      submissionDate.getMonth() === today.getMonth() &&
                      submissionDate.getDate() === today.getDate()
                    );
                  }).length || 0
                }
                icon={Building2}
              />
              <StatsCard
                title="Properties Offered to Tenants"
                value={
                  tenants?.filter((p) => p.Current_Status === "מוּצָע")
                    .length || 0
                }
                icon={Building2}
                onClick={() => navigate("/tenants?status=מוּצָע")}
                className="cursor-pointer"
              />
              <StatsCard
                title="Tenant Not relevant"
                value={
                  tenants?.filter((p) => p.Current_Status === "לא רלוונטי")
                    .length || 0
                }
                icon={Building2}
                onClick={() => navigate("/tenants?status=מוּצָע")}
                className="cursor-pointer"
              />
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_1fr] gap-4 lg:gap-6">
          {/* Sidebar Filters */}
          <aside className="space-y-4 bg-white p-4 rounded shadow h-fit">
            <h2 className="text-lg font-semibold">Filters</h2>
            {/* Same filters as before */}

            {/* Tenant Search */}
            <div>
              <label className="block mb-1 text-sm font-small">חפש דייר</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter Tenant Name/Phone"
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                חדרי שינה
              </label>
              <input
                type="number"
                min={0}
                value={filters.bedrooms}
                onChange={(e) =>
                  setFilters({ ...filters, bedrooms: Number(e.target.value) })
                }
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">
                לִשְׂכּוֹר (₪)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  value={filters.minRent}
                  onChange={(e) =>
                    setFilters({ ...filters, minRent: Number(e.target.value) })
                  }
                  className="w-1/2 border p-2 rounded"
                  placeholder="Min"
                />
                <input
                  type="number"
                  min={0}
                  value={filters.maxRent}
                  onChange={(e) =>
                    setFilters({ ...filters, maxRent: Number(e.target.value) })
                  }
                  className="w-1/2 border p-2 rounded"
                  placeholder="Max"
                />
              </div>
            </div>
            <div style={{ display: "none" }}>
              <label className="block mb-1 text-sm font-medium">
                סטטוס דייר
              </label>
              <select
                value={filters.Status}
                onChange={(e) =>
                  setFilters({ ...filters, Status: e.target.value })
                }
                className="w-full border p-2 rounded"
              >
                <option value="all">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div style={{ display: "none" }}>
              <label className="block mb-1 text-sm font-medium">
                זמינות נכס
              </label>
              <select
                value={filters.availability}
                onChange={(e) =>
                  setFilters({ ...filters, availability: e.target.value })
                }
                className="w-full border p-2 rounded"
              >
                <option value="all">All</option>
                <option value="Available">Available</option>
                <option value="Rented">Rented</option>
                <option value="NA">NA</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">
                סטטוס דייר
              </label>
              <select
                value={filters.Current_Status}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    Current_Status: e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              >
                <option value="all">All</option>
                <option value="חָדָשׁ">חָדָשׁ</option>
                <option value="מוּצָע">מוּצָע</option>
                <option value="נִקרָא">נִקרָא</option>
                <option value="מְתוּאָם">מְתוּאָם</option>
                <option value="לא רלוונטי">לא רלוונטי</option>
              </select>
            </div>

            <Button
              onClick={() =>
                setFilters({
                  minRent: 0,
                  maxRent: 50000,
                  bedrooms: 0,
                  availability: "Available",
                  Status: "Active",
                  Current_Status: "all",
                })
              }
              className="w-full mt-2"
            >
              Reset Filters
            </Button>
          </aside>

          {/* Tenants */}
          <ScrollArea className="h-[65vh] lg:h-[600px] pr-2">
            {tLoading ? (
              <TenantCardSkeleton />
            ) : filteredTenants?.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Tenants Found"
                description="Add tenants to get started"
              />
            ) : (
              filteredTenants.map((t) => (
                <TenantListItem
                  key={t.id}
                  tenant={t}
                  isSelected={t.id === selectedTenantId}
                  onSelect={() => setSelectedTenantId(t.id)}
                />
              ))
            )}
          </ScrollArea>

          {/* Properties */}
          <ScrollArea className="h-[65vh] lg:h-[600px] pr-2">
            {!selectedTenant ? (
              <EmptyState
                icon={Building2}
                title="Select a Tenant"
                description="Choose a tenant to view matched properties"
              />
            ) : pLoading ? (
              <PropertyListItem
                key="skeleton1"
                property={{ id: "s1" } as Property}
                isSelected={false}
                onSelect={() => {}}
              />
            ) : matchedProperties.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No Matches"
                description="No properties match this tenant's budget and criteria"
              />
            ) : (
              <div className="space-y-3">
                {matchedProperties.map((p) => (
                  <MatchedPropertyCard
                    key={p.id}
                    property={p}
                    tenant={selectedTenant}
                    templateMessage={templateMessage}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </Layout>
  );
}
