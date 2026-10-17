import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getAdminPermissions } from '@/lib/server-auth';

export async function GET() {
  try {
    const auth = await getAuthenticatedUser();

    if (auth.isAuthenticated && (auth.role === 'super_admin' || auth.role === 'product_manager')) {
      return NextResponse.json({
        authorized: true,
        role: auth.role,
        permissions: auth.permissions,
        method: 'clerk',
      });
    }

    return NextResponse.json({ authorized: false });
  } catch (error: unknown) {
    const err = error as { digest?: string };
    if (err?.digest === 'HANGING_PROMISE_REJECTION' || err?.digest?.startsWith('NEXT_')) {
      throw error;
    }
    console.error('Error verifying admin authorization:', error);
    return NextResponse.json({ authorized: false }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Check if user is authenticated via Clerk as an administrator
    const auth = await getAuthenticatedUser();
    if (auth.isAuthenticated && (auth.role === 'super_admin' || auth.role === 'product_manager')) {
      return NextResponse.json({
        success: true,
        authorized: true,
        role: auth.role,
        permissions: auth.permissions,
        method: 'clerk',
      });
    }

    // 2. Validate against server-only ADMIN_SECRET_KEY (never exposed to client bundles)
    const body = await req.json().catch(() => ({}));
    const passcode = typeof body.passcode === 'string' ? body.passcode.trim() : '';
    const serverSecretKey = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_KEY;

    if (!passcode) {
      return NextResponse.json(
        { success: false, error: 'Passcode is required.' },
        { status: 400 }
      );
    }

    if (serverSecretKey && passcode === serverSecretKey.trim()) {
      const response = NextResponse.json({
        success: true,
        authorized: true,
        method: 'passcode',
        role: 'super_admin',
        permissions: getAdminPermissions('super_admin'),
      });

      // Secure session cookie for the browser session
      response.cookies.set({
        name: 'lll_admin_session',
        value: 'authorized',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8, // 8 hours
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Invalid administrator credentials.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin verification server error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error verifying credentials.' },
      { status: 500 }
    );
  }
}
