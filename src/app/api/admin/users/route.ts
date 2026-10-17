import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/server-auth';
import { clerkClient } from '@clerk/nextjs/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { AdminUserSummary, UserRole } from '@/types';

export async function GET() {
  try {
    await requireSuperAdmin();

    const adminUsers: AdminUserSummary[] = [];

    // 1. Fetch from Clerk Backend API
    try {
      const client = await clerkClient();
      const clerkUsers = await client.users.getUserList({
        limit: 100,
        orderBy: '-created_at',
      });

      if (clerkUsers?.data) {
        for (const u of clerkUsers.data) {
          const rawRole = (u.publicMetadata as { role?: string })?.role;
          const role: UserRole =
            rawRole === 'super_admin' || rawRole === 'admin'
              ? 'super_admin'
              : rawRole === 'product_manager'
              ? 'product_manager'
              : 'customer';

          const designatedDisplayName =
            role === 'super_admin'
              ? 'Live Love Light Owner'
              : role === 'product_manager'
              ? 'Live Love Light Manager'
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
      }
    } catch (clerkErr) {
      console.warn('Clerk user list fetch notice:', clerkErr);
    }

    // 2. Fetch from Supabase profiles if Clerk list is empty or for synchronization
    try {
      const supabase = getSupabaseServerClient(true);
      if (supabase) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, phone_number, display_name, role, created_at')
          .order('created_at', { ascending: false });

        if (profiles) {
          for (const p of profiles) {
            const existing = adminUsers.find(u => u.id === p.id);
            if (!existing) {
              adminUsers.push({
                id: p.id,
                email: p.email,
                phoneNumber: p.phone_number,
                displayName: p.display_name || p.email?.split('@')[0] || 'User',
                role: (p.role as UserRole) || 'customer',
                createdAt: p.created_at,
              });
            } else if (p.role && p.role !== 'customer') {
              existing.role = p.role as UserRole;
            }
          }
        }
      }
    } catch (sbErr) {
      console.warn('Supabase profiles fetch notice:', sbErr);
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

    if (!['customer', 'product_manager', 'super_admin'].includes(newRole)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Supported roles: "customer", "product_manager", "super_admin".' },
        { status: 400 }
      );
    }

    // Protection: Prevent demoting or removing the last remaining Super Admin
    if (newRole !== 'super_admin') {
      let superAdminCount = 0;

      try {
        const client = await clerkClient();
        const allUsers = await client.users.getUserList({ limit: 100 });
        for (const u of allUsers.data) {
          const r = (u.publicMetadata as { role?: string })?.role;
          if (r === 'super_admin' || r === 'admin') {
            superAdminCount++;
          }
        }
      } catch {
        // Fallback check Supabase profiles
        const supabase = getSupabaseServerClient(true);
        if (supabase) {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .in('role', ['super_admin', 'admin']);
          superAdminCount = count || 0;
        }
      }

      // If caller is the only super admin and is demoting themselves, or target is the last super admin
      if (superAdminCount <= 1) {
        return NextResponse.json(
          {
            success: false,
            error: 'Security Constraint: Cannot remove or demote the last remaining Super Administrator in the system.',
          },
          { status: 400 }
        );
      }
    }

    const designatedDisplayName =
      newRole === 'super_admin'
        ? 'Live Love Light Owner'
        : newRole === 'product_manager'
        ? 'Live Love Light Manager'
        : undefined;

    // 1. Update Clerk user metadata
    let clerkUpdated = false;
    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(targetUserId, {
        publicMetadata: {
          role: newRole,
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
          role: newRole,
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
        role: newRole,
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
