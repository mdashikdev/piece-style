import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleError } from '@/lib/server/errors';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section');
    const where: any = { active: true };
    if (section) where.section = section;
    const items = await prisma.promotion.findMany({ where, orderBy: { sortOrder: 'asc' } });
    return NextResponse.json({ success: true, data: items });
  } catch (err) { return handleError(err); }
}
