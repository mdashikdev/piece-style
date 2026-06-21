import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { orders: true } },
          orders: { select: { total: true } },
        },
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: users.map(u => ({
        id: u.id,
        name: u.name,
        phone: u.phone,
        email: u.email,
        role: u.role,
        totalOrders: u._count.orders,
        totalSpent: u.orders.reduce((sum, o) => sum + o.total, 0),
        createdAt: u.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) { return handleError(err); }
}
