import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, requireAdmin } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    settings.forEach(s => { map[s.key] = s.value; });
    return NextResponse.json({ success: true, data: map });
  } catch (err) { return handleError(err); }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = authenticate(req);
    requireAdmin(auth);
    const settings = await req.json();
    for (const [key, value] of Object.entries(settings)) {
      await prisma.setting.upsert({ where: { key }, update: { value: value as string }, create: { key, value: value as string } });
    }
    return NextResponse.json({ success: true, message: 'Settings updated' });
  } catch (err) { return handleError(err); }
}
