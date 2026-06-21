import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
    return NextResponse.json({ success: true, data: banners });
  } catch (err) { return handleError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { image, imageMobile, link, sortOrder, active } = await req.json();
    const banner = await prisma.banner.create({ data: { image, imageMobile: imageMobile || null, link: link || null, sortOrder: sortOrder || 0, active: active ?? true } });
    return NextResponse.json({ success: true, data: banner }, { status: 201 });
  } catch (err) { return handleError(err); }
}
