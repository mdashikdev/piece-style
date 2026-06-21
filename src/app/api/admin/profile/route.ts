import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { AppError, handleError } from '@/lib/server/errors';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const admin = await prisma.adminUser.findUnique({ where: { id: auth.userId }, select: { id: true, name: true, email: true, role: true } });
    if (!admin) throw new AppError('Admin not found', 404);
    return NextResponse.json({ success: true, data: admin });
  } catch (err) { return handleError(err); }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { name, email, currentPassword, newPassword } = await req.json();

    const admin = await prisma.adminUser.findUnique({ where: { id: auth.userId } });
    if (!admin) throw new AppError('Admin not found', 404);

    const data: any = {};
    if (name) data.name = name;
    if (email && email !== admin.email) {
      const existing = await prisma.adminUser.findUnique({ where: { email } });
      if (existing) throw new AppError('Email already in use', 400);
      data.email = email;
    }
    if (newPassword) {
      if (!currentPassword) throw new AppError('Current password is required', 400);
      const valid = await bcrypt.compare(currentPassword, admin.password);
      if (!valid) throw new AppError('Current password is incorrect', 400);
      data.password = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.adminUser.update({
      where: { id: auth.userId },
      data,
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) { return handleError(err); }
}
