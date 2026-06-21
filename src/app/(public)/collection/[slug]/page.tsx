'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeleton';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Filter } from 'lucide-react';

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sort, setSort] = useState('');

  const { data: categoryData } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => api.get(`/categories/${slug}`).then(r => r.data.data),
    enabled: !!slug,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['collection', slug, sort],
    queryFn: () => api.get('/products', { params: { categorySlug: slug, sort, limit: 50 } }).then(r => r.data),
    enabled: !!slug,
  });

  return (
    <div className="container-main animate-fade-in" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-sm font-semibold">{categoryData?.name || 'Collection'}</h1>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-border px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-gray-900 transition-all appearance-none cursor-pointer pr-7"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
        >
          <option value="">Sort: Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <ProductCardSkeleton key={i} />)}
        </div>
      ) : !data?.data?.length ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Filter size={20} className="text-gray-300" />
          </div>
          <h3 className="text-sm font-semibold mb-1">No products found</h3>
          <p className="text-xs text-gray-500">This collection is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data?.data?.map((product: any) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}
