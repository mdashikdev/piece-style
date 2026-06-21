import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/server/auth';
import { AppError, handleError } from '@/lib/server/errors';
import { createBkashPayment } from '@/lib/server/bkash';
import { createNagadPayment } from '@/lib/server/nagad';

export async function POST(req: NextRequest) {
  try {
    const auth = authenticate(req);
    const { orderId, paymentMethod } = await req.json();
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found', 404);

    if (paymentMethod === 'BKASH') {
      const result = await createBkashPayment(order.total, order.id, order.phone);
      await prisma.order.update({ where: { id: order.id }, data: { paymentId: result.paymentID } });
      return NextResponse.json({ success: true, data: { redirectURL: result.bkashURL, paymentID: result.paymentID } });
    } else if (paymentMethod === 'NAGAD') {
      const result = await createNagadPayment(order.total, order.id, order.phone);
      return NextResponse.json({ success: true, data: { redirectURL: result.callBackUrl, paymentRefId: result.paymentRefId } });
    } else {
      throw new AppError('Invalid payment method', 400);
    }
  } catch (err) { return handleError(err); }
}
