'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi as api } from '@/lib/adminApi';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Upload, Loader2, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then(r => r.data.data),
  });

  const [form, setForm] = useState<Record<string, string>>({});
  const [logoUploading, setLogoUploading] = useState(false);
  const [footerLogoUploading, setFooterLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const footerLogoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: () => api.put('/settings', form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['settings'] }); toast.success('Settings saved'); },
    onError: () => toast.error('Failed to save'),
  });

  const uploadLogo = async (file: File) => {
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, site_logo: res.data.data.url }));
      toast.success('Logo uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setLogoUploading(false); }
  };

  const uploadFooterLogo = async (file: File) => {
    setFooterLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, footer_logo: res.data.data.url }));
      toast.success('Footer logo uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setFooterLogoUploading(false); }
  };

  const uploadFavicon = async (file: File) => {
    setFaviconUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, site_favicon: res.data.data.url }));
      toast.success('Favicon uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setFaviconUploading(false); }
  };

  const fields = [
    { key: 'site_name', label: 'Site Name', type: 'text' },
    { key: 'site_description', label: 'Description', type: 'text' },
    { key: 'primary_color', label: 'Primary Color', type: 'color' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'social_facebook', label: 'Facebook URL', type: 'text' },
    { key: 'social_instagram', label: 'Instagram URL', type: 'text' },
    { key: 'shipping_charge', label: 'Shipping Charge (৳)', type: 'number' },
    { key: 'free_shipping_min', label: 'Free Shipping Min (৳)', type: 'number' },
    { key: 'bkash_number', label: 'bKash Number', type: 'text' },
    { key: 'nagad_number', label: 'Nagad Number', type: 'text' },
    { key: 'facebook_pixel_id', label: 'Facebook Pixel ID', type: 'text' },
    { key: 'footer_text', label: 'Footer Text', type: 'text' },
    { key: 'whatsapp_url', label: 'WhatsApp URL', type: 'text' },
    { key: 'sidebar_phone', label: 'Sidebar Phone', type: 'text' },
  ];

  if (isLoading) return <div className="h-64 bg-gray-100 rounded animate-pulse" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-6 max-w-2xl">
        {/* Logo & Favicon */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <label className="text-xs text-gray-500 block mb-2 font-medium">Site Logo</label>
            {form.site_logo && (
              <div className="mb-3 rounded-lg overflow-hidden border bg-gray-50 h-24 flex items-center justify-center p-2">
                <img src={form.site_logo} className="max-h-full max-w-full object-contain" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input ref={logoRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }} className="text-sm flex-1" />
              {logoUploading && <Loader2 size={16} className="animate-spin text-primary shrink-0" />}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <label className="text-xs text-gray-500 block mb-2 font-medium">Footer Logo</label>
            {form.footer_logo && (
              <div className="mb-3 rounded-lg overflow-hidden border bg-gray-800 h-24 flex items-center justify-center p-2">
                <img src={form.footer_logo} className="max-h-full max-w-full object-contain" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input ref={footerLogoRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFooterLogo(f); }} className="text-sm flex-1" />
              {footerLogoUploading && <Loader2 size={16} className="animate-spin text-primary shrink-0" />}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <label className="text-xs text-gray-500 block mb-2 font-medium">Favicon</label>
            {form.site_favicon ? (
              <div className="mb-3">
                <img src={form.site_favicon} className="w-10 h-10 rounded border object-cover" />
              </div>
            ) : (
              <div className="mb-3 w-10 h-10 rounded border bg-gray-50 flex items-center justify-center text-gray-400 text-xs">?</div>
            )}
            <div className="flex items-center gap-2">
              <input ref={faviconRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFavicon(f); }} className="text-sm flex-1" />
              {faviconUploading && <Loader2 size={16} className="animate-spin text-primary shrink-0" />}
            </div>
          </div>
        </div>

        {/* Other fields */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key} className={field.key === 'address' || field.key === 'footer_text' ? 'sm:col-span-2' : ''}>
                <label className="text-xs text-gray-500 block mb-1">{field.label}</label>
                {field.type === 'color' ? (
                  <input type="color" value={form[field.key] || '#00a7e1'} onChange={(e) => setForm(f => ({ ...f, [field.key]: e.target.value }))} className="w-full h-10 border border-gray-300 rounded px-1" />
                ) : (
                  <input type={field.type} value={form[field.key] || ''} onChange={(e) => setForm(f => ({ ...f, [field.key]: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                )}
              </div>
            ))}
          </div>
          <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="bg-primary text-white px-6 py-2.5 rounded font-medium hover:bg-primary-hover transition-colors mt-6 flex items-center gap-2 disabled:opacity-50">
            {updateMutation.isPending ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Settings</>}
          </button>
        </div>
      </div>
    </div>
  );
}
