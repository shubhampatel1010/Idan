import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import type { PropertyFilters } from '@/lib/types';

interface FiltersProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  neighborhoods: string[];
  propertyTypes: string[];
  maxRent: number;
}

export function Filters({
  filters,
  onFiltersChange,
  neighborhoods,
  propertyTypes,
  maxRent,
}: FiltersProps) {
  const formatRent = (value: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property Type</Label>
            <Select
              value={filters.propertyType}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, propertyType: value })
              }
            >
              <SelectTrigger id="propertyType" data-testid="select-property-type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {propertyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Neighborhood</Label>
            <Select
              value={filters.neighborhood}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, neighborhood: value })
              }
            >
              <SelectTrigger id="neighborhood" data-testid="select-neighborhood">
                <SelectValue placeholder="All Neighborhoods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Neighborhoods</SelectItem>
                {neighborhoods.map((neighborhood) => (
                  <SelectItem key={neighborhood} value={neighborhood}>
                    {neighborhood}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Select
              value={filters.bedrooms.toString()}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, bedrooms: parseInt(value) })
              }
            >
              <SelectTrigger id="bedrooms" data-testid="select-bedrooms">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label>
              Rent Range: {formatRent(filters.minRent)} - {formatRent(filters.maxRent)}
            </Label>
            <div className="pt-2 px-1">
              <Slider
                min={0}
                max={maxRent}
                step={500}
                value={[filters.minRent, filters.maxRent]}
                onValueChange={([min, max]) =>
                  onFiltersChange({ ...filters, minRent: min, maxRent: max })
                }
                data-testid="slider-rent-range"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
