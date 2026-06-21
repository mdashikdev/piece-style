import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { id } = await params;
    await prisma.adminUser.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Admin deleted' });
  } catch (err) { return handleError(err); }
}
