'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Skeleton } from '@/components/Skeleton';
import { ChevronDown } from 'lucide-react';

const BD_DIVISIONS = [
  'Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh',
];

const DISTRICTS: Record<string, string[]> = {
  Dhaka: ['Dhaka', 'Gazipur', 'Narayanganj', 'Tangail', 'Munshiganj', 'Manikganj', 'Narsingdi', 'Kishoreganj', 'Gopalganj', 'Madaripur', 'Shariatpur', 'Rajbari', 'Faridpur'],
  Chattogram: ['Chattogram', "Cox's Bazar", 'Comilla', 'Brahmanbaria', 'Chandpur', 'Lakshmipur', 'Noakhali', 'Feni', 'Khagrachari', 'Rangamati', 'Bandarban'],
  Rajshahi: ['Rajshahi', 'Bogra', 'Naogaon', 'Natore', 'Joypurhat', 'Pabna', 'Sirajganj', 'Chapainawabganj'],
  Khulna: ['Khulna', 'Jessore', 'Satkhira', 'Bagerhat', 'Magura', 'Narail', 'Jhenaidah', 'Kushtia', 'Chuadanga', 'Meherpur'],
  Barishal: ['Barishal', 'Bhola', 'Patuakhali', 'Pirojpur', 'Jhalokati', 'Barguna'],
  Sylhet: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  Rangpur: ['Rangpur', 'Dinajpur', 'Thakurgaon', 'Panchagarh', 'Lalmonirhat', 'Kurigram', 'Nilphamari', 'Gaibandha'],
  Mymensingh: ['Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'],
};

interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

const emptyForm = {
  label: 'Home',
  name: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'Bangladesh',
  isDefault: false,
};

export default function AddressesPage() {
  const { token, user, setAuth, logout } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [hydrated, setHydrated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get('/addresses').then(r => r.data.data),
    enabled: !!token,
  });

  const saveMutation = useMutation({
    mutationFn: (data: { label: string; name: string; phone: string; street: string; city: string; state: string; zip: string; country: string; isDefault: boolean } & { id?: string }) => {
      const payload = {
        name: data.name,
        phone: data.phone,
        street: data.street,
        city: data.city,
        state: data.state || 'Bangladesh',
        zip: data.zip || '',
        label: data.label || 'Home',
        country: data.country || 'Bangladesh',
        isDefault: data.isDefault,
      };
      return data.id ? api.put(`/addresses/${data.id}`, payload) : api.post('/addresses', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      toast.success('Address saved');
    },
    onError: (err: any) => {
      console.error('Address save error:', err);
      toast.error(err?.response?.data?.error || 'Failed to save address');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address deleted');
    },
    onError: () => toast.error('Failed to delete address'),
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.token && parsed?.state?.user && !token) {
          setAuth(parsed.state.user, parsed.state.token);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  if (!token) { router.push('/account'); return null; }

  const openEdit = (addr: Address) => {
    setForm({
      label: addr.label || 'Home',
      name: addr.name,
      phone: addr.phone || '',
      street: addr.street,
      city: addr.city,
      state: 'Bangladesh',
      zip: addr.zip || '',
      country: 'Bangladesh',
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(editingId ? { ...form, id: editingId } : form);
  };

  const count = addresses?.length ?? 0;

  return (
    <>
      <div className="bg-[#F9F9F9] pt-6 pb-2 md:pb-6">
        <div className="container-main text-center">
          <div className="top-mobile-menu">
            <div className="top">
              <h1>Address Book</h1>
              <div className="account-info">{user?.name} / {user?.phone}</div>
            </div>
            <div id="tabs" className="tabs flex-align-center flex justify-center">
              <Link href="/account/orders" className="fec-btn-link">My Order</Link>
              <Link href="/account/addresses" className="fec-btn-link">Address Book</Link>
              <button onClick={() => { logout(); }} className="fec-btn-link">Sign out</button>
            </div>
          </div>
        </div>
      </div>
      <div className="container-main animate-fade-in">
        <div className="main-box">
          <div className="content-list">
            <div className="button-box">
              <div
                onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
                className="fec-btn t-primary-button-hover"
                style={{ borderRadius: 6, fontSize: 13 }}
              >
                Add New Address
              </div>
            </div>

            <div className="top-title">
              <h2 className="uppercase">Address Book{count > 0 ? ` (${count})` : ''}</h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1,2].map(i => (
                  <div key={i} className="item" style={{ padding: '20px' }}>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-4 w-36 mb-2" />
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                ))}
              </div>
            ) : count === 0 && !showForm ? (
              <div className="el-table__empty-block" style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="el-table__empty-text">No addresses yet</span>
              </div>
            ) : (
              <div className="address-list">
                {addresses?.map((addr: Address) => (
                  <div key={addr.id} className="item">
                    {addr.isDefault && (
                      <div className="default-tag">default address</div>
                    )}
                    <div className="top">
                      <div className="item-text">
                        <span className="line-8">{addr.name}</span>
                      </div>
                      {addr.phone && (
                        <div className="item-text">
                          <span className="line-8">{addr.phone}</span>
                        </div>
                      )}
                      {user?.email && (
                        <div className="item-text">
                          <span className="line-8">{user.email}</span>
                        </div>
                      )}
                      <div className="item-text">
                        <span className="line-8">{addr.street}</span>
                      </div>
                      <div className="item-text">
                        <span className="line-8">{addr.city}</span>
                        {addr.zip && <span className="line-8 ml-10">{addr.zip}</span>}
                      </div>
                      <div className="item-text">
                        <span className="line-8">{addr.country}</span>
                      </div>
                    </div>
                    <div className="bottom-btn">
                      <div onClick={() => openEdit(addr)} className="fec-btn t-primary-button-hover uppercase">edit</div>
                      <div onClick={() => deleteMutation.mutate(addr.id)} className="cancel-btn uppercase">delete</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}>
                <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold" style={{ fontSize: 18 }}>{editingId ? 'Edit Address' : 'New Address'}</span>
                    <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} className="text-body hover:text-foreground transition-colors">
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-body mb-1.5">Full Name</label>
                      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name" required className="w-full border border-border rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-body mb-1.5">Phone Number</label>
                      <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone Number" type="tel" required className="w-full border border-border rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-body mb-1.5">Full Address</label>
                      <input value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} placeholder="Street / Area / Village" required className="w-full border border-border rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-body mb-1.5">Division</label>
                        <div className="relative">
                          <select value={form.state} onChange={e => setForm({ ...form, state: e.target.value, city: '' })} className="w-full border border-border rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none bg-white">
                            <option value="">Select Division</option>
                            {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-body mb-1.5">District</label>
                        <div className="relative">
                          <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required className="w-full border border-border rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none bg-white" disabled={!form.state}>
                            <option value="">Select District</option>
                            {(DISTRICTS[form.state] || []).map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'start', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                      <label className="el-checkbox checkout-checkbox">
                        <span className="el-checkbox__input">
                          <span className={`el-checkbox__inner ${form.isDefault ? 'is-checked' : ''}`}></span>
                          <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} className="el-checkbox__original" />
                        </span>
                        <span className="el-checkbox__label">set as the default address</span>
                      </label>
                    </div>
                    <div className="add-bottom-btn">
                      <button type="submit" disabled={saveMutation.isPending} className="fec-btn t-primary-button-hover uppercase">
                        {saveMutation.isPending ? 'Saving...' : editingId ? 'save' : 'add new address'}
                      </button>
                      <div onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} className="cancel-btn uppercase">Cancel</div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
