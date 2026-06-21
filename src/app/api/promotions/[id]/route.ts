import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { AppError, handleError } from '@/lib/server/errors';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { id } = await params;
    const { title, image, imageMobile, productSlug, section, sortOrder, active } = await req.json();
    const data: any = {};
    if (title !== undefined) data.title = title;
    if (image) data.image = image;
    if (imageMobile !== undefined) data.imageMobile = imageMobile;
    if (productSlug !== undefined) data.productSlug = productSlug;
    if (section !== undefined) data.section = section;
    if (sortOrder !== undefined) data.sortOrder = sortOrder;
    if (active !== undefined) data.active = active;
    const item = await prisma.promotion.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: item });
  } catch (err) { return handleError(err); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { id } = await params;
    await prisma.promotion.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (err) { return handleError(err); }
}
