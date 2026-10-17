import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { getPortalPath } from '@/lib/portal-routing';

export async function GET() {
  const session = await getAuthenticatedUser();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  return NextResponse.json({ role: session.role, redirectTo: getPortalPath(session.role) });
}