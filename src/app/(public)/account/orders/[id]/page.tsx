'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useParams, useRouter } from 'next/navigation';
import { formatPrice, getImageUrl } from '@/lib/utils';
import Link from 'next/link';
import { Skeleton } from '@/components/Skeleton';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const { token, user, setAuth } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data.data),
    enabled: !!token,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.token && parsed?.state?.user && !token) {
          setAuth(parsed.state.user, parsed.state.token);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  if (!token) { router.push('/account'); return null; }

  if (isLoading) return (
    <div className="container-main animate-fade-in" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
      <div className="max-w-[600px] mx-auto">
        <Skeleton className="h-5 w-32 mb-6" />
        <div className="border border-border rounded-xl p-4 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );

  if (!order) return (
    <div className="container-main text-center" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
      <h2 className="text-lg font-bold mb-2">Order not found</h2>
      <Link href="/account/orders" className="text-primary hover:underline text-xs">Back to orders</Link>
    </div>
  );

  return (
    <div className="container-main animate-fade-in" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
      <div className="max-w-[600px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/account/orders" className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-black">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="rotate-180">
              <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Orders
          </Link>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${statusStyles[order.status] || 'bg-gray-100 text-gray-700'}`}>
            {order.status}
          </span>
        </div>

        <div className="border border-border rounded-xl overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-border">
            <div className="text-sm font-bold">Order #{order.id.replace(/\D/g, '').slice(-6)}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items</div>
              <div className="divide-y divide-border">
                {order.items?.map((item: any) => {
                  const imgSrc = (() => { if (!item.product?.images) return null; try { return JSON.parse(item.product.images)[0]; } catch { return null; } })();
                  return (
                    <div key={item.id} className="flex items-center gap-3 py-2">
                      {imgSrc && (
                        <img src={getImageUrl(imgSrc)} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-50"/>
                      )}
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-sm font-medium truncate">{item.product?.title || item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.qty} &times; {formatPrice(item.price)}</p>
                      </div>
                      <span className="text-sm font-semibold whitespace-nowrap">{formatPrice(item.price * item.qty)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Shipping Address</div>
              <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed">
                <p className="font-medium text-gray-900">{order.shippingName}</p>
                <p>{order.shippingStreet}</p>
                <p>{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                <p>{order.shippingCountry}</p>
                {order.shippingPhone && <p className="mt-1">Phone: {order.shippingPhone}</p>}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.total + (order.discount || 0))}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-base mt-3 pt-3 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
