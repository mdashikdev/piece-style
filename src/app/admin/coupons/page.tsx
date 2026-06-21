'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi as api } from '@/lib/adminApi';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, X, Trash2, Tag, Percent } from 'lucide-react';

const emptyForm = { code: '', type: 'PERCENTAGE', value: '', minOrder: '0', maxUses: '100', expiresAt: '', active: true };

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{ type: 'add' | 'edit'; coupon?: any } | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => api.get('/coupons').then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/coupons', { ...form, value: parseFloat(form.value), minOrder: parseFloat(form.minOrder), maxUses: parseInt(form.maxUses) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] }); setModal(null); setForm(emptyForm); toast.success('Coupon created'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: () => api.put(`/coupons/${modal?.coupon?.id}`, { ...form, value: parseFloat(form.value), minOrder: parseFloat(form.minOrder), maxUses: parseInt(form.maxUses) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] }); setModal(null); setForm(emptyForm); toast.success('Coupon updated'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/coupons/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] }); toast.success('Coupon deleted'); },
  });

  const openAdd = () => {
    setForm(emptyForm);
    setModal({ type: 'add' });
  };

  const openEdit = (c: any) => {
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      minOrder: String(c.minOrder || 0),
      maxUses: String(c.maxUses || 100),
      expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '',
      active: c.active,
    });
    setModal({ type: 'edit', coupon: c });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <button onClick={openAdd} className="bg-primary text-white px-4 py-2 rounded text-sm font-medium hover:bg-primary-hover flex items-center gap-1.5">
          <Plus size={15} /> Add Coupon
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-center py-16">Loading...</p>
      ) : data?.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Tag size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 mb-1">No coupons yet</p>
          <p className="text-sm text-gray-400">Click "Add Coupon" to create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.map((coupon: any) => (
            <div key={coupon.id} className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 p-3">
              <div className="w-12 h-12 bg-gray-100 rounded shrink-0 flex items-center justify-center">
                {coupon.type === 'PERCENTAGE' ? <Percent size={18} className="text-gray-500" /> : <Tag size={18} className="text-gray-500" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-semibold bg-gray-100 px-1.5 py-0.5">{coupon.code}</span>
                  {!coupon.active && <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5">Inactive</span>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {coupon.type === 'PERCENTAGE' ? `${coupon.value}% off` : `৳${coupon.value} off`}
                  {' · '}Min: ৳{coupon.minOrder}
                  {' · '}Used: {coupon.usedCount}/{coupon.maxUses}
                  {' · '}Expires: {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(coupon)} className="px-2.5 py-1 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50">Edit</button>
                <button onClick={() => { if (confirm('Delete this coupon?')) deleteMutation.mutate(coupon.id); }} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{modal.type === 'add' ? 'Add Coupon' : 'Edit Coupon'}</h2>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5 font-medium">Code</label>
                  <input required value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5 font-medium">Type</label>
                  <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5 font-medium">Value</label>
                  <input type="number" required value={form.value} onChange={(e) => setForm(f => ({ ...f, value: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5 font-medium">Min Order</label>
                  <input type="number" value={form.minOrder} onChange={(e) => setForm(f => ({ ...f, minOrder: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5 font-medium">Max Uses</label>
                  <input type="number" value={form.maxUses} onChange={(e) => setForm(f => ({ ...f, maxUses: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5 font-medium">Expires</label>
                  <input type="date" required value={form.expiresAt} onChange={(e) => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm(f => ({ ...f, active: e.target.checked }))} className="accent-primary" />
                Active
              </label>

              <div className="flex gap-2 pt-2">
                {modal.type === 'add' ? (
                  <button onClick={() => createMutation.mutate()} disabled={!form.code || !form.value} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50 flex items-center gap-1.5 flex-1 justify-center">
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
