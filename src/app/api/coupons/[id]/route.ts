import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { id } = await params;
    const { code, type, value, minOrder, maxUses, expiresAt, active } = await req.json();
    const data: any = {};
    if (code) data.code = code.toUpperCase();
    if (type) data.type = type;
    if (value) data.value = value;
    if (minOrder !== undefined) data.minOrder = minOrder;
    if (maxUses) data.maxUses = maxUses;
    if (expiresAt) data.expiresAt = new Date(expiresAt);
    if (active !== undefined) data.active = active;
    const coupon = await prisma.coupon.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: coupon });
  } catch (err) { return handleError(err); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { id } = await params;
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Coupon deleted' });
  } catch (err) { return handleError(err); }
}
