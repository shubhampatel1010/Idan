import { Link } from "react-router-dom";
import { Bed, Bath, Ruler, MapPin, Building, Edit } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { Property } from "@/lib/types";
import { updatePropertyAvailability } from "@/lib/airtable";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";

interface PropertyCardProps {
  property: Property;
  compact?: boolean;
}

export function PropertyCard({ property, compact = false }: PropertyCardProps) {
  const imageUrl =
    property.Property_Image?.[0]?.url ||
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60";

  const propertyName = property.Property_owner_name || "Unnamed Property";
  const rent = property.Asking_price ?? 0;
  const bedrooms = property.How_many_rooms ?? 0;
  const floor = property.Floor ?? 0;
  const sqm = property.Actual_area ?? 0;
  const address = property.Property_Address || "Unknown location";
  const In_which_area_is_the_property = property.In_which_area_is_the_property || "NA";

  const status = property.Is_the_apartment_available || "NA";
  const isAvailable = status === "Available";

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (newStatus: "Available" | "NA") =>
      updatePropertyAvailability(property.id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Updated",
        description: "Property availability updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    },
  });

  function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


  const formatRent = (rentAmount: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      maximumFractionDigits: 0,
    }).format(rentAmount);
  };

  if (compact) {
    return (
      <Link to={`/property/${property.id}`}>
        <Card className="overflow-hidden hover-elevate cursor-pointer h-full">
          <div className="aspect-video overflow-hidden bg-muted">
            <img
              src={imageUrl}
              alt={propertyName}
              className="object-cover w-full h-full"
            />
          </div>
          <CardContent className="p-3">
            <h4 className="font-medium text-sm truncate">{propertyName}</h4>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-semibold text-primary">
                {formatRent(rent)}/mo
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Bed className="h-3 w-3" />
                {bedrooms}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={propertyName}
          className="object-cover w-full h-full"
        />
      </div>

      <CardContent className="p-4 flex-1">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-lg">{address}</h3>
          <Badge variant={isAvailable ? "default" : "secondary"}>
            {status}
          </Badge>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="h-3.5 w-3.5" />
          <span>{In_which_area_is_the_property}</span>
        </div>

        <div className="text-2xl font-bold text-primary mb-3">
          {formatRent(rent)}
          <span className="text-sm font-normal text-muted-foreground">
            {" "}
            /month
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Bed className="h-4 w-4" />
            <span>{bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building className="h-4 w-4" />
            <span>{floor} Floor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Ruler className="h-4 w-4" />
            <span>{sqm}m²</span>
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <Link to={`/property/${property.id}`} className="w-full">
          <Button className="w-full">View</Button>
        </Link>
        {/* Edit Button */}
        <Link
          to={`/property-edit/${property.id}`}
          className="flex items-center justify-center w-full border rounded-md p-2 hover:bg-gray-100 transition"
        >
          <Edit className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Edit</span>
        </Link>

        {/* Availability Toggle */}
        <div className="flex items-center justify-between w-full border rounded-md p-2">
          <span className="text-sm font-medium">Availability</span>

          <div className="flex items-center gap-2">
            <span className="text-xs">NA</span>
            <Switch
              checked={isAvailable}
              disabled={mutation.isPending}
              onCheckedChange={(checked) =>
                mutation.mutate(checked ? "Available" : "NA")
              }
            />
            <span className="text-xs">Available</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Created: {formatDate(property.Created)}
        </p>
      </CardFooter>
    </Card>
  );
}
