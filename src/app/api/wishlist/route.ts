import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req);
    const items = await prisma.wishlist.findMany({
      where: { userId: auth.userId },
      include: { product: { include: { category: true, reviews: { where: { status: 'APPROVED' }, select: { rating: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    const data = items.map(w => {
      const avgRating = w.product.reviews.length ? w.product.reviews.reduce((a, r) => a + r.rating, 0) / w.product.reviews.length : 0;
      const { reviews, ...product } = w.product;
      return { ...w, product: { ...product, avgRating, reviewCount: w.product.reviews.length } };
    });
    return NextResponse.json({ success: true, data });
  } catch (err) { return handleError(err); }
}
