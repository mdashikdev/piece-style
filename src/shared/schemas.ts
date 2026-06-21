import { z } from 'zod';

export const loginSchema = z.object({
  phone: z.string().min(8, 'Phone must be at least 8 digits'),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  phone: z.string().min(8, 'Phone must be at least 8 digits'),
  password: z.string().min(6),
});

export const productSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().optional(),
  description: z.string().min(10),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  sku: z.string().min(1),
  stock: z.number().int().min(0),
  images: z.array(z.string()),
  featured: z.boolean().default(false),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  categoryId: z.string(),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().optional(),
  parentId: z.string().optional(),
  image: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    qty: z.number().int().positive(),
    price: z.number().positive(),
  })),
  shippingAddress: z.object({
    name: z.string().min(2),
    phone: z.string().min(8),
    street: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    zip: z.string().min(2),
    country: z.string().min(2),
  }),
  phone: z.string().min(8),
  note: z.string().optional(),
  paymentMethod: z.enum(['BKASH', 'NAGAD']),
  couponCode: z.string().optional(),
});

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
  images: z.array(z.string()).optional(),
});

export const couponSchema = z.object({
  code: z.string().min(3).max(20),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().positive(),
  minOrder: z.number().positive().default(0),
  maxUses: z.number().int().positive().default(100),
  expiresAt: z.string(),
  active: z.boolean().default(true),
});

export const bannerSchema = z.object({
  title: z.string().min(2).max(100),
  subtitle: z.string().optional(),
  image: z.string(),
  link: z.string().optional(),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

export const pageSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2).max(200),
  content: z.string().min(10),
  published: z.boolean().default(false),
});

export const settingSchema = z.object({
  key: z.string().min(2),
  value: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type BannerInput = z.infer<typeof bannerSchema>;
export type PageInput = z.infer<typeof pageSchema>;
export type SettingInput = z.infer<typeof settingSchema>;
