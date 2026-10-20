import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, sanitizeProductFieldsForRole } from '@/lib/server-auth';
import { getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';
import { Product } from '@/types';
import { getLocalProducts, setLocalProducts } from '@/lib/products';

export async function GET() {
  try {
    await requireAdmin();

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseServerClient(true);
      if (supabase) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return NextResponse.json({
            success: true,
            products: data.map(row => ({
              id: row.id,
              name: row.name,
              slug: row.slug,
              description: row.description,
              fragrance: row.fragrance,
              fragranceNotes: row.fragrance_notes,
              price: Number(row.price),
              originalPrice: row.original_price ? Number(row.original_price) : undefined,
              currency: (row.currency || 'INR') as 'INR',
              category: row.category,
              images: Array.isArray(row.images) ? row.images : [],
              marketplaces: row.marketplaces || {},
              featured: Boolean(row.featured),
              active: Boolean(row.active),
              inStock: Boolean(row.in_stock),
              stockQuantity: Number(row.stock_quantity ?? (row.in_stock ? 1 : 0)),
              burnTimeHours: row.burn_time_hours ?? 45,
              waxType: row.wax_type ?? '100% Botanical Soy Wax',
              weightGrams: row.weight_grams ?? 250,
              dimensions: row.dimensions,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            })),
          });
        }
      }
    }

    // Local fallback
    const products = getLocalProducts();
    return NextResponse.json({ success: true, products });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message = error instanceof Error ? error.message : 'Server error fetching products.';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => ({}));

    if (!body.name || !body.description || body.price === undefined || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Missing required product fields (name, description, price, category).' },
        { status: 400 }
      );
    }

    // Sanitize Admin marketplace fields; Admin and Super Admin can control publishing.
    const { sanitized } = sanitizeProductFieldsForRole(body, null, admin.role);
    const stockQuantity = Number(sanitized.stockQuantity ?? (sanitized.inStock === false ? 0 : 50));
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      return NextResponse.json({ success: false, error: 'Stock quantity must be a non-negative whole number.' }, { status: 400 });
    }

    const generatedSlug = (sanitized.slug as string)?.trim() ||
      (sanitized.name as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newProduct: Product = {
      id: (sanitized.id as string) || `candle_${Date.now()}`,
      name: (sanitized.name as string).trim(),
      slug: generatedSlug,
      description: (sanitized.description as string).trim(),
      fragrance: (sanitized.fragrance as string)?.trim() || 'Artisanal Candle',
      fragranceNotes: (sanitized.fragranceNotes as Product['fragranceNotes']) || {},
      price: Number(sanitized.price),
      originalPrice: sanitized.originalPrice ? Number(sanitized.originalPrice) : undefined,
      currency: 'INR',
      category: (sanitized.category as string).trim(),
      images: Array.isArray(sanitized.images) && sanitized.images.length > 0
        ? sanitized.images
        : ['/images/teddy - Royal oud.jpeg'],
      marketplaces: (sanitized.marketplaces as Product['marketplaces']) || {},
      featured: Boolean(sanitized.featured),
      active: Boolean(sanitized.active ?? true),
      inStock: sanitized.inStock !== false && stockQuantity > 0,
      stockQuantity,
      burnTimeHours: sanitized.burnTimeHours ? Number(sanitized.burnTimeHours) : 45,
      waxType: (sanitized.waxType as string) || '100% Botanical Soy Wax',
      weightGrams: sanitized.weightGrams ? Number(sanitized.weightGrams) : 250,
      dimensions: sanitized.dimensions as string | undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Database operation (Supabase service role)
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseServerClient(true);
      if (supabase) {
        const { data, error } = await supabase.from('products').insert({
          id: newProduct.id,
          name: newProduct.name,
          slug: newProduct.slug,
          description: newProduct.description,
          fragrance: newProduct.fragrance,
          fragrance_notes: newProduct.fragranceNotes,
          price: newProduct.price,
          original_price: newProduct.originalPrice,
          currency: newProduct.currency,
          category: newProduct.category,
          images: newProduct.images,
          marketplaces: newProduct.marketplaces,
          featured: newProduct.featured,
          active: newProduct.active,
          in_stock: newProduct.inStock,
          stock_quantity: newProduct.stockQuantity,
          burn_time_hours: newProduct.burnTimeHours,
          wax_type: newProduct.waxType,
          weight_grams: newProduct.weightGrams,
          dimensions: newProduct.dimensions,
          updated_at: newProduct.updatedAt,
        }).select('id, created_at').single();

        if (error) {
          console.warn('Supabase product insertion note:', error.message);
          // If insert fails due to DB constraint, fallback gracefully
        } else if (data) {
          newProduct.id = data.id;
          newProduct.createdAt = data.created_at;
        }
      }
    }

    // Local state fallback update
    const current = getLocalProducts();
    const updated = [newProduct, ...current.filter(p => p.id !== newProduct.id && p.slug !== newProduct.slug)];
    setLocalProducts(updated);

    return NextResponse.json({
      success: true,
      product: newProduct,
      notice: 'Product created successfully.',
    });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message = error instanceof Error ? error.message : 'Server error creating product.';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => ({}));

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required for updates.' },
        { status: 400 }
      );
    }

    // 1. Fetch existing product to obtain trusted existing record
    let existingProduct: Product | null = null;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseServerClient(true);
      if (supabase) {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('id', body.id)
          .single();

        if (data) {
          existingProduct = {
            id: data.id,
            name: data.name,
            slug: data.slug,
            description: data.description,
            fragrance: data.fragrance,
            fragranceNotes: data.fragrance_notes,
            price: Number(data.price),
            originalPrice: data.original_price ? Number(data.original_price) : undefined,
            currency: (data.currency || 'INR') as 'INR',
            category: data.category,
            images: Array.isArray(data.images) ? data.images : [],
            marketplaces: data.marketplaces || {},
            featured: Boolean(data.featured),
            active: Boolean(data.active),
            inStock: Boolean(data.in_stock),
            stockQuantity: Number(data.stock_quantity ?? (data.in_stock ? 1 : 0)),
            burnTimeHours: data.burn_time_hours ?? 45,
            waxType: data.wax_type ?? '100% Botanical Soy Wax',
            weightGrams: data.weight_grams ?? 250,
            dimensions: data.dimensions,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      }
    }

    if (!existingProduct) {
      const local = getLocalProducts();
      existingProduct = local.find(p => p.id === body.id) || null;
    }

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: `Product with ID "${body.id}" was not found.` },
        { status: 404 }
      );
    }

    // 2. Strict field sanitization:
    // Restricted Admin updates retain trusted marketplace and publishing values from existingProduct.
    const { sanitized, rejectedMarketplaceAttempt } = sanitizeProductFieldsForRole(
      body,
      existingProduct as unknown as Record<string, unknown>,
      admin.role
    );

    const stockQuantity = Number(sanitized.stockQuantity ?? existingProduct.stockQuantity ?? (existingProduct.inStock ? 1 : 0));
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      return NextResponse.json({ success: false, error: 'Stock quantity must be a non-negative whole number.' }, { status: 400 });
    }

    const updatedProduct: Product = {
      ...existingProduct,
      name: (sanitized.name as string)?.trim() || existingProduct.name,
      slug: (sanitized.slug as string)?.trim() || existingProduct.slug,
      description: (sanitized.description as string)?.trim() || existingProduct.description,
      fragrance: (sanitized.fragrance as string)?.trim() || existingProduct.fragrance,
      fragranceNotes: (sanitized.fragranceNotes as Product['fragranceNotes']) || existingProduct.fragranceNotes,
      price: sanitized.price !== undefined ? Number(sanitized.price) : existingProduct.price,
      originalPrice: sanitized.originalPrice !== undefined ? Number(sanitized.originalPrice) : existingProduct.originalPrice,
      category: (sanitized.category as string)?.trim() || existingProduct.category,
      images: Array.isArray(sanitized.images) && sanitized.images.length > 0 ? sanitized.images : existingProduct.images,
      marketplaces: sanitized.marketplaces as Product['marketplaces'], // Strictly enforced
      featured: sanitized.featured !== undefined ? Boolean(sanitized.featured) : existingProduct.featured,
      active: sanitized.active !== undefined ? Boolean(sanitized.active) : existingProduct.active,
      inStock: stockQuantity > 0 && (sanitized.inStock !== undefined ? Boolean(sanitized.inStock) : existingProduct.inStock),
      stockQuantity,
      burnTimeHours: sanitized.burnTimeHours !== undefined ? Number(sanitized.burnTimeHours) : existingProduct.burnTimeHours,
      waxType: (sanitized.waxType as string) || existingProduct.waxType,
      updatedAt: new Date().toISOString(),
    };

    // 3. Persist to Supabase if configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseServerClient(true);
      if (supabase) {
        const { error } = await supabase
          .from('products')
          .update({
            name: updatedProduct.name,
            slug: updatedProduct.slug,
            description: updatedProduct.description,
            fragrance: updatedProduct.fragrance,
            fragrance_notes: updatedProduct.fragranceNotes,
            price: updatedProduct.price,
            original_price: updatedProduct.originalPrice,
            category: updatedProduct.category,
            images: updatedProduct.images,
            marketplaces: updatedProduct.marketplaces,
            featured: updatedProduct.featured,
            active: updatedProduct.active,
            in_stock: updatedProduct.inStock,
            stock_quantity: updatedProduct.stockQuantity,
            burn_time_hours: updatedProduct.burnTimeHours,
            wax_type: updatedProduct.waxType,
            updated_at: updatedProduct.updatedAt,
          })
          .eq('id', updatedProduct.id);

        if (error) {
          return NextResponse.json(
            { success: false, error: `Database update failed: ${error.message}` },
            { status: 500 }
          );
        }
      }
    }

    // Local fallback update
    const current = getLocalProducts();
    const updated = current.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    setLocalProducts(updated);

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      notice: 'Product updated successfully.',
    });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message = error instanceof Error ? error.message : 'Server error updating product.';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (admin.role !== 'super_admin') {
      const supabase = getSupabaseServerClient(true);
      const { data: setting, error } = supabase
        ? await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'admin_can_delete_products')
            .maybeSingle()
        : { data: null, error: null };
      if (error) throw error;
      if (setting?.value !== true) {
        return NextResponse.json({ success: false, error: 'Product deletion is restricted by the Super Admin.' }, { status: 403 });
      }
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required for deletion.' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseServerClient(true);
      if (supabase) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
          return NextResponse.json(
            { success: false, error: `Database deletion failed: ${error.message}` },
            { status: 500 }
          );
        }
      }
    }

    const current = getLocalProducts();
    setLocalProducts(current.filter(p => p.id !== id));

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message = error instanceof Error ? error.message : 'Server error deleting product.';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
