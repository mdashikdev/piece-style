import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AppError, handleError } from '@/lib/server/errors';

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.active) throw new AppError('Invalid coupon code', 400);
    if (new Date() > coupon.expiresAt) throw new AppError('Coupon has expired', 400);
    if (coupon.usedCount >= coupon.maxUses) throw new AppError('Coupon usage limit reached', 400);
    if (subtotal < coupon.minOrder) throw new AppError(`Minimum order amount ${coupon.minOrder} required`, 400);
    const discount = coupon.type === 'PERCENTAGE' ? (subtotal * coupon.value) / 100 : coupon.value;
    return NextResponse.json({ success: true, data: { coupon, discount } });
  } catch (err) { return handleError(err); }
}
