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
  Car,
  ArrowUpDown,
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

/* -------------------- Property Card -------------------- */

function PropertyListItem({
  property,
  isSelected,
  onSelect,
}: {
  property: Property;
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
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm truncate">
            {property.Property_Address}
          </h3>
          <div className="flex gap-2">
            <Link to={`/property/${property.id}`}>
              <Badge variant={"default"} className="text-xs">
                View Property Details
              </Badge>
            </Link>
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

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
              <Car size={12} /> {property.Parking || "-"}
            </span>
          </span>
        </div>

        <Button
          size="sm"
          variant={isSelected ? "default" : "secondary"}
          className="w-full"
        >
          View Matches
        </Button>
      </CardContent>
    </Card>
  );
}

/* -------------------- Tenant Card -------------------- */

function MatchedTenantCard({
  match,
  selectedProperty,
  templateMessage,
}: {
  match: TenantMatch;
  selectedProperty: Property;
  templateMessage?: string;
}) {
  const { tenant, matchPercentage, matchedCriteria } = match;
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate(); // 👈 ADD THIS

  const messageText = templateMessage
    ? `${templateMessage}\n\nView Property details:`
    : "";

  const propertyPath = `/property-view/${selectedProperty.id}`;
  const propertyUrl = `${window.location.origin}${propertyPath}`;

  const fullMessageForShare = `${messageText}\n${propertyUrl}`;

  // const message = templateMessage
  //   ? `${templateMessage}\n\nView Property details:\n${window.location.origin}/property/${selectedProperty.id}`
  //   : "";
  // const message = templateMessage
  //   ? `${templateMessage}\n\nView Property details:\n${window.location.origin}/property/${selectedProperty.id}\n\nRegards,\nProperty Team`
  //   : "";

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
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={tenant.Profile_Photo} />
            <AvatarFallback>
              <User size={16} />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{tenant.Full_name}</h4>
            <p className="text-xs flex items-center gap-1 mt-1">
              <Phone size={12} /> {tenant.Phone_number}
            </p>
          </div>

          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {matchPercentage}%
          </div>
        </div>

        <Progress value={matchPercentage} className="h-1.5" />

        <div className="flex flex-wrap gap-1">
          {matchedCriteria.map((c) => (
            <Badge key={c} variant="secondary" className="text-xs">
              {c}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {tenant.Current_budget}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {tenant.Number_of_Rooms}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {tenant.Elevator}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {tenant.Parking}
          </Badge>
          <Badge
            variant="secondary"
            className="text-xs break-all max-w-[100%] whitespace-normal"
          >
            {tenant.In_which_area_are_you_looking}
          </Badge>
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
        <Badge variant={tenant.Status === "Active" ? "default" : "secondary"}>
          {tenant.Status ?? "Inactive"}
        </Badge>
      </CardContent>
    </Card>
  );
}

/* -------------------- Dashboard with Filters -------------------- */

export default function Dashboard() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );

  // Sidebar filters state
  const [filters, setFilters] = useState<PropertyFilters>({
    minRent: 0,
    maxRent: 50000,
    bedrooms: 0,
    elevator: null,
    parking: null,
    balcony: null,
    availability: "Available",
    tenantStatus: "all", // 👈 ADD
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

  const maxRent = useMemo(() => {
    if (!properties?.length) return 50000;
    return Math.max(...properties.map((p) => p.Asking_price || 0));
  }, [properties]);

  // Apply sidebar filters
  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    return properties.filter((p) => {
      if (filters.bedrooms && (p.How_many_rooms || 0) < filters.bedrooms)
        return false;
      if (filters.minRent && (p.Asking_price || 0) < filters.minRent)
        return false;
      if (filters.maxRent && (p.Asking_price || 0) > filters.maxRent)
        return false;
      // מעלית
      if (filters.elevator && p.Elevator !== filters.elevator) return false;

      // חניה
      if (filters.parking && p.Parking !== filters.parking) return false;

      // מרפסת
      if (filters.balcony && p.Is_there_a_balcony !== filters.balcony)
        return false;
      if (
        filters.availability !== "all" &&
        p.Is_the_apartment_available !== filters.availability
      )
        return false;
      return true;
    });
  }, [properties, filters]);

  const selectedProperty = useMemo(
    () => filteredProperties.find((p) => p.id === selectedPropertyId) || null,
    [selectedPropertyId, filteredProperties]
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
  const matches = useMemo(() => {
    if (!selectedProperty || !tenants) return [];

    const propertyPrice = Number(selectedProperty.Asking_price);
    const propertyRooms = Number(selectedProperty.How_many_rooms);

    if (isNaN(propertyPrice) || isNaN(propertyRooms)) return [];

    const propertyArea =
      selectedProperty.In_which_area_is_the_property?.toString()
        .trim()
        .toLowerCase();

    const parseMultiSelect = (value?: string) =>
      value
        ? value
            .split(",")
            .map((v) => v.trim().toLowerCase())
            .filter(Boolean)
        : [];

    const BUDGET_TOLERANCE_DOWN = 1500; // allowed below tenant budget
    const BUDGET_TOLERANCE_UP = 500; // allowed above tenant budget

    return tenants
      .filter((tenant) => {
        if (
          filters.tenantStatus !== "all" &&
          tenant.Status !== filters.tenantStatus
        ) {
          return false;
        }
        return true;
      })
      .map((tenant) => {
        let score = 0;
        const matchedCriteria: string[] = [];

        const tenantBudgets = parseBudgetLimits(tenant.Current_budget);
        const tenantRooms = parseRoomNumbers(tenant.Number_of_Rooms);

        const tenantAreas = Array.isArray(tenant.In_which_area_are_you_looking)
          ? tenant.In_which_area_are_you_looking.map((v: string) =>
              v.toLowerCase()
            )
          : parseMultiSelect(tenant.In_which_area_are_you_looking);

        /* ---------------- AREA (Hard gate) ---------------- */
        const isAreaMatch =
          !!propertyArea && tenantAreas.includes(propertyArea);

        if (!isAreaMatch) return null;

        score += 25;
        matchedCriteria.push("Area Match");

        /* ---------------- BUDGET (Hard gate) ---------------- */

        const isBudgetMatch = tenantBudgets.some((budget) => {
          const min = budget - BUDGET_TOLERANCE_DOWN;
          const max = budget + BUDGET_TOLERANCE_UP;
          return propertyPrice >= min && propertyPrice <= max;
        });

        if (!isBudgetMatch) return null;

        score += 25;
        matchedCriteria.push("Within Budget");

        /* ---------------- ROOMS (Core score) ---------------- */
        const isRoomsMatch = tenantRooms.some(
          (r) => r === propertyRooms || r - 1 === propertyRooms
        );

        if (isRoomsMatch) {
          score += 25;
          matchedCriteria.push("Rooms Match");
        }

        /* ---------------- ELEVATOR (Bonus) ---------------- */
        if (tenant.Elevator === selectedProperty.Elevator) {
          score += 12.5;
          matchedCriteria.push("Elevator Match");
        }

        /* ---------------- PARKING (Bonus) ---------------- */
        if (tenant.Parking === selectedProperty.Parking) {
          score += 12.5;
          matchedCriteria.push("Parking Match");
        }

        return {
          tenant,
          matchPercentage: Math.round(score),
          matchedCriteria,
          isMatch: true, // already passed hard gates
        };
      })
      .filter(Boolean)
      .filter((m: any) => m.matchPercentage >= 65);
  }, [selectedProperty, tenants, filters.tenantStatus]);

  // const matches = useMemo(() => {
  //   if (!selectedProperty || !tenants) return [];

  //   const propertyPrice = Number(selectedProperty.Asking_price);
  //   const propertyRooms = Number(selectedProperty.How_many_rooms);

  //   if (isNaN(propertyPrice) || isNaN(propertyRooms)) return [];

  //   const propertyArea =
  //     selectedProperty.In_which_area_is_the_property?.toString()
  //       .trim()
  //       .toLowerCase();

  //   const parseMultiSelect = (value?: string) =>
  //     value
  //       ? value
  //           .split(",")
  //           .map((v) => v.trim().toLowerCase())
  //           .filter(Boolean)
  //       : [];

  //   const BUDGET_TOLERANCE = 500;

  //   return tenants
  //     .filter((tenant) => {
  //       if (
  //         filters.tenantStatus !== "all" &&
  //         tenant.Status !== filters.tenantStatus
  //       ) {
  //         return false;
  //       }
  //       return true;
  //     })
  //     .map((tenant) => {
  //       let score = 0;
  //       const matchedCriteria: string[] = [];

  //       const tenantBudgets = parseBudgetLimits(tenant.Current_budget);
  //       const tenantRooms = parseRoomNumbers(tenant.Number_of_Rooms);

  //       const tenantAreas = Array.isArray(tenant.In_which_area_are_you_looking)
  //         ? tenant.In_which_area_are_you_looking.map((v: string) =>
  //             v.toLowerCase()
  //           )
  //         : parseMultiSelect(tenant.In_which_area_are_you_looking);

  //       /* ---------------- AREA (25%) ---------------- */
  //       const isAreaMatch =
  //         !!propertyArea && tenantAreas.includes(propertyArea);

  //       if (!isAreaMatch) {
  //         return null; // ❌ hard stop
  //       }

  //       score += 25;
  //       matchedCriteria.push("Area Match");

  //       /* ---------------- BUDGET (25%) ---------------- */
  //       const isBudgetMatch = tenantBudgets.some(
  //         (budget) => propertyPrice <= budget + BUDGET_TOLERANCE
  //       );

  //       if (!isBudgetMatch) {
  //         return null; // ❌ hard stop
  //       }

  //       score += 25;
  //       matchedCriteria.push("Within Budget");

  //       /* ---------------- ROOMS (25%) ---------------- */
  //       const isRoomsMatch = tenantRooms.some(
  //         (r) => r === propertyRooms || r - 1 === propertyRooms
  //       );

  //       if (isRoomsMatch) {
  //         score += 25;
  //         matchedCriteria.push("Rooms Match");
  //       }

  //       /* ---------------- ELEVATOR (12.5%) ---------------- */
  //       const isElevatorMatch =
  //         isRoomsMatch && tenant.Elevator === selectedProperty.Elevator;

  //       if (isElevatorMatch) {
  //         score += 12.5;
  //         matchedCriteria.push("Elevator Match");
  //       }

  //       /* ---------------- PARKING (12.5%) ---------------- */
  //       const isParkingMatch =
  //         isRoomsMatch && tenant.Parking === selectedProperty.Parking;

  //       if (isParkingMatch) {
  //         score += 12.5;
  //         matchedCriteria.push("Parking Match");
  //       }

  //       return {
  //         tenant,
  //         matchPercentage: Math.round(score),
  //         matchedCriteria,
  //         isMatch: score >= 65, // Area + Budget minimum
  //       };
  //     })
  //     .filter(Boolean)
  //     .filter((m: any) => m.isMatch);
  // }, [selectedProperty, tenants, filters.tenantStatus]);

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
          {pLoading ? (
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
              <StatsCard title="Matches" value={matches.length} icon={Users} />
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_1fr] gap-6">
          {/* Sidebar Filters */}
          <aside className="space-y-4 bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold">Filters</h2>

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
              <label className="block mb-1 text-sm font-medium">Elevator</label>
              <select
                value={filters.elevator ?? "all"}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    elevator: e.target.value === "all" ? null : e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              >
                <option value="all">הכל</option>
                <option value="כן">כֵּן</option>
                <option value="לֹא">לא</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Parking</label>
              <select
                value={filters.parking ?? "all"}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    parking: e.target.value === "all" ? null : e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              >
                <option value="all">הכל</option>
                <option value="פרטי">פרטי</option>
                <option value="אין">אין</option>
                <option value="משותף">משותף</option>
                <option value="עוקב">עוקב</option>
                <option value="2 חניות">2 חניות</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Balcony</label>
              <select
                value={filters.balcony ?? "all"}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    balcony: e.target.value === "all" ? null : e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              >
                <option value="all">הכל</option>
                <option value="כן">כן</option>
                <option value="לא">לא</option>
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
            <div>
              <label className="block mb-1 text-sm font-medium">
                Tenant Status
              </label>
              <select
                value={filters.tenantStatus}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    tenantStatus: e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              >
                <option value="all">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <Button
              onClick={() =>
                setFilters({
                  minRent: 0,
                  maxRent: maxRent || 50000,
                  bedrooms: 0,
                  elevator: null,
                  parking: null,
                  balcony: null,
                  availability: "Available",
                  tenantStatus: "all",
                })
              }
              className="w-full mt-2"
            >
              Reset Filters
            </Button>
          </aside>

          {/* Properties */}
          <ScrollArea className="h-[600px] pr-3">
            <div className="space-y-3">
              {pLoading ? (
                <>
                  <PropertyListItem
                    key="skeleton1"
                    property={{ id: "s1" } as Property}
                    isSelected={false}
                    onSelect={() => {}}
                  />
                  <PropertyListItem
                    key="skeleton2"
                    property={{ id: "s2" } as Property}
                    isSelected={false}
                    onSelect={() => {}}
                  />
                </>
              ) : filteredProperties.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No Properties Found"
                  description="Adjust your filters to see more properties"
                  action={{
                    label: "Reset Filters",
                    onClick: () =>
                      setFilters({
                        minRent: 0,
                        maxRent: maxRent || 50000,
                        bedrooms: 0,
                        elevator: null,
                        parking: null,
                        balcony: null,
                        availability: "all",
                      }),
                  }}
                />
              ) : (
                filteredProperties.map((p) => (
                  <PropertyListItem
                    key={p.id}
                    property={p}
                    isSelected={p.id === selectedPropertyId}
                    onSelect={() => setSelectedPropertyId(p.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>

          {/* Tenants */}
          <ScrollArea className="h-[600px] pr-3">
            {!selectedProperty ? (
              <EmptyState
                icon={Users}
                title="Select a Property"
                description="Choose a property to view matched tenants"
              />
            ) : tLoading ? (
              <TenantCardSkeleton />
            ) : matches.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Matches"
                description="No tenants match this property's budget and criteria"
              />
            ) : (
              <div className="space-y-3">
                {matches.map((m) => (
                  <MatchedTenantCard
                    key={m.tenant.id}
                    match={m}
                    selectedProperty={selectedProperty}
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
