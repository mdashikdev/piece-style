import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { AppError, handleError } from '@/lib/server/errors';
import { registerSchema } from '@/shared';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) throw new AppError(parsed.error.errors.map(e => e.message).join(', '), 400);

    const { name, phone, password } = parsed.data;
    const exists = await prisma.user.findUnique({ where: { phone } });
    if (exists) throw new AppError('Phone number already registered', 400);

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name, phone, password: hashedPassword } });

    const accessToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    const refreshToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_REFRESH_SECRET || 'refresh-secret', { expiresIn: '30d' });

    return NextResponse.json({
      success: true,
      data: { user: { id: user.id, name: user.name, phone: user.phone, role: user.role }, accessToken, refreshToken },
    }, { status: 201 });
  } catch (err) { return handleError(err); }
}
