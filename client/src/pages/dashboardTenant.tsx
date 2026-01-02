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
  propertyUrl: string
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
  return (
    <Card
      onClick={onSelect}
      className={`cursor-pointer border transition-shadow ${
        isSelected
          ? "border-slate-400 bg-slate-50 dark:bg-slate-900"
          : "hover:shadow-sm"
      }`}
    >
      <CardContent className="p-4 space-y-2 flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={tenant.Profile_Photo} />
          <AvatarFallback>
            <User size={16} />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{tenant.Full_name}</h3>
          <p className="text-xs flex items-center gap-1 mt-1">
            <Phone size={12} /> {tenant.Phone_number}
          </p>
          <p className="text-xs flex items-center gap-1 mt-1">
            <Bed size={12} /> {tenant.Number_of_Rooms}
          </p>
          <p className="text-xs flex items-center gap-1 mt-1">
            ₪{tenant.Current_budget || "-"}/mo
          </p>
        </div>
        <Badge variant={tenant.Status === "Active" ? "default" : "secondary"}>
          {tenant.Status ?? "Inactive"}
        </Badge>
        <Button size="sm" variant={isSelected ? "default" : "secondary"}>
          View Matches
        </Button>
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
  // const message = generateDefaultMessage(
  //   tenant.Full_name || "there",
  //   property.Property_Address || "Property",
  //   `${window.location.origin}/property/${property.id}`
  // );
  // const message = templateMessage
  //   ? `${templateMessage}\n\nView Property details:\n${window.location.origin}/property/${property.id}`
  //   : "";

  const messageText = templateMessage
    ? `${templateMessage}\n\nView Property details:`
    : "";

  const propertyPath = `/property-view/${property.id}`;
  const propertyUrl = `${window.location.origin}${propertyPath}`;

  const fullMessageForShare = `${messageText}\n${propertyUrl}`;

  const [copied, setCopied] = useState(false);
  const navigate = useNavigate(); // 👈 ADD THIS

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullMessageForShare);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
          <Mail size={12} /> {property.Email || "Unknown Area"}
          <MapPin size={12} />{" "}
          {property.Area_registered_in_Arnona || "Unknown Area"}
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
                tenant.Phone_number || ""
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

  const [filters, setFilters] = useState<PropertyFilters & { Status?: string }>(
    {
      minRent: 0,
      maxRent: 50000,
      bedrooms: 0,
      availability: "all",
      Status: "all",
    }
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
    [selectedTenantId, tenants]
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

      return matchesSearch && matchesStatus && matchesRooms && matchesBudget;
    });
  }, [tenants, searchTerm, filters]);

  // Filter properties that match selected tenant
  const matchedProperties = useMemo(() => {
    if (!selectedTenant || !properties) return [];

    const tenantBudgets = parseBudgetLimits(selectedTenant.Current_budget);
    const tenantRooms = parseRoomNumbers(selectedTenant.Number_of_Rooms);

    return properties.filter((p) => {
      const price = Number(p.Asking_price);
      const rooms = Number(p.How_many_rooms);

      if (isNaN(price) || isNaN(rooms)) return false;

      const isAvailabilityMatch =
        filters.availability === "all" ||
        p.Is_the_apartment_available === filters.availability;

      const isPriceMatch =
        tenantBudgets.length === 0 ||
        tenantBudgets.some((b) => price >= filters.minRent && price <= b);

      const isRoomMatch =
        tenantRooms.length === 0 || tenantRooms.some((r) => rooms >= r);

      return isAvailabilityMatch && isPriceMatch && isRoomMatch;
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                    (p) => p.Is_the_apartment_available === "Available"
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
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_1fr] gap-6">
          {/* Sidebar Filters */}
          <aside className="space-y-4 bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold">Filters</h2>
            {/* Same filters as before */}

            {/* Tenant Search */}
            <div>
              <label className="block mb-1 text-sm font-small">
                Search Tenant
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter Tenant Name/Phone"
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Bedrooms</label>
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
              <label className="block mb-1 text-sm font-medium">Rent (₪)</label>
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
            <div>
              <label className="block mb-1 text-sm font-medium">
                Tenant Status
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
            <div>
              <label className="block mb-1 text-sm font-medium">
                Property Availability
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

            <Button
              onClick={() =>
                setFilters({
                  minRent: 0,
                  maxRent: 50000,
                  bedrooms: 0,
                  availability: "all",
                })
              }
              className="w-full mt-2"
            >
              Reset Filters
            </Button>
          </aside>

          {/* Tenants */}
          <ScrollArea className="h-[600px] pr-3">
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
          <ScrollArea className="h-[600px] pr-3">
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
