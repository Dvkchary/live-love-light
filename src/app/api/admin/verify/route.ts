import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (userId) {
      const user = await currentUser();
      const email = user?.primaryEmailAddress?.emailAddress;
      const role = (user?.publicMetadata as { role?: string })?.role;

      if (
        role === 'admin' ||
        email?.endsWith('@livelovelight.website') ||
        email?.endsWith('@livelovelight.in')
      ) {
        return NextResponse.json({ authorized: true, method: 'clerk' });
      }
    }

    return NextResponse.json({ authorized: false });
  } catch (error) {
    console.error('Error verifying admin authorization:', error);
    return NextResponse.json({ authorized: false }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Check if user is authenticated via Clerk as an administrator
    const { userId } = await auth();
    if (userId) {
      const user = await currentUser();
      const email = user?.primaryEmailAddress?.emailAddress;
      const role = (user?.publicMetadata as { role?: string })?.role;

      if (
        role === 'admin' ||
        email?.endsWith('@livelovelight.website') ||
        email?.endsWith('@livelovelight.in')
      ) {
        return NextResponse.json({
          success: true,
          authorized: true,
          method: 'clerk',
          role: 'admin',
        });
      }
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
        role: 'admin',
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
