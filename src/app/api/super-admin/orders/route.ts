import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/server-auth';
import { getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';

const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'] as const;

export async function GET() {
  try {
    await requireSuperAdmin();
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Supabase is required to view orders.' }, { status: 503 });
    }
    const supabase = getSupabaseServerClient(true);
    if (!supabase) return NextResponse.json({ success: false, error: 'Secure database client unavailable.' }, { status: 503 });

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(250);
    if (error) throw error;

    const orders = (data || []).map(order => ({
      id: order.id,
      customerId: order.customer_id,
      orderStatus: order.order_status,
      paymentStatus: order.payment_status,
      subtotal: Number(order.subtotal),
      shippingAmount: Number(order.shipping_amount),
      totalAmount: Number(order.total_amount),
      shippingAddress: order.shipping_address,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: (order.order_items || []).map((item: Record<string, unknown>) => ({
        id: item.id,
        orderId: item.order_id,
        productId: item.product_id,
        productName: item.product_name,
        unitPrice: Number(item.unit_price),
        quantity: Number(item.quantity),
        lineTotal: Number(item.line_total),
      })),
    }));
    return NextResponse.json({ success: true, orders });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message = error instanceof Error ? error.message : 'Unable to load orders.';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireSuperAdmin();
    const body = await req.json().catch(() => ({}));
    if (typeof body.orderId !== 'string' || !body.orderId) {
      return NextResponse.json({ success: false, error: 'orderId is required.' }, { status: 400 });
    }
    const update: Record<string, string> = {};
    if (body.orderStatus !== undefined) {
      if (!orderStatuses.includes(body.orderStatus)) {
        return NextResponse.json({ success: false, error: 'Invalid order status.' }, { status: 400 });
      }
      update.order_status = body.orderStatus;
    }
    if (body.paymentStatus !== undefined) {
      if (!paymentStatuses.includes(body.paymentStatus)) {
        return NextResponse.json({ success: false, error: 'Invalid payment status.' }, { status: 400 });
      }
      update.payment_status = body.paymentStatus;
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, error: 'No order fields to update.' }, { status: 400 });
    }
    update.updated_at = new Date().toISOString();

    const supabase = getSupabaseServerClient(true);
    if (!supabase || !isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Supabase is required to update orders.' }, { status: 503 });
    }
    const { data, error } = await supabase
      .from('orders')
      .update(update)
      .eq('id', body.orderId)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 });
    return NextResponse.json({ success: true, orderId: data.id });
  } catch (error: unknown) {
    const status = (error as { status?: number }).status || 500;
    const message = error instanceof Error ? error.message : 'Unable to update order.';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}