import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const pages = await prisma.page.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: pages });
  } catch (err) { return handleError(err); }
}
