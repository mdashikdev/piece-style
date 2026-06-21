import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);

    const [totalProducts, totalOrders, totalRevenue, pendingOrders, totalCustomers, lowStockProducts] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({ where: { paymentStatus: 'COMPLETED' }, _sum: { total: true } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.user.count(),
      prisma.product.count({ where: { stock: { lte: 5 }, status: 'ACTIVE' } }),
    ]);

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });

    const revenueByMonth = await prisma.order.groupBy({
      by: ['createdAt'],
      where: { paymentStatus: 'COMPLETED' },
      _sum: { total: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: { totalProducts, totalOrders, totalRevenue: totalRevenue._sum.total || 0, pendingOrders, totalCustomers, lowStockProducts },
        recentOrders,
        revenueByMonth,
      },
    });
  } catch (err) { return handleError(err); }
}
