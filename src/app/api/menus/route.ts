import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: {
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: items });
  } catch (err) { return handleError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const body = await req.json();
    const { name, href, parentId } = body;
    const maxSort = await prisma.menuItem.aggregate({
      where: { parentId: parentId || null },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;
    const item = await prisma.menuItem.create({
      data: { name, href, parentId: parentId || null, sortOrder },
    });
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err) { return handleError(err); }
}
