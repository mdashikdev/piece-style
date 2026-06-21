import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth';
import { handleError } from '@/lib/server/errors';
import { saveFile } from '@/lib/server/upload';

export async function POST(req: NextRequest) {
  try {
    authenticate(req);

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const single = formData.get('file') as File | null;

    if (single) {
      const url = await saveFile(single);
      return NextResponse.json({ success: true, data: { url, filename: single.name } });
    }

    if (files.length > 0) {
      const urls = await Promise.all(files.map(async (f) => {
        const url = await saveFile(f);
        return { url, filename: f.name };
      }));
      return NextResponse.json({ success: true, data: urls });
    }

    return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
  } catch (err) { return handleError(err); }
}
