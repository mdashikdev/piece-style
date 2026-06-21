import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { id } = await params;
    const { image, imageMobile, link, sortOrder, active } = await req.json();
    const data: any = {};
    if (image) data.image = image;
    if (imageMobile !== undefined) data.imageMobile = imageMobile;
    if (link !== undefined) data.link = link;
    if (sortOrder !== undefined) data.sortOrder = sortOrder;
    if (active !== undefined) data.active = active;
    const banner = await prisma.banner.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: banner });
  } catch (err) { return handleError(err); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { id } = await params;
    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Banner deleted' });
  } catch (err) { return handleError(err); }
}
