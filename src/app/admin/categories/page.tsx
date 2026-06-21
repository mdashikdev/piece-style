'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi as api } from '@/lib/adminApi';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Edit2, Trash2, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{ type: 'add' | 'edit'; category?: any } | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', image: '' });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/categories', { name: form.name, slug: form.slug, image: form.image || undefined }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); setModal(null); setForm({ name: '', slug: '', image: '' }); toast.success('Category created'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: () => api.put(`/categories/${modal?.category?.id}`, { name: form.name, slug: form.slug, image: form.image || undefined }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); setModal(null); setForm({ name: '', slug: '', image: '' }); toast.success('Category updated'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); toast.success('Category deleted'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to delete category'),
  });

  const handleUpload = async (file: File | null, cb: (url: string) => void) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      cb(res.data.data[0].url);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const openAdd = () => {
    setForm({ name: '', slug: '', image: '' });
    setModal({ type: 'add' });
  };

  const openEdit = (cat: any) => {
    setForm({ name: cat.name, slug: cat.slug, image: cat.image || '' });
    setModal({ type: 'edit', category: cat });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={openAdd} className="bg-primary text-white px-4 py-2 rounded text-sm font-medium hover:bg-primary-hover flex items-center gap-1.5">
          <Plus size={15} /> Add Category
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-center py-16">Loading...</p>
      ) : data?.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <ImageIcon size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 mb-1">No categories yet</p>
          <p className="text-sm text-gray-400">Click "Add Category" to create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.map((cat: any) => (
            <div key={cat.id} className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 p-3">
              <div className="w-16 h-16 bg-gray-100 rounded shrink-0 overflow-hidden">
                {cat.image ? (
                  <img src={cat.image} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20} /></div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{cat.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">/{cat.slug}</p>
              </div>
              <span className="text-xs text-gray-400">{cat._count?.products} products</span>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(cat)} className="px-2.5 py-1 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50">Edit</button>
                <button onClick={() => { if (confirm('Delete this category?')) deleteMutation.mutate(cat.id); }} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{modal.type === 'add' ? 'Add Category' : 'Edit Category'}</h2>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
            </div>

            {modal.type === 'edit' && form.image && (
              <div className="mb-4 rounded-lg overflow-hidden border bg-gray-50">
                <img src={form.image} className="w-full h-40 object-cover" />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 font-medium">Name</label>
                <input required value={form.name} onChange={(e) => { const n = e.target.value; setForm(f => ({ ...f, name: n, slug: n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 font-medium">Slug</label>
                <input value={form.slug} readOnly className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 font-medium">Image</label>
                {modal.type === 'add' && form.image ? (
                  <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden group">
                    <img src={form.image} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setForm(f => ({ ...f, image: '' }))} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"><X size={14} /></button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-4 cursor-pointer hover:border-primary text-gray-400 hover:text-primary text-sm">
                    <Upload size={16} />{uploading ? 'Uploading...' : 'Upload Image'}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0] || null, (url) => setForm(f => ({ ...f, image: url })))} disabled={uploading} />
                  </label>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                {modal.type === 'add' ? (
                  <button onClick={() => createMutation.mutate()} disabled={uploading || !form.name} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50 flex items-center gap-1.5 flex-1 justify-center">
                    <Plus size={14} /> Create
                  </button>
                ) : (
                  <button onClick={() => updateMutation.mutate()} disabled={uploading} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50 flex items-center gap-1.5 flex-1 justify-center">
                    Save Changes
                  </button>
                )}
                <button onClick={() => setModal(null)} className="px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
