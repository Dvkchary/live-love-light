import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';

export async function GET() {
  try {
    const auth = await getAuthenticatedUser();

    if (!auth.isAuthenticated || auth.role === 'customer') {
      return NextResponse.json(
        {
          authenticated: false,
          role: 'customer',
          permissions: auth.permissions,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      userId: auth.userId,
      email: auth.email,
      displayName: auth.displayName,
      role: auth.role,
      permissions: auth.permissions,
    });
  } catch (error: unknown) {
    const err = error as { digest?: string };
    if (err?.digest === 'HANGING_PROMISE_REJECTION' || err?.digest?.startsWith('NEXT_')) {
      throw error;
    }
    console.error('Failed to get admin session:', error);
    return NextResponse.json(
      { authenticated: false, role: 'customer' },
      { status: 500 }
    );
  }
}
