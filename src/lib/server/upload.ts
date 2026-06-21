import { put } from '@vercel/blob';
import crypto from 'crypto';

const ALLOWED_TYPES = /jpeg|jpg|png|gif|webp|svg/;

export async function saveFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_TYPES.test(ext)) {
    throw new Error('Only image files are allowed');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File too large (max 5MB)');
  }
  const filename = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const blob = await put(filename, buffer, {
    access: 'public',
    contentType: file.type || `image/${ext === 'svg' ? 'svg+xml' : ext}`,
    addRandomSuffix: false,
  });
  return blob.url;
}
