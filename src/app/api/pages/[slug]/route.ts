import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { AppError, handleError } from '@/lib/server/errors';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page || !page.published) throw new AppError('Page not found', 404);
    return NextResponse.json({ success: true, data: page });
  } catch (err) { return handleError(err); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { slug } = await params;
    const { title, content, published } = await req.json();
    const data: any = {};
    if (title) data.title = title;
    if (content) data.content = content;
    if (published !== undefined) data.published = published;
    const page = await prisma.page.update({ where: { id: slug }, data });
    return NextResponse.json({ success: true, data: page });
  } catch (err) { return handleError(err); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { slug } = await params;
    await prisma.page.delete({ where: { id: slug } });
    return NextResponse.json({ success: true, message: 'Page deleted' });
  } catch (err) { return handleError(err); }
}
