'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import Link from 'next/link';
import { ArrowRight, Truck, ShieldCheck, HeadphonesIcon, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';



const features = [
  { icon: Truck, title: 'Fast Delivery', desc: 'Fast home delivery across Bangladesh' },
  { icon: ShieldCheck, title: '1 Year Warranty', desc: 'Quality assurance on all products' },
  { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Dedicated customer support team' },
  { icon: RefreshCw, title: 'Easy Returns', desc: 'Hassle-free return within 7 days' },
];

function PromoSlider({ items }: { items: any[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!items.length) return;
    const interval = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <section className="relative overflow-hidden" style={{ width: '100%', height: 478, margin: '0 auto' }}>
      <div className="relative w-full h-full">
        <div
          className="flex h-full"
          style={{ transform: `translate3d(-${index * 100}%, 0px, 0px)`, transitionDuration: '500ms' }}
        >
          {items.map((item: any) => (
            <div key={item.id} className="w-full h-full flex-shrink-0">
              <Link href={`/products/${item.productSlug}`}>
                <picture>
                  {item.imageMobile && <source media="(max-width: 767px)" srcSet={item.imageMobile} />}
                  <img src={item.image} alt={item.title || ''} className="w-full h-full object-cover" />
                </picture>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const { data: banners } = useQuery({
    queryKey: ['banners'],
    queryFn: () => api.get('/banners').then(r => r.data.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
  });

  const { data: promoCat } = useQuery({
    queryKey: ['promotions', 'after_categories'],
    queryFn: () => api.get('/promotions', { params: { section: 'after_categories' } }).then(r => r.data.data),
  });

  const { data: promoFeatured } = useQuery({
    queryKey: ['promotions', 'after_featured'],
    queryFn: () => api.get('/promotions', { params: { section: 'after_featured' } }).then(r => r.data.data),
  });

  useEffect(() => {
    if (!catRef.current || !categories?.length) return;
    const el = catRef.current;
    const interval = setInterval(() => {
      const w = (el.firstChild as HTMLElement)?.offsetWidth || 180;
      const max = el.scrollWidth - el.clientWidth;
      const next = el.scrollLeft + w + 16;
      el.scrollBy({ left: next > max ? -el.scrollLeft : w + 16, behavior: 'smooth' });
    }, 3000);
    return () => clearInterval(interval);
  }, [categories]);

  const heroSlides = banners?.length ? banners : [];

  useEffect(() => {
    if (!heroSlides.length) return;
    const interval = setInterval(() => setHeroIndex((i) => (i + 1) % heroSlides.length), 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const scrollCat = (dir: 'left' | 'right') => {
    const el = catRef.current;
    if (!el) return;
    const w = (el.firstChild as HTMLElement)?.offsetWidth || 180;
    el.scrollBy({ left: dir === 'left' ? -(w + 16) : w + 16, behavior: 'smooth' });
  };

  return (
    <div>
      {heroSlides.length > 0 && (
      <section className="relative overflow-hidden" style={{ width: '100%', margin: '0 auto' }}>
        <div className="relative w-full md:h-[580px]">
          <div
            className="flex w-full md:h-full"
            style={{ transform: `translate3d(-${heroIndex * 100}%, 0px, 0px)`, transitionDuration: '500ms' }}
          >
            {heroSlides.map((banner: any, i: number) => {
              const content = (
                <picture>
                  {banner.imageMobile && <source media="(max-width: 767px)" srcSet={banner.imageMobile} />}
                  <img src={banner.image} alt="" className="w-full md:h-full object-cover" />
                </picture>
              );
              return (
                <div key={banner.id} className="w-full flex-shrink-0">
                  {banner.link ? <Link href={banner.link}>{content}</Link> : content}
                </div>
              );
            })}
          </div>
        <div className="swiper-pagination-dynamic absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
          {heroSlides.map((_: any, i: number) => {
            const dist = Math.abs(i - heroIndex);
            let opacity = '0';
            let scale = '0';
            if (dist === 0) { opacity = '1'; scale = 'scale-100'; }
            else if (dist === 1) { opacity = 'opacity-60'; scale = 'scale-75'; }
            else if (dist === 2) { opacity = 'opacity-30'; scale = 'scale-50'; }
            return (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setHeroIndex(i); }}
                className={`w-2 h-2 rounded-full bg-white transition-all duration-300 ${opacity} ${scale} ${i === heroIndex ? 'w-6' : ''}`}
                aria-label={`Slide ${i + 1}`}
              />
            );
          })}
          </div>
        </div>
      </section>
      )}

      {categories && categories.length > 0 && (
      <section className="py-2 lg:py-2 px-2 lg:px-2 relative">
        <div className="max-w-[1200px] mx-auto relative">
        <button onClick={() => scrollCat('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => scrollCat('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center">
          <ChevronRight size={20} />
        </button>
        <div ref={catRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {categories?.map((cat: any) => (
              <Link key={cat.id} href={`/collection/${cat.slug}`} className="group snap-start flex-shrink-0" style={{ width: isDesktop ? 'calc((100% - 5rem) / 6)' : 'calc((100% - 2rem) / 3)' }}>
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-2 relative">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300">
                      {cat.name[0]}
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-center group-hover:underline">{cat.name}</h3>
              </Link>
            ))}
        </div>
        </div>
      </section>
      )}

      <PromoSlider items={promoCat || []} />

      <section className="py-10 lg:py-10 bg-gray-50">
        <div className="container-main">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base sm:text-lg lg:text-lg font-semibold">Customers Choose This</h2>
            <Link href="/products" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline">
              View All <ArrowRight size={15} />
            </Link>
          </div>
          <FeaturedProducts />
          <div className="text-center mt-8 sm:hidden">
            <Link href="/products" className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline">
              View All Products <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <PromoSlider items={promoFeatured || []} />

      <section className="py-10 lg:py-10">
        <div className="container-main">
          <div className="text-center mb-12">
            <span className="inline-block text-primary text-xs font-semibold tracking-widest uppercase mb-3">Why Choose Us</span>
            <h2 className="text-base sm:text-lg lg:text-lg font-semibold mb-1">We Make Shopping Easy</h2>
            <p className="text-body max-w-xl mx-auto">Everything you need for a seamless shopping experience</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="text-center p-8 rounded-2xl border border-border hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-4">
                  <f.icon size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-body">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
