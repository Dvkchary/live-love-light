import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/server-auth';
import { clerkClient } from '@clerk/nextjs/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { AdminUserSummary, UserRole } from '@/types';

async function getAllClerkUsers() {
  const client = await clerkClient();
  const users = [];
  let totalCount = Number.POSITIVE_INFINITY;
  let offset = 0;

  while (offset < totalCount) {
    const page = await client.users.getUserList({
      limit: 100,
      offset,
      orderBy: '-created_at',
    });
    if (page.data.length === 0) break;
    users.push(...page.data);
    offset += page.data.length;
    totalCount = page.totalCount;
  }

  return users;
}

export async function GET() {
  try {
    await requireSuperAdmin();

    const adminUsers: AdminUserSummary[] = [];

    const clerkUsers = await getAllClerkUsers();

    for (const u of clerkUsers) {
        const rawRole = (u.publicMetadata as { role?: string })?.role;
        const role: UserRole = rawRole === 'super_admin'
          ? 'super_admin'
          : rawRole === 'admin' || rawRole === 'product_manager'
          ? 'admin'
          : 'user';

        const designatedDisplayName =
          role === 'super_admin'
            ? 'Live Love Light Owner'
            : role === 'admin'
            ? 'Live Love Light Admin'
            : (u.publicMetadata as { displayName?: string })?.displayName ||
              u.fullName ||
              u.firstName ||
              u.username ||
              u.primaryEmailAddress?.emailAddress?.split('@')[0] ||
              'User';

      adminUsers.push({
        id: u.id,
        email: u.primaryEmailAddress?.emailAddress,
        phoneNumber: u.primaryPhoneNumber?.phoneNumber,
        displayName: designatedDisplayName,
        role,
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : undefined,
        lastSignInAt: u.lastSignInAt ? new Date(u.lastSignInAt).toISOString() : undefined,
      });
    }

    return NextResponse.json({
      success: true,
      users: adminUsers,
    });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message = error instanceof Error ? error.message : 'Server error fetching admin users.';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const caller = await requireSuperAdmin();
    const body = await req.json().catch(() => ({}));
    const { targetUserId, newRole } = body as { targetUserId?: string; newRole?: UserRole };

    if (!targetUserId || !newRole) {
      return NextResponse.json(
        { success: false, error: 'targetUserId and newRole are required.' },
        { status: 400 }
      );
    }

    if (!['user', 'customer', 'admin', 'product_manager', 'super_admin'].includes(newRole)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Supported roles: "user", "admin", "super_admin".' },
        { status: 400 }
      );
    }

    const assignedRole: UserRole =
      newRole === 'customer' ? 'user' : newRole === 'product_manager' ? 'admin' : newRole;
    const designatedSuperAdminId = process.env.SUPER_ADMIN_CLERK_ID?.trim();
    let client;
    let target;
    try {
      client = await clerkClient();
      target = await client.users.getUser(targetUserId);
    } catch {
      return NextResponse.json({ success: false, error: 'Unable to verify target Clerk account.' }, { status: 404 });
    }
    const targetIsSuperAdmin =
      targetUserId === designatedSuperAdminId ||
      (target.publicMetadata as { role?: string })?.role === 'super_admin';

    // Protect the last Super Admin only when that account is being demoted.
    if (assignedRole !== 'super_admin' && targetIsSuperAdmin) {
      try {
        const allUsers = await getAllClerkUsers();
        const superAdminIds = new Set<string>();
        for (const u of allUsers) {
          const r = (u.publicMetadata as { role?: string })?.role;
          if (r === 'super_admin' || u.id === designatedSuperAdminId) superAdminIds.add(u.id);
        }
        if (superAdminIds.size <= 1) {
          return NextResponse.json(
            { success: false, error: 'Cannot demote or revoke the last Super Admin.' },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json({ success: false, error: 'Unable to verify remaining Super Admin accounts.' }, { status: 503 });
      }
    }

    const designatedDisplayName =
      assignedRole === 'super_admin'
        ? 'Live Love Light Owner'
        : assignedRole === 'admin'
        ? 'Live Love Light Admin'
        : undefined;

    // 1. Update Clerk user metadata
    let clerkUpdated = false;
    try {
      await client.users.updateUserMetadata(targetUserId, {
        publicMetadata: {
          role: assignedRole,
          ...(designatedDisplayName ? { displayName: designatedDisplayName } : {}),
          updatedBy: caller.userId,
          updatedAt: new Date().toISOString(),
        },
      });
      clerkUpdated = true;
    } catch (err) {
      console.warn('Could not update Clerk metadata directly:', err);
    }

    // 2. Update Supabase profiles table
    let supabaseUpdated = false;
    try {
      const supabase = getSupabaseServerClient(true);
      if (supabase) {
        const updatePayload: Record<string, unknown> = {
          role: assignedRole,
          updated_at: new Date().toISOString(),
        };
        if (designatedDisplayName) {
          updatePayload.display_name = designatedDisplayName;
        }

        const { error } = await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', targetUserId);

        if (!error) supabaseUpdated = true;
      }
    } catch (err) {
      console.warn('Could not update Supabase profile role:', err);
    }

    if (!clerkUpdated && !supabaseUpdated) {
      return NextResponse.json(
        { success: false, error: 'Failed to update user role in Clerk and Supabase.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: {
        userId: targetUserId,
        role: assignedRole,
        clerkUpdated,
        supabaseUpdated,
      },
    });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message = error instanceof Error ? error.message : 'Server error modifying admin role.';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
