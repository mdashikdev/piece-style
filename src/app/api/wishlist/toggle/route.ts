import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

export async function POST(req: NextRequest) {
  try {
    const auth = authenticate(req);
    const { productId } = await req.json();
    const existing = await prisma.wishlist.findUnique({ where: { userId_productId: { userId: auth.userId, productId } } });
    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, data: { wishlisted: false } });
    } else {
      await prisma.wishlist.create({ data: { userId: auth.userId, productId } });
      return NextResponse.json({ success: true, data: { wishlisted: true } });
    }
  } catch (err) { return handleError(err); }
}
