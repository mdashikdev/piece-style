import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { executeBkashPayment } from '@/lib/server/bkash';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentID = searchParams.get('paymentID');
    const status = searchParams.get('status');

    let orderId = '';

    if (status === 'success' && paymentID) {
      const result = await executeBkashPayment(paymentID);
      if (result.transactionStatus === 'Completed') {
        const order = await prisma.order.findFirst({ where: { paymentId: paymentID } });
        if (order) { orderId = order.id; }
        await prisma.order.updateMany({ where: { paymentId: paymentID }, data: { paymentStatus: 'COMPLETED', status: 'CONFIRMED' } });
      }
    }

    const base = process.env.FRONTEND_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${base}/thank-you${orderId ? `?orderId=${orderId}` : ''}`);
  } catch {
    const base = process.env.FRONTEND_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${base}/thank-you`);
  }
}
