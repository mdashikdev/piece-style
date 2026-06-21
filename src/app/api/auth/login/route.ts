import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { AppError, handleError } from '@/lib/server/errors';

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const accessToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    const refreshToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_REFRESH_SECRET || 'refresh-secret', { expiresIn: '30d' });

    return NextResponse.json({
      success: true,
      data: { user: { id: user.id, name: user.name, phone: user.phone, role: user.role }, accessToken, refreshToken },
    });
  } catch (err) { return handleError(err); }
}
