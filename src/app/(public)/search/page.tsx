'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeleton';
import { Search as SearchIcon } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['search', q],
    queryFn: () => api.get('/products', { params: { search: q, limit: 50 } }).then(r => r.data),
    enabled: !!q,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {[1,2,3,4,5,6,7,8].map(i => <ProductCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!q) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SearchIcon size={32} className="text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Search products</h3>
        <p className="text-body text-sm">Type something in the search bar to find products</p>
      </div>
    );
  }

  if (data?.data?.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SearchIcon size={32} className="text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No results for &ldquo;{q}&rdquo;</h3>
        <p className="text-body text-sm">Try a different search term</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {data?.data?.map((product: any) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="container-main py-12 lg:py-16 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-body text-sm">Find the perfect appliance for your home</p>
      </div>
      <Suspense fallback={
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
}
