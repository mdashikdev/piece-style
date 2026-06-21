import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { id } = await params;
    const { status } = await req.json();
    const review = await prisma.review.update({ where: { id }, data: { status } });
    return NextResponse.json({ success: true, data: review });
  } catch (err) { return handleError(err); }
}


