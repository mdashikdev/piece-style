'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { CheckCircle, Tag, X, MapPin, ChevronDown, ArrowLeft } from 'lucide-react';

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

const PAYMENT_METHODS = [
  { value: 'BKASH', label: 'bKash', desc: 'Send money via bKash', icon: '৳' },

  { value: 'CASH', label: 'Cash on Delivery', desc: 'Pay when you receive', icon: '' },
];

interface Address {
  id: string; label: string; name: string; phone: string;
  street: string; city: string; state: string; zip: string; country: string; isDefault: boolean;
}

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [cartHydrated, setCartHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', street: '', city: '', state: '', zip: '', country: 'Bangladesh',
    note: '', paymentMethod: 'CASH',
  });
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    useCartStore.persist.onFinishHydration(() => setCartHydrated(true));
    if (useCartStore.persist.hasHydrated()) setCartHydrated(true);
  }, []);

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get('/addresses').then(r => r.data.data),
    enabled: !!token,
  });

  const subtotal = getTotal();
  const discount = coupon?.discount || 0;
  const total = Math.max(0, subtotal - discount);

  const applyAddress = (addr: Address) => {
    setForm(prev => ({
      ...prev, name: addr.name, phone: addr.phone || '', street: addr.street,
      city: addr.city, state: addr.state || '', zip: addr.zip || '', country: addr.country || 'Bangladesh',
    }));
    setShowAddresses(false);
  };

  useEffect(() => {
    if (!cartHydrated) return;
    if (!token) router.push('/account');
    else if (items.length === 0) router.push('/cart');
  }, [cartHydrated, token, items.length, router]);

  useEffect(() => {
    if (addresses?.length > 0 && !form.name) {
      const defaultAddr = addresses.find((a: Address) => a.isDefault) || addresses[0];
      applyAddress(defaultAddr);
    }
  }, [addresses]);

  if (!cartHydrated) return null;
  if (!token) return null;

  if (items.length === 0) return null;

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await api.post('/coupons/validate', { code: couponCode.trim(), subtotal });
      setCoupon({ code: res.data.data.coupon.code, discount: res.data.data.discount });
      toast.success('Coupon applied!');
    } catch (err: any) {
      setCouponError(err.response?.data?.error || 'Invalid coupon');
      setCoupon(null);
    } finally { setApplyingCoupon(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/orders', {
        items: items.map(i => ({ productId: i.productId, variantId: i.variantId, qty: i.qty, price: i.price })),
        shippingAddress: {
          name: form.name, phone: form.phone, street: form.street,
          city: form.city, state: form.state, zip: form.zip, country: form.country,
        },
        phone: form.phone, note: form.note, paymentMethod: form.paymentMethod,
        couponCode: coupon?.code,
      });
      const order = res.data.data;

      if (form.paymentMethod === 'BKASH' || form.paymentMethod === 'NAGAD') {
        clearCart();
        const payRes = await api.post('/payment/initiate', { orderId: order.id, paymentMethod: form.paymentMethod });
        window.location.href = payRes.data.data.redirectURL;
      } else {
        router.push(`/thank-you?orderId=${order.id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally { setLoading(false); }
  };

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const selectedAddress = addresses?.find((a: Address) =>
    a.name === form.name && a.street === form.street && a.city === form.city
  );

  const steps = ['Cart', 'Checkout', 'Confirmation'];

  const inputCls = 'w-full border border-border rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white';
  const selectCls = 'w-full border border-border rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none bg-white';

  return (
    <section className="py-6 lg:py-10">
      <div className="container-main animate-fade-in">

        <div className="text-center mb-2">
          <h1 className="text-xl lg:text-2xl font-semibold">Confirm Your Order</h1>
          <Link href="/cart" className="inline-flex items-center gap-1 text-xs text-body hover:text-primary transition-colors mt-1">
            <ArrowLeft size={14} /> Return to Cart
          </Link>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-sm ${i <= 1 ? 'text-primary font-semibold' : 'text-body'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i <= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {i < 1 ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className="hidden sm:inline">{step}</span>
              </div>
              {i < steps.length - 1 && <div className={`w-8 h-px ${i < 1 ? 'bg-primary' : 'bg-gray-300'}`} />}
            </div>
          ))}
        </div>

        <form id="checkout-form" onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6 lg:gap-10">

          {/* ── LEFT: Forms ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Saved Addresses */}
            {addresses?.length > 0 && (
              <div className="relative">
                <p className="text-xs text-body mb-2">Select an address from your address book</p>
                <button
                  type="button"
                  onClick={() => setShowAddresses(!showAddresses)}
                  className="w-full flex items-center justify-between border border-border rounded-lg px-4 py-3 text-sm text-body hover:border-gray-300 transition-all bg-white"
                >
                  <span className="truncate flex items-center gap-2">
                    <MapPin size={15} className="text-primary flex-shrink-0" />
                    {selectedAddress
                      ? `${selectedAddress.name} — ${selectedAddress.street}, ${selectedAddress.city}`
                      : 'Select a saved address'}
                  </span>
                  <ChevronDown size={15} className={`text-body flex-shrink-0 transition-transform ${showAddresses ? 'rotate-180' : ''}`} />
                </button>
                {showAddresses && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                    {addresses.map((addr: Address) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => applyAddress(addr)}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-border last:border-0"
                      >
                        <div className="font-medium text-gray-800 flex items-center gap-2">
                          {addr.name}
                          {addr.isDefault && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Default</span>}
                        </div>
                        <div className="text-body text-xs mt-0.5">{addr.street}, {addr.city}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-sm font-medium">Complete your details to proceed.</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-body mb-1.5">Full Name</label>
                  <input required placeholder="Full Name" value={form.name} onChange={e => updateField('name', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-body mb-1.5">Phone Number</label>
                  <input required placeholder="Phone Number" type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-body mb-1.5">Full Address</label>
                <input required placeholder="Street / Area / Village" value={form.street} onChange={e => updateField('street', e.target.value)} className={inputCls} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-body mb-1.5">Division</label>
                  <div className="relative">
                    <select required value={form.state} onChange={e => { updateField('state', e.target.value); updateField('city', ''); }} className={selectCls}>
                      <option value="">Select Division</option>
                      {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-body pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-body mb-1.5">District</label>
                  <div className="relative">
                    <select required value={form.city} onChange={e => updateField('city', e.target.value)} className={selectCls} disabled={!form.state}>
                      <option value="">Select District</option>
                      {(DISTRICTS[form.state] || []).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-body pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-body mb-1.5">Order Notes</label>
                <textarea
                  placeholder="Special instructions, delivery preferences..."
                  value={form.note}
                  onChange={e => updateField('note', e.target.value)}
                  rows={3}
                  className={inputCls.replace('rounded-lg', 'rounded-lg') + ' resize-none'}
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-2xl p-5 lg:p-6 lg:sticky lg:top-28">

              {/* Items */}
              <div className="space-y-3 max-h-[320px] overflow-y-auto mb-4">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-border">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-body text-xs">No Image</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate leading-tight">{item.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-body">Qty: {item.qty}</span>
                        <span className="text-sm font-semibold">{formatPrice(item.price * item.qty)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-4">
                {coupon ? (
                  <div className="flex items-center justify-between bg-success/10 border border-success/30 rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-success" />
                      <span className="text-sm font-medium text-success">{coupon.code}</span>
                      <span className="text-xs text-success">(-{formatPrice(coupon.discount)})</span>
                    </div>
                    <button type="button" onClick={() => { setCoupon(null); setCouponCode(''); }} className="text-success hover:text-success/70"><X size={15} /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={e => { setCouponCode(e.target.value); setCouponError(''); }}
                      className="flex-1 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-gray-100 text-body rounded-lg text-xs font-medium hover:bg-gray-200 disabled:opacity-50 transition-all whitespace-nowrap"
                    >
                      {applyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-xs text-error mt-1.5">{couponError}</p>}
              </div>

              {/* Totals */}
              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-body">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span className="font-medium">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-body">Shipping</span>
                  <span className="text-success font-medium">Free</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="border-t border-border pt-4 mb-4">
                <h3 className="text-xs font-semibold text-body uppercase tracking-wide mb-3">Payment Method</h3>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map(method => {
                    const sel = form.paymentMethod === method.value;
                    return (
                      <label
                        key={method.value}
                        className={`flex items-center gap-3 border rounded-lg px-3 py-2.5 cursor-pointer transition-all ${
                          sel ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border bg-white hover:border-gray-300'
                        }`}
                      >
                        <input type="radio" name="payment" value={method.value} checked={sel} onChange={e => updateField('paymentMethod', e.target.value)} className="sr-only" />
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${sel ? 'border-primary' : 'border-gray-300'}`}>
                          {sel && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0">
                          {method.icon && <span className="text-xs">{method.icon}</span>}
                          <span className={`text-xs font-medium ${sel ? 'text-primary' : 'text-gray-700'}`}>{method.label}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-5">
                <div className="flex justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white text-center py-3 rounded-lg text-sm font-medium hover:bg-primary-hover transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Processing...
                  </span>
                ) : (
                  form.paymentMethod === 'CASH' ? 'Place Order' : `Pay ${formatPrice(total)}`
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </section>
  );
}
