import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { AppError, handleError } from '@/lib/server/errors';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { id } = await params;
    const { message } = await req.json();
    if (!message?.trim()) throw new AppError('Message is required', 400);

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new AppError('Review not found', 404);

    const existing = (() => { try { return JSON.parse(review.sellerReply || '[]'); } catch { return []; } })();
    existing.push({ message: message.trim(), createdAt: new Date().toISOString() });

    await prisma.review.update({
      where: { id },
      data: { sellerReply: JSON.stringify(existing) },
    });

    return NextResponse.json({ success: true, data: { sellerReply: existing } });
  } catch (err) { return handleError(err); }
}
