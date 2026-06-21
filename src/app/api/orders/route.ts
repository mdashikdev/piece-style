import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/server/auth';
import { AppError, handleError } from '@/lib/server/errors';

export async function POST(req: NextRequest) {
  try {
    const auth = authenticate(req);
    const { items, shippingAddress, phone, note, paymentMethod, couponCode } = await req.json();

    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (!coupon || !coupon.active || new Date() > coupon.expiresAt) throw new AppError('Invalid or expired coupon', 400);
      if (coupon.usedCount >= coupon.maxUses) throw new AppError('Coupon usage limit reached', 400);
      const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.qty, 0);
      if (subtotal < coupon.minOrder) throw new AppError(`Minimum order amount ${coupon.minOrder} required`, 400);
      discount = coupon.type === 'PERCENTAGE' ? (subtotal * coupon.value) / 100 : coupon.value;
      await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: coupon.usedCount + 1 } });
    }

    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.qty, 0);
    const total = Math.max(0, subtotal - discount);

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stock < item.qty) throw new AppError(`Insufficient stock for ${product?.title || 'product'}`, 400);
    }

    const order = await prisma.order.create({
      data: {
        userId: auth.userId, subtotal, discount, total, couponCode, paymentMethod,
        status: 'PENDING', paymentStatus: 'PENDING',
        shippingName: shippingAddress.name, shippingPhone: shippingAddress.phone,
        shippingStreet: shippingAddress.street, shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state, shippingZip: shippingAddress.zip,
        shippingCountry: shippingAddress.country, phone, note,
        items: { createMany: { data: items.map((item: any) => ({ productId: item.productId, variantId: item.variantId, qty: item.qty, price: item.price })) } },
      },
      include: { items: { include: { product: true, variant: true } } },
    });

    for (const item of items) {
      await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.qty } } });
      await prisma.inventoryLog.create({ data: { productId: item.productId, variantId: item.variantId, change: -item.qty, type: 'SALE', note: `Order ${order.id}` } });
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (err) { return handleError(err); }
}

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req);
    const orders = await prisma.order.findMany({
      where: { userId: auth.userId },
      include: { items: { include: { product: { select: { id: true, title: true, images: true } }, variant: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: orders });
  } catch (err) { return handleError(err); }
}
