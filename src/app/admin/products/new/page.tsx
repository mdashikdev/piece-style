'use client';

import { useState } from 'react';
import { adminApi as api } from '@/lib/adminApi';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import ImageUploader from '@/components/ImageUploader';

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', description: '', price: '', comparePrice: '', sku: '', stock: '0', categoryId: '', featured: false, status: 'ACTIVE' });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => api.get('/categories').then(r => r.data.data) });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/products', {
        ...form,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        stock: parseInt(form.stock),
        images: imageUrls,
      });
      toast.success('Product created!');
      router.push('/admin/products');
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600 block mb-1">Title *</label>
            <input required value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600 block mb-1">Description *</label>
            <textarea required value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={4} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Price *</label>
            <input type="number" required value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Compare Price</label>
            <input type="number" value={form.comparePrice} onChange={(e) => setForm(f => ({ ...f, comparePrice: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Product Code *</label>
            <input required value={form.sku} onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Stock *</label>
            <input type="number" required value={form.stock} onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Category *</label>
            <select required value={form.categoryId} onChange={(e) => setForm(f => ({ ...f, categoryId: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="">Select category</option>
              {categories?.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm(f => ({ ...f, featured: e.target.checked }))} className="accent-primary" />
              <span className="text-sm">Featured</span>
            </label>
            <label className="flex items-center gap-2">
              <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className="border border-gray-300 rounded px-2 py-1 text-sm">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </label>
          </div>
          <div className="sm:col-span-2">
            <ImageUploader images={imageUrls} onChange={setImageUrls} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-2.5 rounded font-medium hover:bg-primary-hover transition-colors disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}
