import { NextResponse } from 'next/server';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function handleError(err: unknown) {
  if (err instanceof AppError) {
    return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
  }
  const message = err instanceof Error ? err.message : 'Internal server error';
  console.error(err);
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}
