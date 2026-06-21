import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AppError, handleError } from '@/lib/server/errors';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { paymentStatus: true, status: true } });
    if (!order) throw new AppError('Order not found', 404);
    return NextResponse.json({ success: true, data: order });
  } catch (err) { return handleError(err); }
}
