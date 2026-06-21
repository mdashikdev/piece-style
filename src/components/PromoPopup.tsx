'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export function PromoPopup() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem('promo_popup_seen');
    if (!seen) setDismissed(false);
  }, []);

  const { data } = useQuery({
    queryKey: ['promo-popup'],
    queryFn: () => api.get('/popup').then(r => r.data.data),
  });

  const promo = data;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('promo_popup_seen', '1');
  };

  if (dismissed || !promo || !promo.active) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative max-w-lg mx-4">
        <button onClick={handleDismiss} className="absolute -top-3 -right-3 z-10 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100">
          <X size={18} />
        </button>
        <div className="rounded-xl overflow-hidden shadow-2xl">
          <Link href={`/products/${promo.productSlug}`} onClick={handleDismiss}>
            <picture>
              {promo.imageMobile && <source media="(max-width: 767px)" srcSet={promo.imageMobile} />}
              <img src={promo.image} alt="" className="w-full object-cover" />
            </picture>
          </Link>
        </div>
      </div>
    </div>
  );
}
