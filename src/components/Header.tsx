'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';

interface SubMenuItem {
  name: string;
  href: string;
}

interface MenuItem {
  name: string;
  href?: string;
  children?: SubMenuItem[];
}

interface LevelData {
  title: string;
  items: (MenuItem | { name: string; href: string })[];
}

export function Header() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [levelStack, setLevelStack] = useState<LevelData[]>([]);
  const itemCount = useCartStore((s) => s.getItemCount());
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const { setAuth, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const isUserPanel = pathname.startsWith('/account');
  const isCheckoutPage = pathname.startsWith('/checkout') || pathname.startsWith('/cart');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.token && parsed?.state?.user && !token) {
          setAuth(parsed.state.user, parsed.state.token);
        }
      }
    } catch {}
  }, []);

  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => api.get('/settings').then(r => r.data.data),
    staleTime: 300000,
  });

  const { data: menuItems } = useQuery({
    queryKey: ['public-menus'],
    queryFn: () => api.get('/menus').then(r => r.data.data),
    staleTime: 300000,
  });

  const siteLogo = settings?.site_logo;

  const defaultMenuItems: MenuItem[] = [
    { name: 'HOME', href: '/' },
    { name: 'All Products', href: '/products', children: [] },
    { name: 'ABOUT US', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const resolvedMenuItems: MenuItem[] = menuItems && menuItems.length > 0
    ? menuItems.map((item: any) => ({
        name: item.name,
        href: item.href || undefined,
        children: item.children
          ? item.children.map((child: any) => ({
              name: child.name,
              href: child.href || undefined,
              children: child.children
                ? child.children.map((gc: any) => ({ name: gc.name, href: gc.href || undefined }))
                : undefined,
            }))
          : undefined,
      }))
    : defaultMenuItems;

  const initialLevelData: LevelData = { title: '', items: resolvedMenuItems };

  useEffect(() => {
    if (!mobileMenu) {
      setCurrentLevel(0);
      setLevelStack([]);
    }
  }, [mobileMenu]);

  useEffect(() => {
    if (mobileMenu) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenu]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const goToSubMenu = useCallback((title: string, items: SubMenuItem[]) => {
    const newLevel: LevelData = { title, items };
    setLevelStack(prev => {
      const next = [...prev, newLevel];
      setCurrentLevel(next.length);
      return next;
    });
  }, []);

  const goBack = useCallback(() => {
    setLevelStack(prev => {
      const next = prev.slice(0, -1);
      setCurrentLevel(next.length);
      return next;
    });
  }, []);

  const closeMenu = useCallback(() => {
    setMobileMenu(false);
    setCurrentLevel(0);
    setLevelStack([]);
  }, []);

  const renderMenuItems = (items: (MenuItem | { name: string; href: string; children?: SubMenuItem[] })[]) => {
    return items.map((item, idx) => {
      const hasChildren = 'children' in item && item.children && item.children.length > 0;
      return (
        <li key={`${item.name}-${idx}`} className="menu-item">
          <Link
            href={(item as any).href || '#'}
            onClick={(e) => {
              if (hasChildren) {
                e.preventDefault();
                goToSubMenu(item.name, (item as MenuItem).children!);
              } else {
                closeMenu();
              }
            }}
          >
            {item.name}
          </Link>
          {hasChildren && (
            <span onClick={() => goToSubMenu(item.name, (item as MenuItem).children!)}>&gt;</span>
          )}
        </li>
      );
    });
  };

  const allLevels = [initialLevelData, ...levelStack];

  return (
    <header className="sticky top-0 z-50 bg-white relative">
      {isUserPanel || isCheckoutPage ? (
        <div className="content" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48 }}>
          <h1 className="header-logo">
            <a href="/">
              {siteLogo ? (
                <img src={siteLogo} className="h-8 w-auto" alt="Logo" />
              ) : (
                <span className="text-xl font-bold tracking-tight">Piece <span className="text-primary">Style</span></span>
              )}
            </a>
          </h1>
        </div>
      ) : (
        <>
          <div className="hidden lg:block container-main">
            <div className="flex items-center justify-between h-12">
              <Link href="/" className="flex-shrink-0">
                {siteLogo ? (
                  <img src={siteLogo} className="h-8 w-auto" alt="Logo" />
                ) : (
                  <span className="text-xl font-bold tracking-tight">Piece <span className="text-primary">Style</span></span>
                )}
              </Link>

              <nav className="flex items-center">
                {resolvedMenuItems.map((item: MenuItem, idx: number) => {
                  const hasChildren = item.children && item.children.length > 0;
                  if (hasChildren) {
                    return (
                      <div
                        key={idx}
                        className="relative"
                        onMouseEnter={() => setDropdownOpen(true)}
                        onMouseLeave={() => setDropdownOpen(false)}
                      >
                        <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium hover:text-primary transition-colors">
                          {item.name} <ChevronDown size={12} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {dropdownOpen && (
                          <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-border shadow-lg z-50">
                            {item.children!.map((cat, ci) => (
                              <Link
                                key={ci}
                                href={(cat as any).href || '#'}
                                className="block px-4 py-2.5 text-sm hover:text-primary transition-colors"
                              >
                                {cat.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={idx}
                      href={item.href || '#'}
                      className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center">
                <ul className="button-box">
                  <li className="entrance">
                    <div onClick={() => router.push('/account/orders')} className="el-badge item">
                      <i className="iconfont icon-gerenzhongxin2" style={{ color: '#000' }}></i>
                      <sup className="el-badge__content is-fixed" style={{ display: 'none' }}>0</sup>
                    </div>
                  </li>
                  <li className="entrance">
                    <div onClick={() => setSearchOpen(!searchOpen)} className="el-badge item search-icon">
                      <i className="iconfont icon-sousuo" style={{ color: '#000' }}></i>
                      <sup className="el-badge__content is-fixed" style={{ display: 'none' }}>0</sup>
                    </div>
                  </li>
                  <li className="entrance">
                    <div onClick={() => router.push('/cart')} className="cart-box pointer">
                      <i className="iconfont icon-gouwuche3" style={{ padding: 0, color: '#000' }}></i>
                      <sup className="el-badge__content is-fixed" style={{ display: itemCount > 0 ? '' : 'none' }}>{itemCount > 99 ? '99+' : itemCount}</sup>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:hidden fec-header-mobile">
            <div className="type-2" style={{ background: '#fff' }}>
              <div className="row">
                <div className="col" style={{ paddingLeft: 10, flex: '0 0 41.6667%', maxWidth: '41.6667%' }}>
                  <div className="nav-logo" style={{ height: 36, paddingLeft: 10 }}>
                    <a href="/" style={{ height: 36 }}>
                      {siteLogo ? (
                        <img src={siteLogo} style={{ height: 36 }} alt="Logo" />
                      ) : (
                        <span className="text-base font-bold tracking-tight leading-[36px]">Piece <span className="text-primary">Style</span></span>
                      )}
                    </a>
                  </div>
                </div>
                <div className="col" style={{ flex: '0 0 58.3333%', maxWidth: '58.3333%' }}>
                  <div className="flex" style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                    <div className="text-right nav-right">
                      <ul className="button-box">
                        <li className="entrance">
                          <div onClick={() => router.push('/account/orders')} className="el-badge item">
                            <i className="iconfont icon-gerenzhongxin2" style={{ color: '#000' }}></i>
                            <sup className="el-badge__content is-fixed" style={{ display: 'none' }}>0</sup>
                          </div>
                        </li>
                        <li className="entrance">
                          <div onClick={() => setSearchOpen(!searchOpen)} className="el-badge item search-icon">
                            <i className="iconfont icon-sousuo" style={{ color: '#000' }}></i>
                            <sup className="el-badge__content is-fixed" style={{ display: 'none' }}>0</sup>
                          </div>
                        </li>
                        <li className="entrance">
                    <div onClick={() => router.push('/cart')} className="cart-box pointer">
                            <i className="iconfont icon-gouwuche3" style={{ padding: 0, color: '#000' }}></i>
                            <sup className="el-badge__content is-fixed" style={{ display: itemCount > 0 ? '' : 'none' }}>{itemCount > 99 ? '99+' : itemCount}</sup>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="text-left">
                      <div className="menu" onClick={() => setMobileMenu(!mobileMenu)}>
                        {mobileMenu ? <i className="iconfont icon-guanbi" style={{ color: '#000' }}></i> : <i className="iconfont icon-caidan" style={{ color: '#000' }}></i>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div
        className={`absolute left-0 w-full bg-white border-b border-border overflow-hidden transition-all duration-300 ${
          searchOpen ? 'h-[60px]' : 'h-0'
        }`}
        style={{ top: '100%' }}
      >
        {searchOpen && (
          <div className="h-full flex items-center justify-center px-4">
            <form onSubmit={handleSearch} className="flex items-center justify-center w-full max-w-[750px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 border-none h-10 text-lg outline-none mr-3"
                autoFocus
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="flex items-center justify-center w-[30px] h-10 cursor-pointer text-xl hover:text-primary transition-colors" aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>

      <div className={`menu-bg${mobileMenu ? ' menu-bg-show' : ''}`} onClick={closeMenu} />
      <div className={`menu-list${mobileMenu ? ' menu-list-show' : ''}`}>
        {allLevels.map((level, idx) => (
          <div
            key={idx}
            className={`menu-level ${idx === 0 ? 'menu-list-level1' : idx === 1 ? 'menu-list-level2' : 'menu-list-level3'}`}
            style={{ transform: `translateX(${(idx - currentLevel) * 100}%)` }}
          >
            {idx > 0 && (
              <div className="back-css" onClick={goBack}>
                <i>&lt;</i>
                <span>{level.title}</span>
              </div>
            )}
            {idx === 0 && (
              <div className="search-box-m">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && searchQuery.trim()) { router.push(`/search?q=${encodeURIComponent(searchQuery)}`); closeMenu(); } }}
                  placeholder="Search product"
                />
              </div>
            )}
            <ul className={idx === 0 ? 'menu-list-level1-ul' : ''} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {renderMenuItems(level.items)}
            </ul>
            {idx === 0 && (
              <div className="level1">
                {user ? (
                  <div>
                    <div className="flex-column flex-align-center flex-justify-center">
                      <button type="button" className="el-button my-order fec-btn mb-3 t-minor-button el-button--default" style={{ width: '100%' }} onClick={() => { closeMenu(); router.push('/account/orders'); }}>
                        <span> My Order </span>
                      </button>
                      <button type="button" className="el-button fec-btn address-book t-minor-button el-button--default" style={{ width: '100%' }} onClick={() => { closeMenu(); router.push('/account/addresses'); }}>
                        <span> Address Book </span>
                      </button>
                      <div className="log-out">
                        <span onClick={() => { logout(); closeMenu(); router.push('/'); }}>Sign out</span>
                      </div>
                    </div>
                    <div className="footer-box"></div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <button type="button" className="el-button fec-btn login t-primary-button mb-3" style={{ width: '100%' }} onClick={() => { closeMenu(); router.push('/account'); }}>
                      <span>Log in</span>
                    </button>
                    <button type="button" className="el-button fec-btn register-btn t-minor-button" style={{ width: '100%' }} onClick={() => { closeMenu(); router.push('/account?tab=register'); }}>
                      <span>register</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </header>
  );
}
