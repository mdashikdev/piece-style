'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { Trash2, Minus, Plus, CheckCircle, Tag } from 'lucide-react';

const steps = ['Cart', 'Checkout', 'Confirmation'];

export default function CartPage() {
  const { items, removeItem, updateQty, getTotal } = useCartStore();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  if (items.length === 0) {
    return (
      <section className="flex items-center justify-center py-24">
        <div className="container-main text-center animate-fade-in">
          <div className="empty text-lg lg:text-xl text-body mb-6">Your shopping cart is still empty</div>
          <Link href="/products" className="inline-flex items-center gap-2 fec-btn t-primary-button px-6 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all normal-case">
            continue shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 lg:py-10">
      <div className="container-main animate-fade-in">

        <div className="text-center mb-2">
          <h1 className="text-xl lg:text-2xl font-bold">Shopping Cart</h1>
          <p className="text-xs text-body mt-1">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-sm ${i <= 0 ? 'text-primary font-semibold' : 'text-body'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i <= 0 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {i < 1 ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className="hidden sm:inline">{step}</span>
              </div>
              {i < steps.length - 1 && <div className={`w-8 h-px ${i < 0 ? 'bg-primary' : 'bg-gray-300'}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2">
            <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-xl text-xs font-semibold text-body uppercase tracking-wider mb-4">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="grid sm:grid-cols-12 gap-4 items-center border border-border rounded-2xl p-4 hover:border-gray-300 hover:shadow-sm transition-all">
                  <div className="sm:col-span-6 flex items-center gap-4">
                    <Link href={`/products/${item.slug}`} className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/products/${item.slug}`} className="text-sm font-medium hover:text-primary transition-colors line-clamp-2 block leading-snug">
                        {item.title}
                      </Link>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-xs text-body hover:text-error transition-colors mt-2 flex items-center gap-1 group"
                      >
                        <Trash2 size={13} className="group-hover:scale-110 transition-transform" /> Remove
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2 text-center">
                    <span className="sm:hidden text-xs text-body mr-2">Price:</span>
                    <span className="text-sm font-semibold">{formatPrice(item.price)}</span>
                  </div>

                  <div className="sm:col-span-2 flex sm:justify-center items-center gap-2">
                    <span className="sm:hidden text-xs text-body mr-1">Qty:</span>
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQty(item.productId, Math.max(1, item.qty - 1), item.variantId)}
                        className="px-2 py-1 text-xs hover:bg-gray-50 transition-colors active:bg-gray-100"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2.5 py-1 text-xs font-medium border-x border-border min-w-[32px] text-center tabular-nums">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.productId, Math.min(item.stock, item.qty + 1), item.variantId)}
                        className="px-2 py-1 text-xs hover:bg-gray-50 transition-colors active:bg-gray-100"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2 text-right">
                    <span className="sm:hidden text-xs text-body mr-2">Subtotal:</span>
                    <span className="text-sm font-bold">{formatPrice(item.price * item.qty)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-body" />
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="border border-border rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-full sm:w-40"
                  />
                </div>
                <button
                  onClick={() => setCouponApplied(!couponApplied)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${couponApplied ? 'bg-success/10 text-success border border-success/30' : 'bg-gray-100 text-body hover:bg-gray-200 border border-transparent'}`}
                >
                  {couponApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
              <Link href="/products" className="text-xs text-body hover:text-primary transition-colors font-medium">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="border border-border rounded-2xl p-5 lg:p-6 sticky top-28">
              <h2 className="font-semibold text-base mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-body">Subtotal</span>
                  <span className="font-medium">{formatPrice(getTotal())}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-success">
                    <span>Discount (WELCOME10)</span>
                    <span className="font-medium">-{formatPrice(getTotal() * 0.1)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-body">Shipping</span>
                  <span className="text-success font-medium flex items-center gap-1">
                    Free
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">Tax</span>
                  <span className="font-medium text-xs text-body">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-5 space-y-1">
                <div className="flex justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">{formatPrice(couponApplied ? getTotal() * 0.9 : getTotal())}</span>
                </div>
                <p className="text-[11px] text-body text-right">Inclusive of all taxes</p>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-primary text-white text-center py-3 rounded-lg text-sm font-medium hover:bg-primary-hover transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
              >
                Proceed to Checkout
              </Link>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-body text-center mb-2.5">We accept</p>
                <div className="flex justify-center gap-2">
                  <span className="text-[11px] bg-gray-100 px-2.5 py-1.5 rounded-lg font-semibold text-gray-700">bKash</span>
                  <span className="text-[11px] bg-gray-100 px-2.5 py-1.5 rounded-lg font-semibold text-gray-700">Nagad</span>
                  <span className="text-[11px] bg-gray-100 px-2.5 py-1.5 rounded-lg font-semibold text-gray-700">Cash on Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
