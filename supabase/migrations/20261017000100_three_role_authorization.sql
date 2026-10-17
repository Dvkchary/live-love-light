-- Three-role authorization hardening for Clerk-backed accounts.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('user', 'customer', 'admin', 'product_manager', 'super_admin'));

CREATE OR REPLACE FUNCTION public.prevent_profile_role_self_assignment()
RETURNS TRIGGER AS $$
BEGIN
    IF COALESCE(auth.jwt() ->> 'role', '') <> 'service_role' THEN
        IF TG_OP = 'INSERT' THEN
            NEW.role := 'user';
        ELSE
            NEW.role := OLD.role;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_profile_role_self_assignment ON public.profiles;
CREATE TRIGGER prevent_profile_role_self_assignment
    BEFORE INSERT OR UPDATE OF role ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_self_assignment();

CREATE OR REPLACE FUNCTION public.is_admin(user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role IN ('super_admin', 'admin', 'product_manager')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access on products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Privileged service role product mutation" ON public.products;
DROP POLICY IF EXISTS "Service role manages products" ON public.products;
DROP POLICY IF EXISTS "Public visitors can view active candles" ON public.products;

CREATE POLICY "Public visitors can view active candles"
    ON public.products FOR SELECT USING (active = true);
CREATE POLICY "Service role manages products"
    ON public.products FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role manages site settings" ON public.site_settings;
CREATE POLICY "Service role manages site settings"
    ON public.site_settings FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

INSERT INTO public.site_settings (key, value) VALUES
    ('categories', '["Teddy Candles", "Flower Candles", "Rose Candles", "Fragrance Candles"]'::jsonb),
    ('admin_can_delete_products', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;