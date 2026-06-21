import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { AppError, handleError } from '@/lib/server/errors';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { id } = await params;
    const body = await req.json();
    const data: any = {};
    if (body.name) data.name = body.name;
    if (body.href !== undefined) data.href = body.href;
    if (body.parentId !== undefined) data.parentId = body.parentId || null;
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
    if (body.active !== undefined) data.active = body.active;
    const item = await prisma.menuItem.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: item });
  } catch (err) { return handleError(err); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { id } = await params;
    await prisma.menuItem.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Menu item deleted' });
  } catch (err) { return handleError(err); }
}
