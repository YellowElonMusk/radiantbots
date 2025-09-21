-- Reset Supabase backend with simplified schema
-- Drop all existing tables and related objects

-- Drop existing tables in correct order (respecting foreign key dependencies)
DROP TABLE IF EXISTS public.technician_skills CASCADE;
DROP TABLE IF EXISTS public.technician_brands CASCADE;
DROP TABLE IF EXISTS public.search_requests CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.missions CASCADE;
DROP TABLE IF EXISTS public.mission_types CASCADE;
DROP TABLE IF EXISTS public.guest_users CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.availability_periods CASCADE;
DROP TABLE IF EXISTS public.availability CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing enums
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.user_type CASCADE;
DROP TYPE IF EXISTS public.mission_status CASCADE;

-- Create new enums
CREATE TYPE public.user_type AS ENUM ('technician', 'enterprise');
CREATE TYPE public.mission_status AS ENUM ('pending', 'accepted', 'declined', 'completed');

-- Create profiles table (unified for technicians and enterprises)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type public.user_type NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  profile_photo_url TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create missions table
CREATE TABLE public.missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  desired_date DATE,
  desired_time TIME WITHOUT TIME ZONE,
  status public.mission_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view technician profiles" 
ON public.profiles 
FOR SELECT 
USING (user_type = 'technician' AND first_name IS NOT NULL AND last_name IS NOT NULL);

-- Create RLS policies for missions
CREATE POLICY "Clients can view their missions" 
ON public.missions 
FOR SELECT 
USING (client_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Technicians can view assigned missions" 
ON public.missions 
FOR SELECT 
USING (technician_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can create missions" 
ON public.missions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND client_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can update their missions" 
ON public.missions 
FOR UPDATE 
USING (client_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Technicians can update assigned missions" 
ON public.missions 
FOR UPDATE 
USING (technician_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create RLS policies for messages
CREATE POLICY "Users can view messages for their missions" 
ON public.messages 
FOR SELECT 
USING (
  mission_id IN (
    SELECT id FROM public.missions 
    WHERE client_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR technician_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages for their missions" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  sender_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  AND mission_id IN (
    SELECT id FROM public.missions 
    WHERE client_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR technician_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can mark messages as read" 
ON public.messages 
FOR UPDATE 
USING (
  mission_id IN (
    SELECT id FROM public.missions 
    WHERE client_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR technician_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX idx_missions_client_id ON public.missions(client_id);
CREATE INDEX idx_missions_technician_id ON public.missions(technician_id);
CREATE INDEX idx_missions_status ON public.missions(status);
CREATE INDEX idx_messages_mission_id ON public.messages(mission_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON public.missions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();