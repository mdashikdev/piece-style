'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi as api } from '@/lib/adminApi';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () => api.get('/orders/all').then(r => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, trackingNumber }: { id: string; status?: string; trackingNumber?: string }) => api.put(`/orders/${id}/status`, { status, trackingNumber }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }); toast.success('Order updated'); },
    onError: () => toast.error('Update failed'),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2 md:py-3 px-2 md:px-4">Order #</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4">Customer</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 hidden sm:table-cell">Items</th>
                <th className="text-right py-2 md:py-3 px-2 md:px-4">Total</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 hidden md:table-cell">Payment</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4">Status</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 hidden lg:table-cell">Action</th>
                <th className="text-right py-2 md:py-3 px-2 md:px-4 hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400">Loading...</td></tr>
              ) : data?.data?.map((order: any) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 md:py-3 px-2 md:px-4 font-mono text-xs">#{order.id.replace(/\D/g, '').slice(-6)}</td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm">{order.user?.name}<br /><span className="text-[10px] md:text-xs text-gray-400">{order.user?.email}</span></td>
                  <td className="py-2 md:py-3 px-2 md:px-4 hidden sm:table-cell">{order.items?.length}</td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-right font-medium text-xs md:text-sm">৳{order.total}</td>
                  <td className="py-2 md:py-3 px-2 md:px-4 hidden md:table-cell">
                    <span className="text-xs">{order.paymentMethod}<br /><span className={order.paymentStatus === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}>{order.paymentStatus}</span></span>
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4">
                    <select value={order.status} onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value })} className="border border-gray-300 rounded px-1.5 md:px-2 py-1 text-[10px] md:text-xs">
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4 hidden lg:table-cell">
                    <input type="text" placeholder="Tracking #" className="border border-gray-300 rounded px-1.5 md:px-2 py-1 text-[10px] md:text-xs w-20 md:w-24" onBlur={(e) => { if (e.target.value) updateStatus.mutate({ id: order.id, trackingNumber: e.target.value }); }} />
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-right text-gray-500 hidden sm:table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
