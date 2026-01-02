import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PropertyMapProps {
  latitude?: number | string;
  longitude?: number | string;
  address?: string;
}

export function PropertyMap({
  latitude,
  longitude,
  address,
}: PropertyMapProps) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  const isValid =
    !isNaN(lat) &&
    !isNaN(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180;

  if (!isValid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Map location is not available for this property.
        </CardContent>
      </Card>
    );
  }

  const mapSrc = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Property Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {address && (
          <p className="text-sm text-muted-foreground">{address}</p>
        )}

        <div className="w-full overflow-hidden rounded-lg border aspect-video">
          <iframe
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full border-0"
            allowFullScreen
          />
        </div>
      </CardContent>
    </Card>
  );
}
