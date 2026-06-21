import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, optionalAuth, requireAdmin } from '@/lib/server/auth';
import { AppError, handleError } from '@/lib/server/errors';

export async function GET(req: NextRequest, { params }: { params: Promise<{ param: string }> }) {
  try {
    const { param } = await params;
    const auth = optionalAuth(req);

    const product = await prisma.product.findFirst({
      where: { OR: [{ slug: param }, { id: param }] },
      include: {
        category: true, variants: true,
        reviews: {
          where: auth ? { OR: [{ status: 'APPROVED' }, { userId: auth.userId }] } : { status: 'APPROVED' },
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!product) throw new AppError('Product not found', 404);
    const approved = product.reviews.filter(r => r.status === 'APPROVED');
    const avgRating = approved.length ? approved.reduce((a, r) => a + r.rating, 0) / approved.length : 0;
    return NextResponse.json({ success: true, data: { ...product, avgRating, reviewCount: approved.length } });
  } catch (err) { return handleError(err); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ param: string }> }) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { param } = await params;
    const body = await req.json();
    const data: any = {};
    if (body.title) data.title = body.title;
    if (body.slug) data.slug = body.slug;
    if (body.description) data.description = body.description;
    if (body.price !== undefined) data.price = body.price;
    if (body.comparePrice !== undefined) data.comparePrice = body.comparePrice;
    if (body.sku) data.sku = body.sku;
    if (body.stock !== undefined) data.stock = body.stock;
    if (body.images) data.images = JSON.stringify(body.images);
    if (body.featured !== undefined) data.featured = body.featured;
    if (body.status) data.status = body.status;
    if (body.categoryId) data.categoryId = body.categoryId;
    const product = await prisma.product.update({ where: { id: param }, data, include: { category: true, variants: true } });
    return NextResponse.json({ success: true, data: product });
  } catch (err) { return handleError(err); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ param: string }> }) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { param } = await params;
    await prisma.product.delete({ where: { id: param } });
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (err) { return handleError(err); }
}
