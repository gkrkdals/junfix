import { NextResponse } from 'next/server';
import { getAdminId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const adminId = await getAdminId();

  if (adminId === null) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
