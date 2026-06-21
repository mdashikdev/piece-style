import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleError } from '@/lib/server/errors';

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } });
    return NextResponse.json({ success: true, data: banners });
  } catch (err) { return handleError(err); }
}
