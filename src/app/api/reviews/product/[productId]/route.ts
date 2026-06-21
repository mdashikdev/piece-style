import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { optionalAuth } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

export async function GET(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params;
    const auth = optionalAuth(req);
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '10')));
    const sort = url.searchParams.get('sort') || 'recent';
    const rating = parseInt(url.searchParams.get('rating') || '0');

    const where: any = { productId };
    if (rating >= 1 && rating <= 5) where.rating = rating;
    if (auth) {
      where.OR = [
        { status: 'APPROVED' },
        { userId: auth.userId, status: 'PENDING' },
      ];
    } else {
      where.status = 'APPROVED';
    }

    let orderBy: any;
    switch (sort) {
      case 'oldest': orderBy = { createdAt: 'asc' }; break;
      case 'highest': orderBy = { rating: 'desc' }; break;
      case 'lowest': orderBy = { rating: 'asc' }; break;
      default: orderBy = { createdAt: 'desc' };
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: { user: { select: { id: true, name: true } } },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    let likedReviewIds: string[] = [];
    if (auth) {
      const likes = await prisma.reviewLike.findMany({
        where: { reviewId: { in: reviews.map(r => r.id) }, userId: auth.userId },
        select: { reviewId: true },
      });
      likedReviewIds = likes.map(l => l.reviewId);
    }

    const data = reviews.map(r => ({
      ...r,
      likedByUser: likedReviewIds.includes(r.id),
    }));

    return NextResponse.json({
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) { return handleError(err); }
}
