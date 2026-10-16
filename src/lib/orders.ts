import { Order, OrderItem } from '@/types';
import { getSupabaseServerClient, isSupabaseConfigured } from './supabase';

export interface CreateOrderInput {
  customerId: string; // Verified Clerk user ID
  items: {
    productId: string;
    quantity: number;
  }[];
  shippingAddress?: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
}

export interface CreateOrderResult {
  success: boolean;
  order?: Order;
  error?: string;
}

/**
 * Creates a validated order on the server.
 * Ensures:
 * 1. Product IDs are verified from the Supabase database.
 * 2. Prices are strictly computed from authoritative database records (not from browser).
 * 3. Stock availability is verified before order creation.
 */
export async function createServerOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Supabase database is not configured. Orders require a connected database.',
    };
  }

  const supabase = getSupabaseServerClient(true);
  if (!supabase) {
    return {
      success: false,
      error: 'Unable to initialize secure database client.',
    };
  }

  if (!input.customerId) {
    return {
      success: false,
      error: 'Authenticated user identifier is required to create an order.',
    };
  }

  if (!input.items || input.items.length === 0) {
    return {
      success: false,
      error: 'Cannot create an empty order.',
    };
  }

  try {
    // 1. Fetch products from database to get trusted prices & verify stock
    const productIds = input.items.map(i => i.productId);
    const { data: dbProducts, error: prodErr } = await supabase
      .from('products')
      .select('id, name, price, in_stock, stock_quantity')
      .in('id', productIds);

    if (prodErr || !dbProducts) {
      return {
        success: false,
        error: `Failed to fetch products: ${prodErr?.message || 'Unknown database error'}`,
      };
    }

    interface DbProductRow {
      id: string;
      name: string;
      price: number;
      in_stock: boolean;
      stock_quantity?: number;
    }
    const productMap = new Map<string, DbProductRow>();
    dbProducts.forEach(p => productMap.set(p.id, p as unknown as DbProductRow));

    let subtotal = 0;
    const orderItemsToInsert: Omit<OrderItem, 'id' | 'orderId'>[] = [];

    for (const item of input.items) {
      const dbProd = productMap.get(item.productId);
      if (!dbProd) {
        return {
          success: false,
          error: `Product with ID ${item.productId} was not found in the catalogue.`,
        };
      }

      if (!dbProd.in_stock || (dbProd.stock_quantity !== undefined && dbProd.stock_quantity < item.quantity)) {
        return {
          success: false,
          error: `Insufficient stock for candle: "${dbProd.name}".`,
        };
      }

      const unitPrice = Number(dbProd.price);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      orderItemsToInsert.push({
        productId: dbProd.id,
        productName: dbProd.name,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      });
    }

    const shippingAmount = subtotal > 999 ? 0 : 79; // Free shipping above ₹999
    const totalAmount = subtotal + shippingAmount;

    // 2. Insert order
    const { data: newOrder, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_id: input.customerId,
        order_status: 'pending',
        subtotal,
        shipping_amount: shippingAmount,
        total_amount: totalAmount,
        shipping_address: input.shippingAddress || {},
        payment_status: 'pending',
      })
      .select()
      .single();

    if (orderErr || !newOrder) {
      return {
        success: false,
        error: `Order creation failed: ${orderErr?.message}`,
      };
    }

    // 3. Insert order items
    const itemsPayload = orderItemsToInsert.map(item => ({
      order_id: newOrder.id,
      product_id: item.productId,
      product_name: item.productName,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      line_total: item.lineTotal,
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(itemsPayload);
    if (itemsErr) {
      console.error('Error inserting order items:', itemsErr);
    }

    return {
      success: true,
      order: {
        id: newOrder.id,
        customerId: newOrder.customer_id,
        orderStatus: newOrder.order_status,
        subtotal: Number(newOrder.subtotal),
        shippingAmount: Number(newOrder.shipping_amount),
        totalAmount: Number(newOrder.total_amount),
        shippingAddress: newOrder.shipping_address,
        paymentStatus: newOrder.payment_status,
        createdAt: newOrder.created_at,
        updatedAt: newOrder.updated_at,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected server error creating order.',
    };
  }
}
