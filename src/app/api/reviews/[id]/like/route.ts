import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/server/auth';
import { AppError, handleError } from '@/lib/server/errors';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authenticate(req);
    const { id } = await params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new AppError('Review not found', 404);

    const existing = await prisma.reviewLike.findUnique({
      where: { reviewId_userId: { reviewId: id, userId: auth.userId } },
    });

    if (existing) {
      await prisma.reviewLike.delete({ where: { id: existing.id } });
      await prisma.review.update({ where: { id }, data: { likeCount: { decrement: 1 } } });
      return NextResponse.json({ success: true, data: { liked: false } });
    } else {
      await prisma.reviewLike.create({ data: { reviewId: id, userId: auth.userId } });
      await prisma.review.update({ where: { id }, data: { likeCount: { increment: 1 } } });
      return NextResponse.json({ success: true, data: { liked: true } });
    }
  } catch (err) { return handleError(err); }
}
