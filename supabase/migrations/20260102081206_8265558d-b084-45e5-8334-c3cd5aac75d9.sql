-- Add sp_cash_balance and last_daily_reward columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS sp_cash_balance numeric NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS last_daily_reward timestamp with time zone DEFAULT NULL;