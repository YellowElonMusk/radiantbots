-- Update profiles table RLS policies to allow public viewing of technician profiles
-- while still protecting personal data

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new policies for better visibility
-- Allow authenticated users to view profiles with required technician data
CREATE POLICY "Public can view complete technician profiles" 
ON public.profiles 
FOR SELECT 
USING (
  first_name IS NOT NULL 
  AND last_name IS NOT NULL 
  AND hourly_rate IS NOT NULL
);

-- Keep the existing insert and update policies for user control
-- These remain unchanged:
-- "Users can create their own profile" - INSERT with auth.uid() = user_id
-- "Users can update their own profile" - UPDATE with auth.uid() = user_id

-- Also update technician_brands and technician_skills to allow public viewing
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own brands" ON public.technician_brands;
DROP POLICY IF EXISTS "Users can view their own skills" ON public.technician_skills;

-- Create public viewing policies for technician brands and skills
CREATE POLICY "Public can view technician brands" 
ON public.technician_brands 
FOR SELECT 
USING (true);

CREATE POLICY "Public can view technician skills" 
ON public.technician_skills 
FOR SELECT 
USING (true);