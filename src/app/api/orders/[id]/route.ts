import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

// Redirect-less route via the [id] segment - handled in status route for PUT
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authenticate(req);
    const { id } = await params;
    const { default: prisma } = await import('@/lib/prisma');
    const { AppError } = await import('@/lib/server/errors');

    const order = await prisma.order.findFirst({
      where: { id, userId: auth.userId },
      include: { items: { include: { product: true, variant: true } } },
    });
    if (!order) throw new AppError('Order not found', 404);
    return NextResponse.json({ success: true, data: order });
  } catch (err) { return handleError(err); }
}
