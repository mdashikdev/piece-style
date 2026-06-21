import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/server/auth';
import { AppError, handleError } from '@/lib/server/errors';

export async function POST(req: NextRequest) {
  try {
    const auth = authenticate(req);
    const { productId, rating, comment, images } = await req.json();
    const existing = await prisma.review.findUnique({ where: { productId_userId: { productId, userId: auth.userId } } });
    if (existing) throw new AppError('You already reviewed this product', 400);

    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId: auth.userId, status: 'DELIVERED' },
      },
      include: { variant: true },
    });

    const isVerifiedPurchase = !!orderItem;
    let variantInfo: { name: string; sku: string; price: number }[] = [];
    if (orderItem?.variant) {
      variantInfo = [{ name: orderItem.variant.name, sku: orderItem.variant.sku, price: orderItem.variant.price }];
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: auth.userId,
        rating,
        comment,
        images: JSON.stringify(images || []),
        isVerifiedPurchase,
        variantInfo: JSON.stringify(variantInfo),
      },
    });
    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (err) { return handleError(err); }
}
