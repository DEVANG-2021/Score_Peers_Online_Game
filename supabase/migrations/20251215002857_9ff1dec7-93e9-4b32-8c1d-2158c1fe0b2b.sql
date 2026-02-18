-- Update the handle_new_user function to set wallet_balance to 0 (no signup bonus)
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, wallet_balance)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'username', 0.00);
  RETURN NEW;
END;
$function$;