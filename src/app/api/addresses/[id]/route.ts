import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getUserFromToken(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: string; role: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await req.json();

    const address = await prisma.address.findFirst({ where: { id, userId: user.userId } });
    if (!address) return NextResponse.json({ error: 'Address not found' }, { status: 404 });

    if (body.isDefault) {
      await prisma.address.updateMany({ where: { userId: user.userId }, data: { isDefault: false } });
    }

    const updated = await prisma.address.update({ where: { id }, data: body });
    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error('Address PUT error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const address = await prisma.address.findFirst({ where: { id, userId: user.userId } });
  if (!address) return NextResponse.json({ error: 'Address not found' }, { status: 404 });

  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
