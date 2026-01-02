import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video" />
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-3" />
        <Skeleton className="h-8 w-1/3 mb-3" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </CardFooter>
    </Card>
  );
}

export function StatsCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TenantCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="text-right">
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
            <Skeleton className="h-2 w-full mb-3" />
            <div className="flex gap-1.5 mb-4">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-14" />
            </div>
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
