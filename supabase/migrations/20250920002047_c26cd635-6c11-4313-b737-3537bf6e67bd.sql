-- Add enterprise profile fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN company_name TEXT,
ADD COLUMN contact_person TEXT,
ADD COLUMN address TEXT,
ADD COLUMN postal_code TEXT,
ADD COLUMN regions TEXT[],
ADD COLUMN robot_brands TEXT[],
ADD COLUMN robot_models TEXT[],
ADD COLUMN description TEXT;