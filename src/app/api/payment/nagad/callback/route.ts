import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyNagadPayment } from '@/lib/server/nagad';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentRefId = searchParams.get('paymentRefId');
    const status = searchParams.get('status');

    let orderId = '';

    if (status === 'Success' && paymentRefId) {
      const result = await verifyNagadPayment(paymentRefId);
      if (result.status === 'Completed') {
        const additionalInfo = JSON.parse(result.additionalInfo || '{}');
        orderId = additionalInfo.orderId || '';
        await prisma.order.updateMany({ where: { id: additionalInfo.orderId }, data: { paymentStatus: 'COMPLETED', status: 'CONFIRMED', paymentId: paymentRefId } });
      }
    }

    const base = process.env.FRONTEND_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${base}/thank-you${orderId ? `?orderId=${orderId}` : ''}`);
  } catch {
    const base = process.env.FRONTEND_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${base}/thank-you`);
  }
}
