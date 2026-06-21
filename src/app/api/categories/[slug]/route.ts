import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { AppError, handleError } from '@/lib/server/errors';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: { children: true, products: { where: { status: 'ACTIVE' } } },
    });
    if (!category) throw new AppError('Category not found', 404);
    return NextResponse.json({ success: true, data: category });
  } catch (err) { return handleError(err); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { slug } = await params;
    const body = await req.json();
    const data: any = {};
    if (body.name) data.name = body.name;
    if (body.slug) data.slug = body.slug;
    if (body.parentId !== undefined) data.parentId = body.parentId;
    if (body.image !== undefined) data.image = body.image;
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
    const category = await prisma.category.update({ where: { id: slug }, data });
    return NextResponse.json({ success: true, data: category });
  } catch (err) { return handleError(err); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { slug } = await params;
    const productCount = await prisma.product.count({ where: { categoryId: slug } });
    if (productCount > 0) {
      throw new AppError(`Cannot delete: ${productCount} product(s) are linked to this category. Remove or reassign them first.`, 400);
    }
    await prisma.category.delete({ where: { id: slug } });
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (err) { return handleError(err); }
}
