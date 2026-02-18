-- Add date_of_birth and gender columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN date_of_birth date,
ADD COLUMN gender text;