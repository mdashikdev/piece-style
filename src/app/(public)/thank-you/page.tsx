'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { CheckCircle } from 'lucide-react';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const { clearCart } = useCartStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { router.push('/'); return; }
    api.get(`/orders/${orderId}`).then(r => {
      setOrder(r.data.data);
      clearCart();
    }).catch(() => router.push('/')).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-primary rounded-full" />
    </div>
  );

  if (!order) return null;

  return (
    <section className="py-10 lg:py-10">
      <div className="container-main animate-fade-in">
        <div className="max-w-sm mx-auto">

          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={28} className="text-primary" />
            </div>
            <p className="text-lg font-semibold leading-relaxed">
              ধন্যবাদ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।
            </p>
          </div>

          <div className="border border-border rounded-2xl p-5 text-sm text-body leading-relaxed text-center mb-5 space-y-3 bg-gray-50/50">
            <p>আমরা বর্তমানে আপনার অর্ডারটি প্রসেস করছি। খুব শীঘ্রই আমাদের একজন প্রতিনিধি আপনার অর্ডার নিশ্চিত করার জন্য আপনার সাথে ফোনে যোগাযোগ করবেন।</p>
            <p>অনুগ্রহ করে আপনার মোবাইল ফোনটি সচল রাখুন। ধন্যবাদ!</p>
          </div>

          <div className="border-t border-border pt-5 mb-6 text-center">
            <p className="text-[10px] text-body uppercase tracking-wider mb-1">Order Number</p>
            <p className="text-base font-bold font-mono">#{order.id.replace(/\D/g, '').slice(-8)}</p>
          </div>

          <div className="space-y-2.5">
            <Link
              href={`/account/orders/${order.id}`}
              className="block w-full bg-primary text-white text-center py-3 rounded-xl text-sm font-medium transition-all hover:bg-primary-hover active:scale-[0.98]"
            >
              Track Order
            </Link>
            <Link
              href="/"
              className="block w-full border border-border text-body text-center py-3 rounded-xl text-sm font-medium transition-all hover:border-gray-300 active:scale-[0.98]"
            >
              Continue Shopping
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-primary rounded-full" /></div>}>
      <ThankYouContent />
    </Suspense>
  );
}
