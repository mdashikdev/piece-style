'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useEffect } from 'react';

export function DynamicFavicon() {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => api.get('/settings').then(r => r.data.data),
    staleTime: 300000,
  });

  const favicon = settings?.site_favicon;

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon && link) {
      link.href = favicon;
    }
  }, [favicon]);

  return null;
}
