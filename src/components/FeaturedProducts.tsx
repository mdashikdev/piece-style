'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './Skeleton';

export function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get('/products/featured').then(r => r.data.data),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[1,2,3,4].map(i => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {data?.map((product: any) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
