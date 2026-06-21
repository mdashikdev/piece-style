'use client';

import { useState } from 'react';
import { adminApi as api } from '@/lib/adminApi';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/Skeleton';
import ImageUploader from '@/components/ImageUploader';

interface FormState {
  title: string; description: string; price: string; comparePrice: string;
  sku: string; stock: string; categoryId: string; featured: boolean; status: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: () => api.get(`/products/${id}`).then(r => r.data.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
  });

  const [form, setForm] = useState<FormState | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  if (product && !form) {
    let images: string[] = [];
    try { images = JSON.parse(product.images || '[]'); } catch {}
    setForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      comparePrice: product.comparePrice ? String(product.comparePrice) : '',
      sku: product.sku || '',
      stock: String(product.stock),
      categoryId: product.categoryId || '',
      featured: product.featured || false,
      status: product.status || 'ACTIVE',
    });
    setImageUrls(images);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setLoading(true);
    try {
      await api.put(`/products/${id}`, {
        ...form,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        stock: parseInt(form.stock),
        images: imageUrls,
      });
      toast.success('Product updated!');
      router.push('/admin/products');
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  if (loadingProduct) return <div className="max-w-3xl"><Skeleton className="h-8 w-48 mb-6" /><Skeleton className="h-96 w-full rounded-lg" /></div>;
  if (!product) return <div className="max-w-3xl"><p>Product not found</p></div>;
  if (!form) return null;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products" className="p-1.5 hover:bg-gray-100 rounded"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600 block mb-1">Title *</label>
            <input required value={form.title} onChange={(e) => setForm(prev => ({ ...prev!, title: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600 block mb-1">Description *</label>
            <textarea required value={form.description} onChange={(e) => setForm(prev => ({ ...prev!, description: e.target.value }))} rows={4} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Price *</label>
            <input type="number" required value={form.price} onChange={(e) => setForm(prev => ({ ...prev!, price: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Compare Price</label>
            <input type="number" value={form.comparePrice} onChange={(e) => setForm(prev => ({ ...prev!, comparePrice: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Product Code *</label>
            <input required value={form.sku} onChange={(e) => setForm(prev => ({ ...prev!, sku: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Stock *</label>
            <input type="number" required value={form.stock} onChange={(e) => setForm(prev => ({ ...prev!, stock: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Category *</label>
            <select required value={form.categoryId} onChange={(e) => setForm(prev => ({ ...prev!, categoryId: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="">Select category</option>
              {categories?.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm(prev => ({ ...prev!, featured: e.target.checked }))} className="accent-primary" />
              <span className="text-sm">Featured</span>
            </label>
            <label className="flex items-center gap-2">
              <select value={form.status} onChange={(e) => setForm(prev => ({ ...prev!, status: e.target.value }))} className="border border-gray-300 rounded px-2 py-1 text-sm">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </label>
          </div>
          <div className="sm:col-span-2">
            <ImageUploader images={imageUrls} onChange={setImageUrls} />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-2.5 rounded font-medium hover:bg-primary-hover transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/admin/products" className="px-6 py-2.5 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
