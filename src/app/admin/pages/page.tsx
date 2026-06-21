'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi as api } from '@/lib/adminApi';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Edit2, Trash2, Plus, X, FileText } from 'lucide-react';

const emptyForm = { slug: '', title: '', content: '', published: false };

export default function AdminPagesPage() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{ type: 'add' | 'edit'; page?: any } | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'pages'],
    queryFn: () => api.get('/pages/all').then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/pages', form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'pages'] }); setModal(null); setForm(emptyForm); toast.success('Page created'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: () => api.put(`/pages/${modal?.page?.id}`, form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'pages'] }); setModal(null); setForm(emptyForm); toast.success('Page updated'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/pages/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'pages'] }); toast.success('Page deleted'); },
  });

  const openAdd = () => {
    setForm(emptyForm);
    setModal({ type: 'add' });
  };

  const openEdit = (p: any) => {
    setForm({ slug: p.slug, title: p.title, content: p.content || '', published: p.published });
    setModal({ type: 'edit', page: p });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Static Pages</h1>
        <button onClick={openAdd} className="bg-primary text-white px-4 py-2 rounded text-sm font-medium hover:bg-primary-hover flex items-center gap-1.5">
          <Plus size={15} /> Add Page
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-center py-16">Loading...</p>
      ) : data?.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <FileText size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 mb-1">No pages yet</p>
          <p className="text-sm text-gray-400">Click "Add Page" to create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.map((page: any) => (
            <div key={page.id} className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 p-3">
              <div className="w-12 h-12 bg-gray-100 rounded shrink-0 flex items-center justify-center">
                <FileText size={18} className="text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{page.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  /{page.slug}
                  {page.published ? <span className="text-green-600 ml-2">Published</span> : <span className="text-yellow-600 ml-2">Draft</span>}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(page)} className="px-2.5 py-1 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50">Edit</button>
                <button onClick={() => { if (confirm('Delete this page?')) deleteMutation.mutate(page.id); }} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{modal.type === 'add' ? 'Add Page' : 'Edit Page'}</h2>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 font-medium">Slug</label>
                <input required value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 font-medium">Title</label>
                <input required value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 font-medium">Content (HTML)</label>
                <textarea required value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))} rows={8} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm(f => ({ ...f, published: e.target.checked }))} className="accent-primary" />
                Published
              </label>

              <div className="flex gap-2 pt-2">
                {modal.type === 'add' ? (
                  <button onClick={() => createMutation.mutate()} disabled={!form.slug || !form.title} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50 flex items-center gap-1.5 flex-1 justify-center">
                    <Plus size={14} /> Create
                  </button>
                ) : (
                  <button onClick={() => updateMutation.mutate()} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50 flex items-center gap-1.5 flex-1 justify-center">
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
