import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { AppError, handleError } from '@/lib/server/errors';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: coupons });
  } catch (err) { return handleError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { code, type, value, minOrder, maxUses, expiresAt, active } = await req.json();
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) throw new AppError('Coupon code already exists', 400);
    const coupon = await prisma.coupon.create({ data: { code: code.toUpperCase(), type, value, minOrder, maxUses, expiresAt: new Date(expiresAt), active } });
    return NextResponse.json({ success: true, data: coupon }, { status: 201 });
  } catch (err) { return handleError(err); }
}
