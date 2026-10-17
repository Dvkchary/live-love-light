import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server-auth';

async function verifyAdmin() {
  try {
    const admin = await requireAdmin();
    return NextResponse.json({
      success: true,
      authorized: true,
      role: admin.role,
      permissions: admin.permissions,
      method: 'clerk',
    });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message = error instanceof Error ? error.message : 'Administrator authentication required.';
    return NextResponse.json({ success: false, authorized: false, error: message }, { status });
  }
}

export async function GET() {
  return verifyAdmin();
}

export async function POST() {
  return verifyAdmin();
}
