import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

export async function GET() {
  try {
    const popup = await prisma.popup.findFirst({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: popup });
  } catch (err) { return handleError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { image, imageMobile, productSlug } = await req.json();
    const existing = await prisma.popup.findFirst();
    if (existing) {
      const item = await prisma.popup.update({
        where: { id: existing.id },
        data: { image, imageMobile: imageMobile || null, productSlug },
      });
      return NextResponse.json({ success: true, data: item });
    }
    const item = await prisma.popup.create({
      data: { image, imageMobile: imageMobile || null, productSlug },
    });
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err) { return handleError(err); }
}
