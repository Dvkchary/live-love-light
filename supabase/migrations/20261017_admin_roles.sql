-- ==============================================================================
-- LIVE LOVE LIGHT — TWO-LEVEL ADMIN ROLES MIGRATION
-- Migration: 20261017_admin_roles.sql
-- Description: Updates profiles role constraint and RLS policies for PRODUCT_MANAGER and SUPER_ADMIN
-- ==============================================================================

-- 1. Update the role check constraint on public.profiles
DO $$
BEGIN
    -- Drop existing check constraint if present
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    
    -- Add updated check constraint supporting customer, product_manager, super_admin, and admin
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
        CHECK (role IN ('customer', 'product_manager', 'super_admin', 'admin'));
END $$;

-- 2. Create role check helper functions for RLS
CREATE OR REPLACE FUNCTION public.is_admin(user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role IN ('super_admin', 'product_manager', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role IN ('super_admin', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Enhance RLS Policies on public.products
DROP POLICY IF EXISTS "Admin full access on products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Privileged roles can mutate products" ON public.products;

-- Allow authenticated admins to view inactive/draft products in dashboard
CREATE POLICY "Admins can view all products"
    ON public.products FOR SELECT
    USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        public.is_admin(auth.uid()::text)
    );

-- Allow service role full access (Server API performs field-level validation and executes mutations)
CREATE POLICY "Privileged service role product mutation"
    ON public.products FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        public.is_admin(auth.uid()::text)
    );

-- 4. Enhance RLS Policies on public.profiles
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update profiles" ON public.profiles;

CREATE POLICY "Super admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        public.is_super_admin(auth.uid()::text)
    );

CREATE POLICY "Super admins can update profiles"
    ON public.profiles FOR UPDATE
    USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        public.is_super_admin(auth.uid()::text)
    );
