import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

export async function GET() {
  try {
    const items = await prisma.promotion.findMany({ orderBy: { sortOrder: 'asc' } });
    return NextResponse.json({ success: true, data: items });
  } catch (err) { return handleError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { title, image, imageMobile, productSlug, section, sortOrder, active } = await req.json();
    const item = await prisma.promotion.create({
      data: { title: title || null, image, imageMobile: imageMobile || null, productSlug, section, sortOrder: sortOrder || 0, active: active ?? true },
    });
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err) { return handleError(err); }
}
