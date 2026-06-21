'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/store/adminAuth';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/adminApi';
import { LayoutDashboard, Package, ShoppingCart, Users, Tags, Star, Image, FileText, Settings, LogOut, Menu, X, Gift, ListTree, User, Megaphone, Monitor, ScrollText } from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/menus', label: 'Menus', icon: ListTree },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/coupons', label: 'Coupons', icon: Gift },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/banners', label: 'Banners', icon: Image },
  { href: '/admin/pages', label: 'Pages', icon: FileText },
  { href: '/admin/promotions', label: 'Promotion', icon: Megaphone },
  { href: '/admin/popup', label: 'Popup', icon: Monitor },
  { href: '/admin/announcement', label: 'Announcement', icon: ScrollText },
  { href: '/admin/profile', label: 'Profile', icon: User },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout, setAuth } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.get('/settings').then(r => r.data.data),
    enabled: !!token && hydrated,
    staleTime: 300000,
  });

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');
    if (storedToken && storedUser && !token) {
      setAuth(JSON.parse(storedUser), storedToken);
    }
    setHydrated(true);
  }, []);

  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!hydrated) return null;

  if (!token) {
    router.push('/admin/login');
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    logout();
    router.push('/admin/login');
  };

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-4 z-50">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? <X size={24} /> : <Menu size={24} />}</button>
        <span className="ml-3 font-semibold">Piece Style Admin</span>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-14 lg:h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/admin" className="flex items-center gap-2">
            {settings?.site_logo ? (
              <img src={settings.site_logo} className="h-7 w-auto" alt="Logo" />
            ) : (
              <span className="text-lg font-bold">Piece <span className="text-primary">Style</span></span>
            )}
            <span className="text-xs text-gray-400 font-normal">Admin</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <item.icon size={18} /> {item.label}
              </Link>
            );
          })}
          <hr className="my-4 border-gray-200" />
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded text-sm text-gray-600 hover:bg-gray-100 w-full">
            ← Back to Store
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded text-sm text-gray-600 hover:bg-gray-100 w-full mt-1">
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="hidden lg:flex h-16 items-center justify-end px-8 border-b border-gray-200 bg-white">
          <Link href="/admin/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium relative">
              {user?.name?.[0] || 'A'}
            </div>
          </Link>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </>
  );
}
