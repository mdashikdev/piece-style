'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';

export function AnnouncementBar() {
  const [slideIn, setSlideIn] = useState(true);

  const { data } = useQuery({
    queryKey: ['announcement'],
    queryFn: () => api.get('/announcement').then(r => r.data.data),
  });

  const announcement = data;

  useEffect(() => {
    if (!announcement?.text) return;
    const interval = setInterval(() => {
      setSlideIn(false);
      setTimeout(() => setSlideIn(true), 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [announcement?.text]);

  if (!announcement || !announcement.active) return null;

  const parts = announcement.text.split(' — ');
  const primary = parts[0] || announcement.text;
  const secondary = parts[1] ? ` — ${parts[1]}` : '';

  return (
    <div className="bg-announcement-bg text-announcement-text text-center text-xs sm:text-sm py-2.5 overflow-hidden">
      <div className="container-main">
        <div className={`transition-all duration-300 ${slideIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          <span>{primary}</span>
          {secondary && <span className="hidden sm:inline">{secondary}</span>}
        </div>
      </div>
    </div>
  );
}
