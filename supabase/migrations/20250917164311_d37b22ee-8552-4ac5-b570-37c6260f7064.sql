-- Fix the profiles RLS policies to allow users to manage their own profiles
-- while also allowing public viewing of complete technician profiles

-- Add back the policy for users to view their own profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- The existing policies should remain:
-- "Users can create their own profile" - INSERT with auth.uid() = user_id  
-- "Users can update their own profile" - UPDATE with auth.uid() = user_id

-- Add back personal management policies for technician_brands and technician_skills
-- while keeping the public viewing policies

-- Allow users to manage their own brands
CREATE POLICY "Users can view their own brands" 
ON public.technician_brands 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to manage their own skills  
CREATE POLICY "Users can view their own skills" 
ON public.technician_skills 
FOR SELECT 
USING (auth.uid() = user_id);