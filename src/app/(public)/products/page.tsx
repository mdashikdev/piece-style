'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeleton';
import { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';

export default function ProductsPage() {
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['products', category, sort],
    queryFn: () => api.get('/products', { params: { category, sort, limit: 50 } }).then(r => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
  });

  return (
    <div className="container-main animate-fade-in" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="shrink-0">
          <h1 className="text-sm font-semibold">All Products</h1>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-border px-2 py-1.5 pr-6 text-[11px] bg-white focus:outline-none focus:border-gray-900 transition-all appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-border px-2 py-1.5 pr-6 text-[11px] bg-white focus:outline-none focus:border-gray-900 transition-all appearance-none cursor-pointer"
            >
              <option value="">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
            <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
          </div>
        </div>
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
          <p className="text-xs text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data?.data?.map((product: any) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}
