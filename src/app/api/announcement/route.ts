import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

export async function GET() {
  try {
    const item = await prisma.announcement.findFirst({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: item });
  } catch (err) { return handleError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { text, active } = await req.json();
    const existing = await prisma.announcement.findFirst();
    if (existing) {
      const item = await prisma.announcement.update({
        where: { id: existing.id },
        data: { text, active },
      });
      return NextResponse.json({ success: true, data: item });
    }
    const item = await prisma.announcement.create({
      data: { text, active: active ?? true },
    });
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err) { return handleError(err); }
}
