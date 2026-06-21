'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi as api } from '@/lib/adminApi';
import Link from 'next/link';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/lib/utils';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => api.get('/products?limit=100').then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); toast.success('Product deleted'); },
    onError: () => toast.error('Delete failed'),
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) => api.put(`/products/${id}`, { featured }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); toast.success('Updated'); },
    onError: () => toast.error('Failed to update'),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="bg-primary text-white px-4 py-2 rounded text-sm font-medium hover:bg-primary-hover transition-colors flex items-center gap-2">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2 md:py-3 px-2 md:px-4 hidden md:table-cell">Image</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4">Product</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 hidden sm:table-cell">Product Code</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 hidden lg:table-cell">Category</th>
                <th className="text-right py-2 md:py-3 px-2 md:px-4">Price</th>
                <th className="text-right py-2 md:py-3 px-2 md:px-4 hidden sm:table-cell">Stock</th>
                <th className="text-center py-2 md:py-3 px-2 md:px-4 hidden md:table-cell">Featured</th>
                <th className="text-center py-2 md:py-3 px-2 md:px-4 hidden sm:table-cell">Status</th>
                <th className="text-right py-2 md:py-3 px-2 md:px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="py-8 text-center text-gray-400">Loading...</td></tr>
              ) : data?.data?.map((product: any) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 md:py-3 px-2 md:px-4 hidden md:table-cell">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded overflow-hidden bg-gray-100">
                      {(() => {
                        try {
                          const imgs = JSON.parse(product.images);
                          const src = imgs?.[0] ? getImageUrl(imgs[0]) : '/placeholder.svg';
                          return <img src={src} alt={product.title} className="w-full h-full object-cover" />;
                        } catch {
                          return <img src="/placeholder.svg" alt="" className="w-full h-full object-cover" />;
                        }
                      })()}
                    </div>
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4">
                    <Link href={`/admin/products/${product.id}/edit`} className="font-medium hover:text-primary text-xs md:text-sm">{product.title}</Link>
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-gray-500 hidden sm:table-cell">{product.sku}</td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-gray-500 hidden lg:table-cell">{product.category?.name}</td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-right font-medium text-xs md:text-sm">৳{product.price}</td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-right hidden sm:table-cell">
                    <span className={product.stock <= 5 ? 'text-red-600 font-medium' : ''}>{product.stock}</span>
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-center hidden md:table-cell">
                    <button
                      onClick={() => toggleFeatured.mutate({ id: product.id, featured: !product.featured })}
                      className={`p-1 transition-colors ${product.featured ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                    >
                      <Star size={14} className={product.featured ? 'fill-yellow-500' : ''} />
                    </button>
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-center hidden sm:table-cell">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] md:text-xs ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{product.status}</span>
                  </td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-right">
                    <div className="flex items-center justify-end gap-1 md:gap-2">
                      <Link href={`/admin/products/${product.id}/edit`} className="p-1 hover:bg-gray-100 rounded"><Edit size={12} /></Link>
                      <button onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(product.id); }} className="p-1 hover:bg-red-50 rounded text-red-500"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
