// PropertyList.tsx
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import { Layout } from '@/components/layout';
import { PropertyCard } from '@/components/property-card';
import { PropertyCardSkeleton } from '@/components/loading';
import { ErrorState } from '@/components/error-state';
import { EmptyState } from '@/components/empty-state';
import { fetchProperties } from '@/lib/airtable';
import type { Property, PropertyFilters } from '@/lib/types';

export default function PropertyList() {
  const [filters, setFilters] = useState<PropertyFilters>({
    minRent: 0,
    maxRent: 50000,
    bedrooms: 0,
    elevator: null,
    parking: null,
    balcony: null,
    availability: 'all',
  });

  const { data: properties, isLoading, error, refetch } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    queryFn: fetchProperties,
    refetchOnWindowFocus: true,
  });

  const maxRent = useMemo(() => {
    if (!properties?.length) return 50000;
    return Math.max(...properties.map((p) => p.Asking_price ?? 0));
  }, [properties]);

  // Apply filters
  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    return properties.filter((p) => {
      if (filters.bedrooms && (p.How_many_rooms ?? 0) < filters.bedrooms) return false;
      if (filters.minRent && (p.Asking_price ?? 0) < filters.minRent) return false;
      if (filters.maxRent && (p.Asking_price ?? 0) > filters.maxRent) return false;
       // מעלית
      if (filters.elevator && p.Elevator !== filters.elevator) return false;

      // חניה
      if (filters.parking && p.Parking !== filters.parking) return false;

      // מרפסת
      if (filters.balcony && p.Is_there_a_balcony !== filters.balcony) return false;
      if (filters.availability !== 'all' && p.Is_the_apartment_available !== filters.availability) return false;
      return true;
    });
  }, [properties, filters]);

  if (error) {
    return (
      <Layout>
        <ErrorState
          message="Failed to load properties. Please check your Airtable configuration."
          onRetry={() => refetch()}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-1/4 space-y-6 p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>

          {/* Bedrooms */}
          <div>
            <label className="block mb-1 font-medium">Bedrooms</label>
            <input
              type="number"
              min={0}
              value={filters.bedrooms}
              onChange={(e) => setFilters({ ...filters, bedrooms: Number(e.target.value) })}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Rent */}
          <div>
            <label className="block mb-1 font-medium">Rent (ILS)</label>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                value={filters.minRent}
                onChange={(e) => setFilters({ ...filters, minRent: Number(e.target.value) })}
                className="w-1/2 border p-2 rounded"
                placeholder="Min"
              />
              <input
                type="number"
                min={0}
                value={filters.maxRent}
                onChange={(e) => setFilters({ ...filters, maxRent: Number(e.target.value) })}
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
                <option value="כן">כן</option>
                <option value="לא">לא</option>
                <option value="חצי קומה">חצי קומה</option>
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

          {/* Availability */}
          <div>
            <label className="block mb-1 font-medium">Availability</label>
            <select
              value={filters.availability}
              onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
              className="w-full border p-2 rounded"
            >
              <option value="all">All</option>
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
              <option value="NA">NA</option>

            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={() =>
              setFilters({
                minRent: 0,
                maxRent: maxRent || 50000,
                bedrooms: 0,
                elevator: null,
                parking: null,
                balcony: null,
                availability: 'all',
              })
            }
            className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700 transition"
          >
            Reset Filters
          </button>
        </aside>

        {/* Property Grid */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">
              {isLoading
                ? 'Loading properties...'
                : `Showing ${filteredProperties.length} of ${properties?.length ?? 0} properties`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
            </div>
          ) : !filteredProperties.length ? (
            <EmptyState
              icon={Building2}
              title="No properties found"
              description="Try adjusting your filters to see more results."
              action={{
                label: 'Clear Filters',
                onClick: () =>
                  setFilters({
                    minRent: 0,
                    maxRent: maxRent || 50000,
                    bedrooms: 0,
                    elevator: null,
                    parking: null,
                    balcony: null,
                    availability: 'all',
                  }),
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
