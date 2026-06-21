import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleError } from '@/lib/server/errors';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true, status: 'ACTIVE' },
      take: 8,
      include: { category: true, reviews: { where: { status: 'APPROVED' }, select: { rating: true } } },
    });
    const productsWithRating = products.map(p => {
      const avgRating = p.reviews.length ? p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length : 0;
      const { reviews, ...rest } = p;
      return { ...rest, avgRating, reviewCount: p.reviews.length };
    });
    return NextResponse.json({ success: true, data: productsWithRating });
  } catch (err) { return handleError(err); }
}
