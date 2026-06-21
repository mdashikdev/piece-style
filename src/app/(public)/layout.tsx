'use client';

import { usePathname } from 'next/navigation';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PromoPopup } from '@/components/PromoPopup';
import { useEffect } from 'react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAccountPage = pathname.startsWith('/account');
  const isCheckoutPage = pathname.startsWith('/checkout') || pathname.startsWith('/cart');

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <>
      <PromoPopup />
      <AnnouncementBar />
      <Header />
      <main className="flex-1">{children}</main>
      <div className={`${isAccountPage ? 'hidden md:block' : ''} ${isCheckoutPage ? 'hidden' : ''}`}>
        <Footer />
      </div>
    </>
  );
}
