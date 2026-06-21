import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

export async function PUT(req: NextRequest) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const body = await req.json();
    const { items } = body;
    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: 'items array required' }, { status: 400 });
    }
    await prisma.$transaction(
      items.map((item: { id: string; sortOrder: number; parentId?: string | null }) =>
        prisma.menuItem.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder, parentId: item.parentId || null },
        })
      )
    );
    return NextResponse.json({ success: true, message: 'Reordered' });
  } catch (err) { return handleError(err); }
}
