import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { AppError, handleError } from '@/lib/server/errors';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const admins = await prisma.adminUser.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
    return NextResponse.json({ success: true, data: admins });
  } catch (err) { return handleError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const { name, email, password } = await req.json();
    const exists = await prisma.adminUser.findUnique({ where: { email } });
    if (exists) throw new AppError('Email already exists', 400);
    const hashed = await bcrypt.hash(password, 12);
    const admin = await prisma.adminUser.create({ data: { name, email, password: hashed }, select: { id: true, name: true, email: true, role: true } });
    return NextResponse.json({ success: true, data: admin }, { status: 201 });
  } catch (err) { return handleError(err); }
}
