-- Add travel preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN accepts_travel boolean DEFAULT false,
ADD COLUMN max_travel_distance integer DEFAULT 0,
ADD COLUMN city text;

-- Create mission types table
CREATE TABLE public.mission_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on mission_types
ALTER TABLE public.mission_types ENABLE ROW LEVEL SECURITY;

-- Create policy for mission types (read-only for everyone)
CREATE POLICY "Anyone can view mission types" 
ON public.mission_types 
FOR SELECT 
USING (true);

-- Insert default mission types
INSERT INTO public.mission_types (name) VALUES 
('POC'),
('Deployment'), 
('Preventive Maintenance');

-- Create search requests table to store client search criteria
CREATE TABLE public.search_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_email text,
  deployment_address text NOT NULL,
  deployment_city text NOT NULL,
  mission_date date NOT NULL,
  date_flexible boolean DEFAULT false,
  mission_type text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on search_requests
ALTER TABLE public.search_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for search requests (users can view their own requests)
CREATE POLICY "Users can create search requests" 
ON public.search_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view search requests" 
ON public.search_requests 
FOR SELECT 
USING (true);