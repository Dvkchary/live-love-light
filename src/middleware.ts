import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/api/admin/verify(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const pathname = req.nextUrl.pathname;

  // 1. Unauthenticated visitors: strictly restricted to /login
  if (!userId) {
    if (isPublicRoute(req)) {
      return NextResponse.next();
    }

    // Direct API requests without authentication receive 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }

    // Redirect all page requests to the authentication page
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users: Check role for admin routes
  if (pathname.startsWith('/admin')) {
    const rawRole =
      (sessionClaims?.metadata as { role?: string })?.role ||
      (sessionClaims?.publicMetadata as { role?: string })?.role;

    const superAdminId = process.env.SUPER_ADMIN_CLERK_ID?.trim();
    const productManagerId = process.env.PRODUCT_MANAGER_CLERK_ID?.trim();

    const isDesignatedSuper = superAdminId && userId === superAdminId;
    const isDesignatedPm = productManagerId && userId === productManagerId;
    const hasAdminRole = rawRole === 'super_admin' || rawRole === 'admin' || rawRole === 'product_manager';

    // If an ordinary customer attempts to navigate to /admin, block & redirect to customer portal
    if (!isDesignatedSuper && !isDesignatedPm && !hasAdminRole) {
      // Return 403 if it's an API request
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Administrative privileges required.' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/customer?error=access_denied', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals, static images, fonts and favicon
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
