import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { id } = await params;
    const { status, trackingNumber } = await req.json();
    const data: any = {};
    if (status) data.status = status;
    if (trackingNumber) data.trackingNumber = trackingNumber;

    if (status === 'CANCELLED' || status === 'REFUNDED') {
      const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
      if (order) {
        for (const item of order.items) {
          await prisma.product.update({ where: { id: item.productId }, data: { stock: { increment: item.qty } } });
        }
      }
    }

    const order = await prisma.order.update({
      where: { id }, data,
      include: { items: { include: { product: true, variant: true } } },
    });
    return NextResponse.json({ success: true, data: order });
  } catch (err) { return handleError(err); }
}
