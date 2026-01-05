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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchPropertyById, fetchProperties } from "@/lib/airtable"; // <-- added fetchProperties
import type { Property } from "@/lib/types";
import { LoadingSpinner } from "@/components/loading";
import { ErrorState } from "@/components/error-state";
import { PropertyMap } from "@/pages/property-map";

export default function PropertyUserView() {
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
      <ErrorState
        message="Failed to load property details."
        onRetry={() => refetchProperty()}
      />
    );
  if (propertyLoading) return <LoadingSpinner />;
  if (!property) return <ErrorState message="Property not found." />;

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
  interface CarouselProps {
    images: string[];
  }

  function Carousel({ images }: CarouselProps) {
    const [current, setCurrent] = useState(0);

    const prevSlide = () => {
      setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextSlide = () => {
      setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    if (!images || images.length === 0) return null;

    return (
      <div className="relative w-full">
        {/* Slides */}
        <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden rounded">
          {images.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-transform duration-500 ${
                index === current
                  ? "translate-x-0 z-10"
                  : "translate-x-full z-0"
              }`}
            >
              <img
                src={img}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Controls inside slide container */}
          {images.length > 1 && (
            <>
              <button
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 z-20"
                onClick={prevSlide}
              >
                &#10094;
              </button>
              <button
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 z-20"
                onClick={nextSlide}
              >
                &#10095;
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background mt-10">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4">
          {" "}
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              {/* <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link> */}
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
              <Carousel
                images={
                  property.Property_Image?.map((img) => img.url) || [
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80",
                  ]
                }
              />
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* General Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>מידע כללי</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    {/* <div>
                      <span className="text-sm text-muted-foreground">
                        מזהה הגשה
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Submission_ID)}
                      </p>
                    </div> */}
                    <div>
                      <span className="text-sm text-muted-foreground">
                        תאריך פגישה
                      </span>
                      <p className="font-medium">
                        {formatDate(property.Meeting_Date)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        סוֹכֵן
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Agent)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        מיקום מפגש
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Meeting_Location)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Owner & Contact */}
                {/* <Card>
                  <CardHeader>
                    <CardTitle>בעלים ויצירת קשר</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        שם הבעלים
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Property_owner_name)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        טֵלֵפוֹן
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Phone_Number)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        אֶלֶקטרוֹנִי
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Email)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        עם מי יש לך עסק
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Who_are_you_dealing_with)}
                      </p>
                    </div>
                  </CardContent>
                </Card> */}

                {/* Property Specs */}
                <Card>
                  <CardHeader>
                    <CardTitle>מפרט נכס</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        כְּתוֹבֶת
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Property_Address)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        קוֹמָה
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Floor)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        קומות בבניין
                      </span>
                      <p className="font-medium">
                        {formatValue(property.How_many_floors_in_the_building)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        דירות בבניין
                      </span>
                      <p className="font-medium">
                        {formatValue(
                          property.How_many_apartments_in_the_building
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        חדרים
                      </span>
                      <p className="font-medium">
                        {formatValue(property.How_many_rooms)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        אזור בפועל
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Actual_area)} m²
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        כיווני אוויר
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Air_directions)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        מַעֲלִית
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Elevator)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        חֲנָיָה
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Parking)}
                      </p>
                    </div>
                    {/* <div>
                      <span className="text-sm text-muted-foreground">
                        באיזה_אזור_הוא_הנכס
                      </span>
                      <p className="font-medium">
                        {formatValue(property.In_which_area_is_the_property)}
                      </p>
                    </div> */}
                  </CardContent>
                </Card>

                {/* Balcony & Storage */}
                <Card>
                  <CardHeader>
                    <CardTitle>מרפסת ומחסן</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        מִרפֶּסֶת
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Is_there_a_balcony)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        סוג מרפסת
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Balcony_type)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        גודל מרפסת
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Balcony_size)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        אִחסוּן
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Storage)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        רְהִיטִים
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Furniture)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        מיזוג אוויר
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
                    <CardTitle>זמינות ומצב</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        זָמִין
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Is_the_apartment_available)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        תאריך כניסה
                      </span>
                      <p className="font-medium">
                        {formatDate(property.Entry_date)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        חיבור גז
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Gas_connection)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        רחוב שקט
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Quiet_street)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        תמ"א מצורפת
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Is_TAMA_attached)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        תמ"א בתהליך
                      </span>
                      <p className="font-medium">
                        {formatValue(
                          property.Is_the_building_in_the_process_of_TAMA
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        תאריך TAMA צפוי
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
                    <CardTitle>פיננסי וחוזה</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        מחיר השכירות אחרון
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Last_rental_price)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        וַעֲדָה
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Committee_of_the_House)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        מיסים דו-חודשיים
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Bi_monthly_municipal_taxes)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        תקופת תשלום
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Payment_term)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        ערבות בנקאית
                      </span>
                      <p className="font-medium">
                        {formatValue(property.A_bank_guarantee)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        הערת אבטחה
                      </span>
                      <p className="font-medium">
                        {formatValue(property.A_security_note_for_the_sum)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        ערבים
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Guarantors_to_the_contract)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        תקופת החוזה
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
                    <CardTitle>הערות ומחיר</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        בעלים שוקל למכור
                      </span>
                      <p className="font-medium">
                        {formatValue(
                          property.Is_the_owner_considering_selling_the_apartment
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        ליקויים ותיקונים
                      </span>
                      <p className="font-medium">
                        {formatValue(
                          property.Defects_and_repairs_to_be_carried_out
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        הערות כלליות
                      </span>
                      <p className="font-medium">
                        {formatValue(property.General_comments)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        מחיר מומלץ
                      </span>
                      <p className="font-medium">
                        {formatValue(property.Recommended_price)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        מחיר מבוקש
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
                    <CardTitle>תכונות מפתח</CardTitle>
                  </CardHeader>

                  <CardContent className="grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-[24px_1fr] items-center gap-3">
                      <Sofa className="h-5 w-5 text-muted-foreground" />
                      <span>
                        <b>מְרוּהָט</b>: {formatValue(property.Furniture)}
                      </span>
                    </div>

                    <div className="grid grid-cols-[24px_1fr] items-center gap-3">
                      <Car className="h-5 w-5 text-muted-foreground" />
                      <span>
                        <b>חֲנָיָה</b>: {formatValue(property.Parking)}
                      </span>
                    </div>

                    <div className="grid grid-cols-[24px_1fr] items-center gap-3">
                      <Wind className="h-5 w-5 text-muted-foreground" />
                      <span>
                        <b>מיזוג אוויר</b>:{" "}
                        {formatValue(property.Air_conditioning)}
                      </span>
                    </div>

                    <div className="grid grid-cols-[24px_1fr] items-center gap-3">
                      <Layers className="h-5 w-5 text-muted-foreground" />
                      <span>
                        <b>מִרפֶּסֶת</b>:{" "}
                        {formatValue(property.Is_there_a_balcony)}
                      </span>
                    </div>

                    <div className="grid grid-cols-[24px_1fr] items-center gap-3">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <span>
                        <b>מַעֲלִית</b>: {formatValue(property.Elevator)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* <PropertyMap
                  latitude={property.Latitude}
                  longitude={property.Longitude}
                  address={property.Property_Address}
                /> */}
              </div>
            </div>

            {/* -------------------- Similar Properties Section -------------------- */}
            {/* Similar Properties */}
            {property && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>מאפיינים דומים</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {similarLoading && <LoadingSpinner />}
                  {similarError && (
                    <p className="text-red-500">טעינת מאפיינים דומים נכשלה.</p>
                  )}
                  {!similarLoading && similarProperties?.length === 0 && (
                    <p>לא נמצאו נכסים דומים.</p>
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
                            <MapPin className="inline mr-1" />{" "}
                            {p.Property_Address}
                          </p>
                          <p>חדרים: {p.How_many_rooms || "-"}</p>
                          <p>מְחִיר: {p.Asking_price || "-"}</p>
                          <Link to={`/property-view/${p.id}`}>
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
        </div>
      </header>
    </div>
  );
}
