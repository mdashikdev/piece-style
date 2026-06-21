'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi as api } from '@/lib/adminApi';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Upload, Loader2, Save, X, Search, ExternalLink } from 'lucide-react';

function ProductPicker({ value, onChange }: { value: string; onChange: (slug: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const { data: products } = useQuery({
    queryKey: ['popup-products', search],
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

export default function AdminPopupPage() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imageMobile, setImageMobile] = useState<File | null>(null);
  const [productSlug, setProductSlug] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);
  const fileMobileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'popup'],
    queryFn: () => api.get('/popup').then(r => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      setSaving(true);
      let imageUrl = data?.image || '';
      let mobileUrl = data?.imageMobile || null;

      if (image) {
        const fd = new FormData();
        fd.append('file', image);
        const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrl = res.data.data.url;
      }
      if (imageMobile) {
        const fd = new FormData();
        fd.append('file', imageMobile);
        const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        mobileUrl = res.data.data.url;
      }

      return api.post('/popup', { image: imageUrl, imageMobile: mobileUrl, productSlug });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'popup'] });
      toast.success(data ? 'Popup updated' : 'Popup created');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
    onSettled: () => setSaving(false),
  });

  if (isLoading) {
    return <p className="text-gray-400 text-center py-16">Loading...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Popup</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage the promotional popup shown to first-time visitors</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="flex gap-6">
          <div className="w-72 shrink-0 space-y-3">
            <div className="rounded-lg overflow-hidden border bg-gray-50">
              {image ? (
                <img src={URL.createObjectURL(image)} className="w-full h-44 object-cover" />
              ) : data?.image ? (
                <img src={data.image} className="w-full h-44 object-cover" />
              ) : (
                <div className="w-full h-44 flex items-center justify-center text-gray-300 text-sm">No image</div>
              )}
            </div>
            {(imageMobile || data?.imageMobile) && (
              <div className="rounded-lg overflow-hidden border bg-gray-50">
                <img src={imageMobile ? URL.createObjectURL(imageMobile) : data.imageMobile} className="w-full h-28 object-cover" />
                <span className="block text-xs text-center text-blue-500 pb-1">Mobile image</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 font-medium">Desktop Image</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="w-full text-sm" />
              {data?.image && !image && (
                <p className="text-xs text-gray-400 mt-1">Leave empty to keep current image</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 font-medium">Mobile Image <span className="text-gray-300">(optional)</span></label>
              <input ref={fileMobileRef} type="file" accept="image/*" onChange={(e) => setImageMobile(e.target.files?.[0] || null)} className="w-full text-sm" />
              {data?.imageMobile && !imageMobile && (
                <p className="text-xs text-gray-400 mt-1">Leave empty to keep current image</p>
              )}
            </div>
            <ProductPicker value={productSlug || data?.productSlug || ''} onChange={setProductSlug} />
            <div className="flex gap-2 pt-2">
              <button onClick={() => saveMutation.mutate()} disabled={saving} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50 flex items-center gap-1.5">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> {data ? 'Update Popup' : 'Create Popup'}</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
