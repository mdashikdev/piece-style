'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { Skeleton } from '@/components/Skeleton';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const { token, user, setAuth, logout } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then(r => r.data.data),
    enabled: !!token,
  });

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
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  if (!token) { router.push('/account'); return null; }

  return (
    <>
      <div className="bg-[#F9F9F9] pt-6 pb-2 md:pb-6">
        <div className="container-main text-center">
          <div className="top-mobile-menu">
            <div className="top">
              <h1>My Orders</h1>
              <div className="account-info">{user?.name} / {user?.phone}</div>
            </div>
            <div id="tabs" className="tabs flex-align-center flex justify-center">
              <Link href="/account/orders" className="fec-btn-link">My Order</Link>
              <Link href="/account/addresses" className="fec-btn-link">Address Book</Link>
              <button onClick={() => { logout(); }} className="fec-btn-link">Sign out</button>
            </div>
          </div>
        </div>
      </div>
      <div className="container-main animate-fade-in">
        <div className="content-list">
          <div className="top-title">
            <h2 className="uppercase">My Order</h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="border border-border rounded-2xl p-5">
                  <Skeleton className="h-5 w-32 mb-3" />
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm">No orders yet</div>
          ) : (
            <>
              {/* Mobile list - table-like cards */}
              <div className="block md:hidden space-y-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="bg-white border border-border/80 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <Link href={`/account/orders/${order.id}`} className="order-id !text-sm">#{order.id.replace(/\D/g, '').slice(-6)}</Link>
                        <span className="order-items !text-[11px] !text-gray-400 !inline !ml-2">
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${statusStyles[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      {order.items?.slice(0, 2).map((item: any) => {
                        const parseImages = (images: string | null | undefined): string | null => {
                          if (!images) return null;
                          try { return JSON.parse(images)[0]; } catch { return null; }
                        };
                        const src = parseImages(item.product?.images);
                        return (
                          <div key={item.id} className="flex items-center gap-3">
                            {src ? (
                              <img src={getImageUrl(src)} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-50 flex-shrink-0 border border-gray-100"/>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0"/>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-medium text-gray-800 leading-tight truncate">{item.product?.title || item.name}</p>
                              {item.quantity > 1 && <p className="text-[11px] text-gray-400 mt-0.5">Qty: {item.quantity}</p>}
                            </div>
                          </div>
                        );
                      })}
                      {order.items?.length > 2 && (
                        <p className="text-[12px] text-gray-400 pl-[52px]">+{order.items.length - 2} more</p>
                      )}
                    </div>
                    <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <span className="text-[13px] font-semibold text-gray-900">{formatPrice(order.total)}</span>
                      <Link href={`/account/orders/${order.id}`} className="view-link !text-[11px]">
                        View Details <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block">
                <div className="el-table" style={{ width: '100%', fontSize: 14, marginTop: -4 }}>
                  <div className="el-table__header-wrapper">
                    <table cellSpacing={0} cellPadding={0} border={0} className="el-table__header">
                      <colgroup>
                        <col width="200" />
                        <col width="180" />
                        <col width="120" />
                        <col width="100" />
                        <col width="80" />
                      </colgroup>
                      <thead>
                        <tr>
                          <th className="el-table__cell is-leaf"><div className="cell">Orders</div></th>
                          <th className="el-table__cell is-leaf"><div className="cell">Items</div></th>
                          <th className="el-table__cell is-leaf"><div className="cell">Status</div></th>
                          <th className="el-table__cell is-leaf"><div className="cell">Total</div></th>
                          <th className="el-table__cell is-leaf is-right"><div className="cell">Actions</div></th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                  <div className="el-table__body-wrapper">
                    <table cellSpacing={0} cellPadding={0} border={0} className="el-table__body">
                      <colgroup>
                        <col width="200" />
                        <col width="180" />
                        <col width="120" />
                        <col width="100" />
                        <col width="80" />
                      </colgroup>
                      <tbody>
                        {orders.map((order: any) => (
                          <tr key={order.id} className="el-table__row">
                            <td className="el-table__cell">
                              <div className="cell">
                                <Link href={`/account/orders/${order.id}`}>
                                  <span className="order-id">#{order.id.replace(/\D/g, '').slice(-6)}</span>
                                  {order.items && (
                                    <span className="order-items">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                                  )}
                                </Link>
                              </div>
                            </td>
                            <td className="el-table__cell">
                              <div className="cell">
                                <div className="flex flex-col gap-1.5">
                                  {order.items?.slice(0, 2).map((item: any) => {
                                    const src = (() => {
                                      if (!item.product?.images) return null;
                                      try { return JSON.parse(item.product.images)[0]; } catch { return null; }
                                    })();
                                    return (
                                      <div key={item.id} className="flex items-center gap-2">
                                        {src ? (
                                          <img src={getImageUrl(src)} alt="" className="w-8 h-8 rounded object-cover bg-gray-50 flex-shrink-0"/>
                                        ) : (
                                          <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0"/>
                                        )}
                                        <span className="text-xs truncate max-w-[120px]">{item.product?.title || item.name}</span>
                                      </div>
                                    );
                                  })}
                                  {order.items?.length > 2 && (
                                    <span className="text-[11px] text-gray-400">+{order.items.length - 2} more</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="el-table__cell">
                              <div className="cell">
                                <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                              </div>
                            </td>
                            <td className="el-table__cell">
                              <div className="cell">{formatPrice(order.total)}</div>
                            </td>
                            <td className="el-table__cell is-right">
                              <div className="cell">
                                <Link href={`/account/orders/${order.id}`} className="view-link">
                                  View <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
