'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useEffect } from 'react';

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function shadeColor(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const nr = Math.max(0, Math.min(255, r + amount));
  const ng = Math.max(0, Math.min(255, g + amount));
  const nb = Math.max(0, Math.min(255, b + amount));
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

function lightenColor(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const nr = Math.min(255, r + amount);
  const ng = Math.min(255, g + amount);
  const nb = Math.min(255, b + amount);
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => api.get('/settings').then(r => r.data.data),
    staleTime: 300000,
  });

  const primaryColor = settings?.primary_color || '#00a7e1';

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', primaryColor);
    root.style.setProperty('--color-primary-hover', shadeColor(primaryColor, -20));
    root.style.setProperty('--color-primary-light', lightenColor(primaryColor, 200));
    root.style.setProperty('--color-primary-dark', shadeColor(primaryColor, -60));
  }, [primaryColor]);

  return <>{children}</>;
}
