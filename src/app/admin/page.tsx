'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi as api } from '@/lib/adminApi';
import { Package, ShoppingCart, Users, DollarSign, AlertTriangle, Clock } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data.data),
  });

  if (isLoading) return <div className="space-y-6"><div className="h-32 bg-gray-100 rounded animate-pulse" /><div className="h-64 bg-gray-100 rounded animate-pulse" /></div>;

  const stats = data?.stats;

  const cards = [
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: Package, color: 'bg-blue-500' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'bg-green-500' },
    { label: 'Revenue', value: `৳${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-purple-500' },
    { label: 'Customers', value: stats?.totalCustomers || 0, icon: Users, color: 'bg-orange-500' },
    { label: 'Pending Orders', value: stats?.pendingOrders || 0, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Low Stock Items', value: stats?.lowStockProducts || 0, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
              <card.icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 md:py-3 px-2">Order</th>
                <th className="text-left py-2 md:py-3 px-2 hidden sm:table-cell">Customer</th>
                <th className="text-left py-2 md:py-3 px-2">Status</th>
                <th className="text-left py-2 md:py-3 px-2 hidden md:table-cell">Payment</th>
                <th className="text-right py-2 md:py-3 px-2">Total</th>
                <th className="text-right py-2 md:py-3 px-2 hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentOrders?.map((order: any) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 md:py-3 px-2 font-mono text-xs">#{order.id.replace(/\D/g, '').slice(-6)}</td>
                  <td className="py-2 md:py-3 px-2 hidden sm:table-cell">{order.user?.name}</td>
                  <td className="py-2 md:py-3 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] md:text-xs font-medium ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2 md:py-3 px-2 hidden md:table-cell">
                    <span className={`text-xs ${order.paymentStatus === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>{order.paymentStatus}</span>
                  </td>
                  <td className="py-2 md:py-3 px-2 text-right font-medium text-xs md:text-sm">৳{order.total.toLocaleString()}</td>
                  <td className="py-2 md:py-3 px-2 text-right text-gray-500 hidden sm:table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
