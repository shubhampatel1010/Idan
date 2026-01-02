import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  Bed,
  Bath,
  Ruler,
  MapPin,
  Building,
  ArrowLeft,
  Car,
  Sofa,
  Layers,
  Wind,
} from "lucide-react";
import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchPropertyById, fetchProperties } from "@/lib/airtable"; // <-- added fetchProperties
import type { Property } from "@/lib/types";
import { LoadingSpinner } from "@/components/loading";
import { ErrorState } from "@/components/error-state";
import { PropertyMap } from "@/pages/property-map";

export default function PropertyView() {
  const params = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    data: property,
    isLoading: propertyLoading,
    error: propertyError,
    refetch: refetchProperty,
  } = useQuery<Property>({
    queryKey: ["/api/property", params.id],
    queryFn: () => fetchPropertyById(params.id!),
    enabled: !!params.id,
  });

  // Fetch similar properties (top 5 within ±1000 of Asking_price)
  const {
    data: similarProperties,
    isLoading: similarLoading,
    error: similarError,
  } = useQuery<Property[]>({
    queryKey: ["/api/properties", property?.Asking_price],
    queryFn: () =>
      fetchProperties().then((all) => {
        if (!property?.Asking_price) return [];
        const minPrice = Number(property.Asking_price) - 1000;
        const maxPrice = Number(property.Asking_price) + 1000;
        return all
          .filter(
            (p) =>
              p.id !== property.id &&
              p.Asking_price !== undefined &&
              p.Asking_price >= minPrice &&
              p.Asking_price <= maxPrice
          )
          .slice(0, 5); // top 5
      }),
    enabled: !!property,
  });

  if (propertyError)
    return (
      <Layout>
        <ErrorState
          message="Failed to load property details."
          onRetry={() => refetchProperty()}
        />
      </Layout>
    );
  if (propertyLoading)
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  if (!property)
    return (
      <Layout>
        <ErrorState message="Property not found." />
      </Layout>
    );

  const images = property.Property_Image
    ? [property.Property_Image?.[0]?.url ?? ""]
    : [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80",
      ];

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") return value.toString();
    return value;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Immediately";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {property.Property_owner_name || "Unnamed Property"}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{property.Property_Address || "Unknown location"}</span>
            </div>
          </div>
        </div>

        {/* Images */}
        <Card className="overflow-hidden">
          <div className="relative aspect-video bg-muted">
            <img
              src={images[currentImageIndex]}
              alt={`Property Image ${currentImageIndex + 1}`}
              className="object-cover w-full h-full"
            />
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev === 0 ? images.length - 1 : prev - 1
                    )
                  }
                >
                  &lt;
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev === images.length - 1 ? 0 : prev + 1
                    )
                  }
                >
                  &gt;
                </Button>
              </>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Info */}
            <Card>
              <CardHeader>
                <CardTitle>General Info</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Submission ID
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Submission_ID)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Meeting Date
                  </span>
                  <p className="font-medium">
                    {formatDate(property.Meeting_Date)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Agent</span>
                  <p className="font-medium">{formatValue(property.Agent)}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Meeting Location
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Meeting_Location)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Owner & Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Owner & Contact</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Owner Name
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Property_owner_name)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Phone</span>
                  <p className="font-medium">
                    {formatValue(property.Phone_Number)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Email</span>
                  <p className="font-medium">{formatValue(property.Email)}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Who Are You Dealing With
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Who_are_you_dealing_with)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Property Specs */}
            <Card>
              <CardHeader>
                <CardTitle>Property Specs</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Address</span>
                  <p className="font-medium">
                    {formatValue(property.Property_Address)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Floor</span>
                  <p className="font-medium">{formatValue(property.Floor)}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Floors in Building
                  </span>
                  <p className="font-medium">
                    {formatValue(property.How_many_floors_in_the_building)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Apartments in Building
                  </span>
                  <p className="font-medium">
                    {formatValue(property.How_many_apartments_in_the_building)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Rooms</span>
                  <p className="font-medium">
                    {formatValue(property.How_many_rooms)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Actual Area
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Actual_area)} m²
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Air Directions
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Air_directions)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Elevator
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Elevator)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Parking</span>
                  <p className="font-medium">{formatValue(property.Parking)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Balcony & Storage */}
            <Card>
              <CardHeader>
                <CardTitle>Balcony & Storage</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Balcony</span>
                  <p className="font-medium">
                    {formatValue(property.Is_there_a_balcony)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Balcony Type
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Balcony_type)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Balcony Size
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Balcony_size)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Storage</span>
                  <p className="font-medium">{formatValue(property.Storage)}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Furniture
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Furniture)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Air Conditioning
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Air_conditioning)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Availability & Status */}
            <Card>
              <CardHeader>
                <CardTitle>Availability & Status</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Available
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Is_the_apartment_available)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Entry Date
                  </span>
                  <p className="font-medium">
                    {formatDate(property.Entry_date)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Gas Connection
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Gas_connection)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Quiet Street
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Quiet_street)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    TAMA Attached
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Is_TAMA_attached)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    TAMA in Process
                  </span>
                  <p className="font-medium">
                    {formatValue(
                      property.Is_the_building_in_the_process_of_TAMA
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Expected TAMA Date
                  </span>
                  <p className="font-medium">
                    {formatDate(property.When_is_the_TAMA_expected)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Financial & Contract */}
            <Card>
              <CardHeader>
                <CardTitle>Financial & Contract</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Last Rental Price
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Last_rental_price)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Committee
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Committee_of_the_House)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Bi-monthly Taxes
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Bi_monthly_municipal_taxes)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Payment Term
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Payment_term)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Bank Guarantee
                  </span>
                  <p className="font-medium">
                    {formatValue(property.A_bank_guarantee)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Security Note
                  </span>
                  <p className="font-medium">
                    {formatValue(property.A_security_note_for_the_sum)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Guarantors
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Guarantors_to_the_contract)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Contract Term
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Contract_term)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Comments & Price */}
            <Card>
              <CardHeader>
                <CardTitle>Comments & Price</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Owner Considering Selling
                  </span>
                  <p className="font-medium">
                    {formatValue(
                      property.Is_the_owner_considering_selling_the_apartment
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Defects & Repairs
                  </span>
                  <p className="font-medium">
                    {formatValue(
                      property.Defects_and_repairs_to_be_carried_out
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    General Comments
                  </span>
                  <p className="font-medium">
                    {formatValue(property.General_comments)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Recommended Price
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Recommended_price)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Asking Price
                  </span>
                  <p className="font-medium">
                    {formatValue(property.Asking_price)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Key Features */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>

              <CardContent className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-[24px_1fr] items-center gap-3">
                  <Sofa className="h-5 w-5 text-muted-foreground" />
                  <span><b>Furnished</b>: {formatValue(property.Furniture)}</span>
                </div>

                <div className="grid grid-cols-[24px_1fr] items-center gap-3">
                  <Car className="h-5 w-5 text-muted-foreground" />
                  <span><b>Parking</b>: {formatValue(property.Parking)}</span>
                </div>

                <div className="grid grid-cols-[24px_1fr] items-center gap-3">
                  <Wind className="h-5 w-5 text-muted-foreground" />
                  <span>
                     <b>Air Conditioning</b>: {formatValue(property.Air_conditioning)}
                  </span>
                </div>

                <div className="grid grid-cols-[24px_1fr] items-center gap-3">
                  <Layers className="h-5 w-5 text-muted-foreground" />
                  <span>
                    <b>Balcony</b>: {formatValue(property.Is_there_a_balcony)}
                  </span>
                </div>

                <div className="grid grid-cols-[24px_1fr] items-center gap-3">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <span><b>Elevator</b>: {formatValue(property.Elevator)}</span>
                </div>
              </CardContent>
            </Card>

            <PropertyMap
              latitude={property.Latitude}
              longitude={property.Longitude}
              address={property.Property_Address}
            />
          </div>
        </div>

        {/* -------------------- Similar Properties Section -------------------- */}
        {/* Similar Properties */}
        {property && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Similar Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {similarLoading && <LoadingSpinner />}
              {similarError && (
                <p className="text-red-500">
                  Failed to load similar properties.
                </p>
              )}
              {!similarLoading && similarProperties?.length === 0 && (
                <p>No similar properties found.</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {similarProperties?.map((p) => (
                  <Card key={p.id}>
                    <img
                      src={
                        p.Property_Image?.[0]?.url ||
                        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&auto=format&fit=crop&q=80"
                      }
                      alt={p.Property_owner_name}
                      className="object-cover w-full h-40 rounded"
                    />
                    <CardHeader>
                      <CardTitle>
                        {p.Property_owner_name || "Unnamed Property"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <p>
                        <MapPin className="inline mr-1" /> {p.Property_Address}
                      </p>
                      <p>Rooms: {p.How_many_rooms || "-"}</p>
                      <p>Price: {p.Asking_price || "-"}</p>
                      <Link to={`/property/${p.id}`}>
                        <Button size="sm" className="mt-2 w-full">
                          View
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
