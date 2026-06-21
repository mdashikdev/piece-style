import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/server/auth';
import { AppError, handleError } from '@/lib/server/errors';

export async function PUT(req: NextRequest) {
  try {
    const auth = authenticate(req);
    const { name, phone } = await req.json();
    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: { name, phone },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
    return NextResponse.json({ success: true, data: user });
  } catch (err) { return handleError(err); }
}
