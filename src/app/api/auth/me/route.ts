import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/server/auth';
import { AppError, handleError } from '@/lib/server/errors';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req);
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
    if (!user) throw new AppError('User not found', 404);
    return NextResponse.json({ success: true, data: user });
  } catch (err) { return handleError(err); }
}
