import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CartItem {
  productId: string;
  variantId?: string;
  title: string;
  image: string;
  price: number;
  qty: number;
  stock: number;
  slug: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQty: (productId: string, qty: number, variantId?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === item.productId && i.variantId === item.variantId);
        if (existing) {
          set({ items: items.map((i) => (i.productId === item.productId && i.variantId === item.variantId ? { ...i, qty: i.qty + item.qty } : i)) });
        } else {
          set({ items: [...items, item] });
        }
      },
      removeItem: (productId, variantId) => {
        set({ items: get().items.filter((i) => !(i.productId === productId && i.variantId === variantId)) });
      },
      updateQty: (productId, qty, variantId) => {
        set({ items: get().items.map((i) => (i.productId === productId && i.variantId === variantId ? { ...i, qty } : i)) });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: 'cart-storage', storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined }
  )
);
