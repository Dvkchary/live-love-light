import { clerkClient, clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { canAccessPortalRoute } from '@/lib/portal-routing';

const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/',
  '/customer(.*)',
  '/product(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/robots.txt',
  '/sitemap.xml',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const pathname = req.nextUrl.pathname;

  // Keep the storefront public; other routes require a Clerk session.
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
    loginUrl.searchParams.set('redirect_url', `${pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const isAdminRoute = pathname.startsWith('/admin');
  const isSuperAdminRoute = pathname.startsWith('/super-admin');
  if (isAdminRoute || isSuperAdminRoute) {
    let rawRole =
      (sessionClaims?.metadata as { role?: string })?.role ||
      (sessionClaims?.publicMetadata as { role?: string })?.role;

    const superAdminId = process.env.SUPER_ADMIN_CLERK_ID?.trim();
    const adminId = process.env.ADMIN_CLERK_ID?.trim() || process.env.PRODUCT_MANAGER_CLERK_ID?.trim();

    const isDesignatedSuper = Boolean(superAdminId && userId === superAdminId);
    const isDesignatedAdmin = Boolean(adminId && userId === adminId);

    if (!isDesignatedSuper && !isDesignatedAdmin && rawRole !== 'super_admin' && rawRole !== 'admin' && rawRole !== 'product_manager') {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        rawRole = (user.publicMetadata as { role?: string })?.role;
      } catch {
        rawRole = undefined;
      }
    }

    const isSuperAdmin = isDesignatedSuper || rawRole === 'super_admin';
    const isAdmin = isDesignatedAdmin || rawRole === 'admin' || rawRole === 'product_manager';

    const resolvedRole = isSuperAdmin ? 'super_admin' : isAdmin ? 'admin' : 'user';
    if (!canAccessPortalRoute(resolvedRole, pathname)) {
      if (pathname.startsWith('/api/')) {
        const required = isSuperAdminRoute ? 'Super Admin' : 'Admin';
        return NextResponse.json({ error: `${required} access required.` }, { status: 403 });
      }
      if (isSuperAdminRoute && isAdmin) return NextResponse.redirect(new URL('/admin/products', req.url));
      return NextResponse.redirect(new URL('/?error=access_denied', req.url));
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
