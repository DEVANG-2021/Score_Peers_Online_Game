-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can view admin list" ON public.admin_users;

-- Drop the admin policy on player_props that causes the recursion
DROP POLICY IF EXISTS "Admins can manage all props" ON public.player_props;

-- Create a security definer function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = _user_id
  )
$$;

-- Recreate admin_users policy using the function
CREATE POLICY "Admins can view admin list"
ON public.admin_users
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Recreate player_props admin policy using the function
CREATE POLICY "Admins can manage all props"
ON public.player_props
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));