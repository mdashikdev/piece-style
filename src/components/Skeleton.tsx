interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden">
      <Skeleton className="aspect-square rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-9 w-full rounded mt-2" />
      </div>
    </div>
  );
}
