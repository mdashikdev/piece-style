'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi as api } from '@/lib/adminApi';

export default function AdminCustomersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: () => api.get('/users?limit=100').then(r => r.data),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2 md:py-3 px-2 md:px-4">Name</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4">Mobile Number</th>
                <th className="text-center py-2 md:py-3 px-2 md:px-4 hidden sm:table-cell">Orders</th>
                <th className="text-right py-2 md:py-3 px-2 md:px-4">Total Spent</th>
                <th className="text-right py-2 md:py-3 px-2 md:px-4 hidden sm:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading...</td></tr>
              ) : data?.data?.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No customers found</td></tr>
              ) : (
                data?.data?.map((customer: any) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 md:py-3 px-2 md:px-4 font-medium text-xs md:text-sm">{customer.name}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-gray-600 text-xs md:text-sm">{customer.phone}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center hidden sm:table-cell">{customer.totalOrders}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-right font-medium text-xs md:text-sm">৳{customer.totalSpent?.toLocaleString()}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-right text-gray-500 hidden sm:table-cell">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
