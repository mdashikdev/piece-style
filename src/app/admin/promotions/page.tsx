'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi as api } from '@/lib/adminApi';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Upload, Loader2, Plus, X, Search, ExternalLink, Image as ImageIcon } from 'lucide-react';

const sections = [
  { value: 'after_categories', label: 'After Categories Section' },
  { value: 'after_featured', label: 'After "Customers Choose This" Section' },
];

function ProductPicker({ value, onChange }: { value: string; onChange: (slug: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const { data: products } = useQuery({
    queryKey: ['promo-products', search],
    queryFn: () => api.get('/products', { params: { search, limit: 20 } }).then(r => r.data.data),
    enabled: open,
  });

  const selected = products?.find((p: any) => p.slug === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="text-xs text-gray-500 block mb-1.5 font-medium">Linked Product</label>
      <div className="relative">
        <input
          readOnly
          value={selected ? selected.title : value ? value : ''}
          placeholder="Select a product..."
          onClick={() => setOpen(!open)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm cursor-pointer bg-white"
        />
        {value && (
          <button onClick={() => { onChange(''); setSearch(''); }} className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"><X size={14} /></button>
        )}
        <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary"
            />
          </div>
          {products?.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No products found</p>
          ) : (
            products?.map((p: any) => {
              const imgs = (() => { try { return JSON.parse(p.images); } catch { return []; } })();
              return (
                <button
                  key={p.id}
                  onClick={() => { onChange(p.slug); setOpen(false); setSearch(''); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${value === p.slug ? 'bg-primary/5' : ''}`}
                >
                  {imgs[0] ? (
                    <img src={imgs[0]} alt="" className="w-8 h-8 rounded object-cover bg-gray-100" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-300 text-[10px]">img</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{p.title}</p>
                    <p className="text-[10px] text-gray-400">৳{p.price}</p>
                  </div>
                  {value === p.slug && <span className="text-primary text-[10px] font-medium">Selected</span>}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPromotionsPage() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileMobile, setFileMobile] = useState<File | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editFileMobile, setEditFileMobile] = useState<File | null>(null);
  const [editUploading, setEditUploading] = useState(false);

  const [title, setTitle] = useState('');
  const [productSlug, setProductSlug] = useState('');
  const [section, setSection] = useState('after_categories');

  const [modal, setModal] = useState<{ type: 'add' | 'edit'; item?: any } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const fileMobileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);
  const editFileMobileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'promotions'],
    queryFn: () => api.get('/promotions/all').then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Select an image');
      if (!productSlug) throw new Error('Select a product');
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      const uploadRes = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      let mobileUrl: string | null = null;
      if (fileMobile) {
        const fdMobile = new FormData();
        fdMobile.append('file', fileMobile);
        const mobileRes = await api.post('/upload', fdMobile, { headers: { 'Content-Type': 'multipart/form-data' } });
        mobileUrl = mobileRes.data.data.url;
      }
      return api.post('/promotions/all', { image: uploadRes.data.data.url, imageMobile: mobileUrl, title: title || null, productSlug, section });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'promotions'] }); setModal(null); setFile(null); setFileMobile(null); setTitle(''); setProductSlug(''); toast.success('Promotion created'); },
    onError: (err: any) => toast.error(err.response?.data?.error || err.message || 'Failed'),
    onSettled: () => setUploading(false),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      setEditUploading(true);
      const data: any = { title: title || null, productSlug, section };
      if (editFile) {
        const fd = new FormData();
        fd.append('file', editFile);
        const uploadRes = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        data.image = uploadRes.data.data.url;
      }
      if (editFileMobile) {
        const fdMobile = new FormData();
        fdMobile.append('file', editFileMobile);
        const mobileRes = await api.post('/upload', fdMobile, { headers: { 'Content-Type': 'multipart/form-data' } });
        data.imageMobile = mobileRes.data.data.url;
      }
      return api.put(`/promotions/${id}`, data);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'promotions'] }); setModal(null); setEditFile(null); setEditFileMobile(null); toast.success('Promotion updated'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
    onSettled: () => setEditUploading(false),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/promotions/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'promotions'] }); toast.success('Promotion deleted'); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Promotions</h1>
        <button onClick={() => { setModal({ type: 'add' }); setFile(null); setFileMobile(null); setTitle(''); setProductSlug(''); setSection('after_categories'); }} className="bg-primary text-white px-4 py-2 rounded text-sm font-medium hover:bg-primary-hover flex items-center gap-1.5">
          <Plus size={15} /> Add Promotion
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-center py-16">Loading...</p>
      ) : data?.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <ImageIcon size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 mb-1">No promotions yet</p>
          <p className="text-sm text-gray-400">Add promotion banners that appear on the homepage.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.map((item: any) => (
            <div key={item.id} className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 p-3">
              <div className="w-32 h-20 bg-gray-100 rounded shrink-0 overflow-hidden">
                <img src={item.image} className="w-full h-full object-cover" />
              </div>
              {item.imageMobile && (
                <div className="w-16 h-20 bg-gray-100 rounded shrink-0 overflow-hidden border-2 border-blue-200">
                  <img src={item.imageMobile} className="w-full h-full object-cover" />
                  <span className="block text-[10px] text-center text-blue-500 leading-tight">Mobile</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                {item.title && <p className="text-sm font-medium truncate">{item.title}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{sections.find(s => s.value === item.section)?.label || item.section}</p>
                <p className="text-xs text-primary truncate mt-0.5">
                  <ExternalLink size={10} className="inline mr-0.5" />
                  /products/{item.productSlug}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setModal({ type: 'edit', item }); setEditFile(null); setEditFileMobile(null); setTitle(item.title || ''); setProductSlug(item.productSlug); setSection(item.section); }} className="px-2.5 py-1 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50">Edit</button>
                <button onClick={() => { if (confirm('Delete this promotion?')) deleteMutation.mutate(item.id); }} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{modal.type === 'add' ? 'Add Promotion' : 'Edit Promotion'}</h2>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
            </div>

            {modal.type === 'edit' && (
              <div className="mb-4 space-y-2">
                <div className="rounded-lg overflow-hidden border bg-gray-50">
                  <img src={editFile ? URL.createObjectURL(editFile) : modal.item.image} className="w-full h-40 object-cover" />
                </div>
                {(editFileMobile || modal.item.imageMobile) && (
                  <div className="rounded-lg overflow-hidden border bg-gray-50">
                    <img src={editFileMobile ? URL.createObjectURL(editFileMobile) : modal.item.imageMobile} className="w-full h-28 object-cover" />
                    <span className="block text-xs text-center text-blue-500 pb-1">Mobile image</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 font-medium">Title <span className="text-gray-300">(optional)</span></label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Summer Sale" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 font-medium">Desktop Image</label>
                <input ref={modal.type === 'add' ? fileRef : editFileRef} type="file" accept="image/*" onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  if (modal.type === 'add') setFile(f);
                  else setEditFile(f);
                }} className="w-full text-sm" />
                {modal.type === 'add' && file && (
                  <div className="mt-2 rounded overflow-hidden border">
                    <img src={URL.createObjectURL(file)} className="w-full h-32 object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 font-medium">Mobile Image <span className="text-gray-300">(optional)</span></label>
                <input ref={modal.type === 'add' ? fileMobileRef : editFileMobileRef} type="file" accept="image/*" onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  if (modal.type === 'add') setFileMobile(f);
                  else setEditFileMobile(f);
                }} className="w-full text-sm" />
                {modal.type === 'add' && fileMobile && (
                  <div className="mt-2 rounded overflow-hidden border">
                    <img src={URL.createObjectURL(fileMobile)} className="w-full h-32 object-cover" />
                  </div>
                )}
              </div>
              <ProductPicker value={productSlug} onChange={setProductSlug} />
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 font-medium">Section</label>
                <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {sections.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                {modal.type === 'add' ? (
                  <button onClick={() => createMutation.mutate()} disabled={uploading || !file || !productSlug} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50 flex items-center gap-1.5 flex-1 justify-center">
                    {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : <><Plus size={14} /> Create</>}
                  </button>
                ) : (
                  <button onClick={() => updateMutation.mutate({ id: modal.item.id })} disabled={editUploading} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50 flex items-center gap-1.5 flex-1 justify-center">
                    {editUploading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Changes'}
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
