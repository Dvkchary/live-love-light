import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server-auth';
import { getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';
import { getLocalCategories, setLocalCategories } from '@/lib/products';

async function readCategories() {
  const supabase = getSupabaseServerClient(true);
  if (!supabase || !isSupabaseConfigured()) return getLocalCategories();

  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'categories')
    .maybeSingle();
  if (error) throw error;
  const categories = Array.isArray(data?.value) ? data.value.filter((value): value is string => typeof value === 'string') : [];
  return categories;
}

async function writeCategories(categories: string[]) {
  const supabase = getSupabaseServerClient(true);
  if (supabase && isSupabaseConfigured()) {
    const { error } = await supabase.from('site_settings').upsert({
      key: 'categories',
      value: categories,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' });
    if (error) throw error;
  }
  setLocalCategories(categories);
}

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ success: true, categories: await readCategories() });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message = error instanceof Error ? error.message : 'Unable to load categories.';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { category } = await req.json().catch(() => ({}));
    if (typeof category !== 'string' || !category.trim()) {
      return NextResponse.json({ success: false, error: 'A category name is required.' }, { status: 400 });
    }
    const categories = await readCategories();
    const name = category.trim();
    if (!categories.includes(name)) await writeCategories([...categories, name]);
    return NextResponse.json({ success: true, categories: categories.includes(name) ? categories : [...categories, name] });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message = error instanceof Error ? error.message : 'Unable to save category.';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const category = new URL(req.url).searchParams.get('category')?.trim();
    if (!category) return NextResponse.json({ success: false, error: 'A category name is required.' }, { status: 400 });
    const categories = (await readCategories()).filter(name => name !== category);
    await writeCategories(categories);
    return NextResponse.json({ success: true, categories });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message = error instanceof Error ? error.message : 'Unable to delete category.';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}