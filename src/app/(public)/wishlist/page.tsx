'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeleton';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { token } = useAuthStore();
  const router = useRouter();

  const { data: items, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/wishlist').then(r => r.data.data),
    enabled: !!token,
  });

  if (!token) { router.push('/account'); return null; }

  return (
    <div className="container-main py-12 lg:py-16 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">My Wishlist</h1>
        <p className="text-body text-sm">Products you&apos;ve saved for later</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <ProductCardSkeleton key={i} />)}
        </div>
      ) : items?.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Your wishlist is empty</h3>
          <p className="text-body text-sm mb-6">Save your favorite items here</p>
          <Link href="/products" className="inline-flex bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-hover transition-all">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items?.map((item: any) => <ProductCard key={item.id} product={item.product} />)}
        </div>
      )}
    </div>
  );
}
