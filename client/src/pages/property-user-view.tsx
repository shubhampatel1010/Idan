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
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchPropertyById, fetchProperties } from "@/lib/airtable"; // <-- added fetchProperties
import type { Property } from "@/lib/types";
import { LoadingSpinner } from "@/components/loading";
import { ErrorState } from "@/components/error-state";
import { PropertyMap } from "@/pages/property-map";
import { FaInstagram, FaTiktok } from "react-icons/fa";

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
              p.Asking_price <= maxPrice,
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
    const [isOpen, setIsOpen] = useState(false);

    const prevSlide = () => {
      setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextSlide = () => {
      setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const openModal = (index: number) => {
      setCurrent(index);
      setIsOpen(true);
    };

    const closeModal = () => {
      setIsOpen(false);
    };

    // Close on ESC key
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeModal();
        if (e.key === "ArrowRight") nextSlide();
        if (e.key === "ArrowLeft") prevSlide();
      };

      if (isOpen) {
        window.addEventListener("keydown", handleKeyDown);
      }

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [isOpen]);

    if (!images || images.length === 0) return null;

    return (
      <>
        {/* ================= NORMAL CAROUSEL ================= */}
        <div className="relative w-full">
          <div className="relative w-full h-[400px] overflow-hidden rounded">
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
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openModal(index)}
                />
              </div>
            ))}

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

        {/* ================= FULLSCREEN MODAL ================= */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999]"
            onClick={closeModal}
          >
            <div
              className="relative max-w-6xl w-full px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[current]}
                alt="Full Preview"
                className="w-full max-h-[90vh] object-contain rounded"
              />

              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-white text-3xl"
                onClick={closeModal}
              >
                ✕
              </button>

              {/* Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-white text-4xl"
                    onClick={prevSlide}
                  >
                    &#10094;
                  </button>

                  <button
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-white text-4xl"
                    onClick={nextSlide}
                  >
                    &#10095;
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  const InfoField = ({
    label,
    value,
    isDate = false,
    suffix = "",
  }: {
    label: string;
    value: any;
    isDate?: boolean;
    suffix?: string;
  }) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return null; // ❌ Hide field completely
    }

    return (
      <div>
        <span className="text-sm text-muted-foreground">{label}</span>
        <p className="font-medium">
          {isDate ? formatDate(value) : formatValue(value)} {suffix}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background mt-10">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4">
          {" "}
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4"></div>

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* General Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>מידע כללי</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4">
                    <InfoField
                      label="מחיר מבוקש"
                      value={property.Asking_price}
                    />
                    <InfoField
                      label="אזור בפועל"
                      value={property.Actual_area}
                      suffix="m²"
                    />
                    <InfoField label="חדרים" value={property.How_many_rooms} />
                    <InfoField label="רחוב שקט" value={property.Quiet_street} />
                    <InfoField
                      label="קומות בבניין"
                      value={property.How_many_floors_in_the_building}
                    />
                    <InfoField label="מַעֲלִית" value={property.Elevator} />
                    <InfoField label="סוג חניה" value={property.Parking_Type} />
                    <InfoField
                      label="סוג מרפסת"
                      value={property.Balcony_type}
                    />
                    <InfoField
                      label="גודל מרפסת"
                      value={property.Balcony_size}
                    />
                    <InfoField
                      label="זָמִין"
                      value={property.Is_the_apartment_available}
                    />
                    <InfoField
                      label="תאריך כניסה"
                      value={property.Entry_date}
                      isDate
                    />
                    <InfoField
                      label="תאריך פגישה"
                      value={property.Meeting_Date}
                      isDate
                    />
                    <InfoField label="סוֹכֵן" value={property.Agent} />
                    <InfoField
                      label="מיקום מפגש"
                      value={property.Meeting_Location}
                    />
                    <div className="flex gap-4 mt-4">
                      {property.Instagram_link && (
                        <a
                          href={property.Instagram_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaInstagram size={28} />
                        </a>
                      )}

                      {property.TikTok_link && (
                        <a
                          href={property.TikTok_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaTiktok size={28} />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Property Specs */}
                <Card>
                  <details>
                    <summary>
                      <CardHeader>
                        <CardTitle>מפרט נכס</CardTitle>
                      </CardHeader>
                    </summary>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <InfoField label="קוֹמָה" value={property.Floor} />
                      <InfoField
                        label="דירות בבניין"
                        value={property.How_many_apartments_in_the_building}
                      />
                      <InfoField
                        label="כְּתוֹבֶת"
                        value={property.Property_Address}
                      />
                      <InfoField
                        label="כיווני אוויר"
                        value={property.Air_directions}
                      />
                    </CardContent>
                  </details>
                </Card>

                {/* Balcony & Storage */}
                <Card>
                  <details>
                    <summary>
                      <CardHeader>
                        <CardTitle>מרפסת ומחסן</CardTitle>
                      </CardHeader>
                    </summary>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <InfoField
                        label="מִרפֶּסֶת"
                        value={property.Is_there_a_balcony}
                      />
                      <InfoField label="אִחסוּן" value={property.Storage} />
                      <InfoField label="מְרוּהָט" value={property.Furniture} />
                      <InfoField
                        label="מיזוג אוויר"
                        value={property.Air_conditioning}
                      />
                    </CardContent>
                  </details>
                </Card>

                {/* Availability & Status */}
                <Card>
                  <details>
                    <summary>
                      {" "}
                      <CardHeader>
                        <CardTitle>זמינות ומצב</CardTitle>
                      </CardHeader>
                    </summary>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <InfoField
                        label="חיבור גז"
                        value={property.Gas_connection}
                      />
                      <InfoField
                        label="תמא מצורף"
                        value={property.Is_TAMA_attached}
                      />
                      <InfoField
                        label="תמא בתהליך"
                        value={property.Is_the_building_in_the_process_of_TAMA}
                      />
                      <InfoField
                        label="תאריך TAMA צפוי"
                        value={property.When_is_the_TAMA_expected}
                        isDate
                      />
                    </CardContent>
                  </details>
                </Card>

                {/* Financial & Contract */}
                <Card>
                  <details>
                    <summary>
                      <CardHeader>
                        <CardTitle>פיננסי וחוזה</CardTitle>
                      </CardHeader>
                    </summary>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <InfoField
                        label="מחיר השכירות אחרון"
                        value={property.Last_rental_price}
                      />
                      <InfoField
                        label="וַעֲדָה"
                        value={property.Committee_of_the_House}
                      />
                      <InfoField
                        label="מיסים דו-חודשיים"
                        value={property.Bi_monthly_municipal_taxes}
                      />
                      <InfoField
                        label="תקופת תשלום"
                        value={property.Payment_term}
                      />
                      <InfoField
                        label="ערבות בנקאית"
                        value={property.A_bank_guarantee}
                      />
                      <InfoField
                        label="הערת אבטחה"
                        value={property.A_security_note_for_the_sum}
                      />
                      <InfoField
                        label="ערבים"
                        value={property.Guarantors_to_the_contract}
                      />
                      <InfoField
                        label="תקופת החוזה"
                        value={property.Contract_term}
                      />
                    </CardContent>
                  </details>
                </Card>

                {/* Comments & Price */}
                <Card>
                  <details>
                    <summary>
                      <CardHeader>
                        <CardTitle>הערות ומחיר</CardTitle>
                      </CardHeader>
                    </summary>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <InfoField
                        label="בעלים שוקל למכור"
                        value={
                          property.Is_the_owner_considering_selling_the_apartment
                        }
                      />

                      <InfoField
                        label="ליקויים ותיקונים"
                        value={property.Defects_and_repairs_to_be_carried_out}
                      />

                      <InfoField
                        label="הערות כלליות"
                        value={property.General_comments}
                      />

                      <InfoField
                        label="מחיר מומלץ"
                        value={property.Recommended_price}
                      />
                    </CardContent>
                  </details>
                </Card>
              </div>
            </div>

            {/* -------------------- Similar Properties Section -------------------- */}
            {/* Similar Properties */}
            {property && (
              <Card className="mt-6">
                <details>
                  <summary>
                    <CardHeader>
                      <CardTitle>מאפיינים דומים</CardTitle>
                    </CardHeader>
                  </summary>
                </details>

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
                          alt={p.In_which_area_is_the_property}
                          className="object-cover w-full h-40 rounded"
                        />
                        <CardHeader>
                          <CardTitle>
                            <MapPin className="inline mr-1" />{" "}
                            {p.In_which_area_is_the_property || "Unnamed Area"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                          <p>
                            <MapPin className="inline mr-1" />{" "}
                            {p.Area_registered_in_Arnona}
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
