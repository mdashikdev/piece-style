'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi as api } from '@/lib/adminApi';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Save, EyeOff, Eye } from 'lucide-react';

export default function AdminAnnouncementPage() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [text, setText] = useState('');
  const [active, setActive] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'announcement'],
    queryFn: () => api.get('/announcement').then(r => r.data.data),
  });

  useEffect(() => {
    if (data) {
      setText(data.text || '');
      setActive(data.active ?? true);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      setSaving(true);
      return api.post('/announcement', { text, active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcement'] });
      toast.success('Announcement saved');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to save'),
    onSettled: () => setSaving(false),
  });

  if (isLoading) {
    return <p className="text-gray-400 text-center py-16">Loading...</p>;
  }

  const previewText = text || 'Your announcement text here...';
  const parts = previewText.split(' — ');
  const primary = parts[0] || previewText;
  const secondary = parts[1] ? ` — ${parts[1]}` : '';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Announcement Bar</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage the announcement bar shown at the top of the store</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <div>
          <label className="text-xs text-gray-500 block mb-1.5 font-medium">Announcement Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="e.g. 1 Year Warranty — Free Shipping on orders over ৳3,000"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
          <p className="text-xs text-gray-400 mt-1">Use <code className="text-gray-500 bg-gray-100 px-1 rounded"> — </code> to separate mobile-only text (before) from desktop-only text (after)</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActive(!active)}
            className={`relative w-11 h-6 rounded-full transition-colors ${active ? 'bg-primary' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${active ? 'translate-x-5' : ''}`} />
          </button>
          <span className="text-sm text-gray-600 flex items-center gap-1.5">
            {active ? <Eye size={14} /> : <EyeOff size={14} />}
            {active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">Preview</p>
          <div className="rounded-lg overflow-hidden border">
            <div className="bg-announcement-bg text-announcement-text text-center text-xs sm:text-sm py-2.5">
              <div className="px-4">
                <span>{primary}</span>
                {secondary && <span className="hidden sm:inline">{secondary}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saving}
            className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Announcement</>}
          </button>
        </div>
      </div>
    </div>
  );
}
