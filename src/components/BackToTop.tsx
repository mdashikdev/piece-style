'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 w-11 h-11 bg-primary text-white rounded-xl shadow-lg hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/25 transition-all animate-scale-in flex items-center justify-center"
      aria-label="Back to top"
    >
      <ArrowUp size={20} />
    </button>
  );
}
