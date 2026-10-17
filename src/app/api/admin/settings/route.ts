import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requireSuperAdmin } from '@/lib/server-auth';
import { getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';

async function readDeletePermission() {
  const supabase = getSupabaseServerClient(true);
  if (!supabase || !isSupabaseConfigured()) return false;
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'admin_can_delete_products')
    .maybeSingle();
  if (error) throw error;
  return data?.value === true;
}

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ success: true, adminCanDeleteProducts: await readDeletePermission() });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message = error instanceof Error ? error.message : 'Unable to load administrator settings.';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireSuperAdmin();
    const body = await req.json().catch(() => ({}));
    if (typeof body.adminCanDeleteProducts !== 'boolean') {
      return NextResponse.json({ success: false, error: 'adminCanDeleteProducts must be a boolean.' }, { status: 400 });
    }
    const supabase = getSupabaseServerClient(true);
    if (!supabase || !isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Supabase is required to persist this setting.' }, { status: 503 });
    }
    const { error } = await supabase.from('site_settings').upsert({
      key: 'admin_can_delete_products',
      value: body.adminCanDeleteProducts,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' });
    if (error) throw error;
    return NextResponse.json({ success: true, adminCanDeleteProducts: body.adminCanDeleteProducts });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message = error instanceof Error ? error.message : 'Unable to update administrator settings.';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}