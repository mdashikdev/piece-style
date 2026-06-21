'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Award, Users, Globe } from 'lucide-react';

const stats = [
  { icon: Award, value: '10+', label: 'Years Experience' },
  { icon: Users, value: '50K+', label: 'Happy Customers' },
  { icon: ShieldCheck, value: '1 Year', label: 'Warranty' },
  { icon: Globe, value: '64+', label: 'Cities Covered' },
];

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 lg:py-24">
        <div className="container-main">
          <div className="max-w-2xl">
            <span className="inline-block text-primary text-xs font-semibold tracking-widest uppercase mb-3">About Us</span>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Piece Style</h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              Your trusted destination for premium home appliances in Bangladesh. We bring quality, durability, and style to modern homes.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-main">
          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center p-8 rounded-2xl border border-border">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-4">
                  <s.icon size={24} className="text-primary" />
                </div>
                <div className="text-2xl font-bold mb-1">{s.value}</div>
                <div className="text-sm text-body">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container-main">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-5 text-body leading-relaxed">
              <p>
                Piece Style is your trusted destination for premium home appliances in Bangladesh. We offer a curated selection of high-quality products including blenders, irons, kettles, fans, rice cookers, and more.
              </p>
              <p>
                Our mission is to provide modern homes with reliable appliances that combine durability, performance, and style. Every product we sell is backed by a 1-year warranty and our dedicated customer support team.
              </p>
              <p>
                We source our products from trusted manufacturers and ensure each item meets rigorous quality standards before it reaches your doorstep. With free delivery across Bangladesh and easy returns, we make shopping for home appliances hassle-free.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/products" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-medium hover:bg-primary-hover transition-all hover:shadow-lg hover:shadow-primary/25">
                Shop Now <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
