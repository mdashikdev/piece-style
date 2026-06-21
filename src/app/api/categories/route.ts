import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { children: true, _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (err) { return handleError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const body = await req.json();
    const { name, parentId, image, sortOrder } = body;
    const slug = body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = await prisma.category.create({ data: { name, slug, parentId, image, sortOrder: sortOrder || 0 } });
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (err) { return handleError(err); }
}
