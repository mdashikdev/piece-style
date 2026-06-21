export type Role = 'USER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentMethod = 'BKASH' | 'NAGAD';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type CouponType = 'PERCENTAGE' | 'FIXED';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type InventoryChangeType = 'SALE' | 'RESTOCK' | 'ADJUSTMENT';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku: string;
  stock: number;
  images: string[];
  featured: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  categoryId: string;
  category?: Category;
  variants?: ProductVariant[];
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  image?: string;
  sortOrder: number;
  children?: Category[];
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  items: OrderItem[];
  total: number;
  subtotal: number;
  discount: number;
  couponCode?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  shippingAddress: Address;
  phone: string;
  note?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  qty: number;
  price: number;
}

export interface Address {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  user?: User;
  rating: number;
  comment: string;
  images: string[];
  status: ReviewStatus;
  isVerifiedPurchase: boolean;
  variantInfo: string[];
  sellerReply?: { message: string; createdAt: string }[];
  likeCount: number;
  likedByUser?: boolean;
  createdAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  variantId?: string;
  change: number;
  type: InventoryChangeType;
  note?: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  qty: number;
  product?: Product;
  variant?: ProductVariant;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
