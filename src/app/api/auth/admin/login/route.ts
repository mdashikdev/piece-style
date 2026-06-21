import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { AppError, handleError } from '@/lib/server/errors';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const accessToken = jwt.sign({ userId: admin.id, role: admin.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    const refreshToken = jwt.sign({ userId: admin.id, role: admin.role }, process.env.JWT_REFRESH_SECRET || 'refresh-secret', { expiresIn: '30d' });

    return NextResponse.json({
      success: true,
      data: { user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }, accessToken, refreshToken },
    });
  } catch (err) { return handleError(err); }
}
