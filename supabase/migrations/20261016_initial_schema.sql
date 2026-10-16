-- ==============================================================================
-- LIVE LOVE LIGHT — SUPABASE DATABASE SCHEMA MIGRATION
-- Migration: 20261016_initial_schema.sql
-- Description: Creates products, profiles, orders, and order_items with RLS policies
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. PRODUCTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    fragrance TEXT NOT NULL,
    fragrance_notes JSONB DEFAULT '{"top": "", "middle": "", "base": ""}'::jsonb,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10, 2) CHECK (original_price >= price OR original_price IS NULL),
    currency TEXT NOT NULL DEFAULT 'INR',
    category TEXT NOT NULL,
    images TEXT[] NOT NULL DEFAULT '{}',
    marketplaces JSONB DEFAULT '{"amazon": "", "flipkart": "", "meesho": ""}'::jsonb,
    featured BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    in_stock BOOLEAN NOT NULL DEFAULT true,
    stock_quantity INTEGER NOT NULL DEFAULT 50 CHECK (stock_quantity >= 0),
    burn_time_hours INTEGER DEFAULT 45,
    wax_type TEXT DEFAULT '100% Botanical Soy Wax',
    weight_grams INTEGER DEFAULT 250,
    dimensions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);

-- ------------------------------------------------------------------------------
-- 2. CUSTOMER PROFILES TABLE (Linked to Clerk User ID)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY, -- Clerk User ID (e.g. user_2...)
    email TEXT,
    phone_number TEXT,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    saved_products TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ------------------------------------------------------------------------------
-- 3. ORDERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    shipping_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    shipping_address JSONB DEFAULT '{}'::jsonb,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);

-- ------------------------------------------------------------------------------
-- 4. ORDER ITEMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(10, 2) NOT NULL CHECK (line_total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Products RLS:
-- Anyone (guest or authenticated) can read active candles
CREATE POLICY "Public visitors can view active candles"
    ON public.products FOR SELECT
    USING (active = true);

-- Service role & admins have full management permissions on products
CREATE POLICY "Admin full access on products"
    ON public.products FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()::text AND profiles.role = 'admin'
        )
    );

-- Profiles RLS:
-- Users can view and update their own profile
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (id = auth.uid()::text OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid()::text)
    WITH CHECK (id = auth.uid()::text);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (id = auth.uid()::text OR auth.jwt() ->> 'role' = 'service_role');

-- Orders RLS:
-- Customers can view only their own orders
CREATE POLICY "Customers can read own orders"
    ON public.orders FOR SELECT
    USING (customer_id = auth.uid()::text OR auth.jwt() ->> 'role' = 'service_role');

-- Customers can create orders linked to their own Clerk ID
CREATE POLICY "Customers can insert own orders"
    ON public.orders FOR INSERT
    WITH CHECK (customer_id = auth.uid()::text);

-- Order Items RLS:
CREATE POLICY "Customers can read own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.customer_id = auth.uid()::text OR auth.jwt() ->> 'role' = 'service_role')
        )
    );

CREATE POLICY "Customers can insert own order items"
    ON public.order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.customer_id = auth.uid()::text
        )
    );

-- ------------------------------------------------------------------------------
-- 6. SAMPLE ARTISAN CANDLE SEED DATA
-- ------------------------------------------------------------------------------
INSERT INTO public.products (
    name,
    slug,
    description,
    fragrance,
    fragrance_notes,
    price,
    original_price,
    category,
    images,
    marketplaces,
    featured,
    active,
    in_stock,
    stock_quantity,
    burn_time_hours,
    wax_type
) VALUES
(
    'Teddy Candle — Royal Oud',
    'teddy-candle-royal-oud',
    'Charming handcrafted teddy bear candle infused with deep Arabian Royal Oud. Hand-poured with 100% botanical soy wax and non-toxic cotton wicks.',
    'Royal Oud',
    '{"top": "Cardamom, Smoked Wood", "middle": "Cedarwood, Rosewood", "base": "Agarwood (Oud), Amber, Tonka Bean"}'::jsonb,
    399.00,
    599.00,
    'Teddy Candles',
    ARRAY['/images/teddy - Royal oud.jpeg'],
    '{"amazon": "https://www.amazon.in/dp/example-teddy", "flipkart": "https://www.flipkart.com/example-teddy", "meesho": "https://www.meesho.com/example-teddy"}'::jsonb,
    true,
    true,
    true,
    50,
    45,
    '100% Botanical Soy Wax'
),
(
    'Daisy Flower Candle — Blooming Jasmine',
    'daisy-flower-candle-jasmine',
    'Intricately sculpted floral petals releasing soothing evening Jasmine and uplifting fresh green accents.',
    'Blooming Jasmine',
    '{"top": "Fresh Cut Greens, Dewy Petals", "middle": "Indian Mogra, Jasmine Sambac", "base": "White Musk, Warm Amber"}'::jsonb,
    349.00,
    499.00,
    'Flower Candles',
    ARRAY['/images/daisy - jasmine.jpeg'],
    '{"amazon": "https://www.amazon.in/dp/example-daisy", "flipkart": "https://www.flipkart.com/example-daisy", "meesho": "https://www.meesho.com/example-daisy"}'::jsonb,
    true,
    true,
    true,
    40,
    35,
    '100% Botanical Soy Wax'
),
(
    'Amber Glass Jar Candle — Royal Oud',
    'amber-glass-jar-candle-royal-oud',
    'Luxurious amber jar candle with a protective wooden lid. Rich oud wood, amber resin, and gentle vanilla warmth.',
    'Royal Oud & Amber',
    '{"top": "Bergamot, Nutmeg", "middle": "Royal Oud, Patchouli", "base": "Dark Amber, Vanilla, Smoky Leather"}'::jsonb,
    549.00,
    799.00,
    'Fragrance Candles',
    ARRAY['/images/jar - rayal oud.jpeg'],
    '{"amazon": "https://www.amazon.in/dp/example-jar", "flipkart": "https://www.flipkart.com/example-jar", "meesho": "https://www.meesho.com/example-jar"}'::jsonb,
    true,
    true,
    true,
    60,
    65,
    '100% Botanical Soy Wax'
),
(
    'Sacred Lotus Candle — Sandalwood',
    'sacred-lotus-candle-sandalwood',
    'Multi-tiered lotus blossom candle hand-poured with authentic Mysore sandalwood essential fragrance oils.',
    'Mysore Sandalwood',
    '{"top": "Cinnamon Bark, Sweet Orange", "middle": "Mysore Sandalwood, Orris Root", "base": "Creamy Sandalwood, Frankincense"}'::jsonb,
    429.00,
    649.00,
    'Decorative Candles',
    ARRAY['/images/lotus - sandlewood.jpeg'],
    '{"amazon": "https://www.amazon.in/dp/example-lotus", "flipkart": "https://www.flipkart.com/example-lotus", "meesho": "https://www.meesho.com/example-lotus"}'::jsonb,
    false,
    true,
    true,
    30,
    40,
    '100% Botanical Soy Wax'
),
(
    'Peony Flower Candle — Jasmine & Oud',
    'peony-flower-candle-jasmine-oud',
    'Sculptural lush peony flower blending tender jasmine blooms with rich royal oud tones for opulent ambient lighting.',
    'Jasmine & Royal Oud',
    '{"top": "Pink Pepper, Bergamot", "middle": "Wild Peony, Night Jasmine", "base": "Rich Oud, Sandalwood, Amber"}'::jsonb,
    379.00,
    549.00,
    'Flower Candles',
    ARRAY['/images/peony - jamsine & Royal oud.jpeg'],
    '{"amazon": "https://www.amazon.in/dp/example-peony", "flipkart": "https://www.flipkart.com/example-peony", "meesho": "https://www.meesho.com/example-peony"}'::jsonb,
    false,
    true,
    true,
    35,
    38,
    '100% Botanical Soy Wax'
)
ON CONFLICT (slug) DO NOTHING;
