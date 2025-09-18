-- Create enum types
CREATE TYPE public.user_role AS ENUM ('client', 'technician');
CREATE TYPE public.mission_status AS ENUM ('pending', 'accepted', 'declined', 'completed');

-- Create guest_users table for anonymous visitors
CREATE TABLE public.guest_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  browser_token TEXT NOT NULL UNIQUE,
  name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on guest_users
ALTER TABLE public.guest_users ENABLE ROW LEVEL SECURITY;

-- Create policies for guest_users
CREATE POLICY "Anyone can create guest users" 
ON public.guest_users 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view guest users by browser_token" 
ON public.guest_users 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update guest users by browser_token" 
ON public.guest_users 
FOR UPDATE 
USING (true);

-- Add role column to profiles table to track user types
ALTER TABLE public.profiles ADD COLUMN role public.user_role DEFAULT 'client';

-- Update existing profiles to be technicians if they have hourly_rate
UPDATE public.profiles SET role = 'technician' WHERE hourly_rate IS NOT NULL;

-- Create missions table
CREATE TABLE public.missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  technician_id UUID NOT NULL REFERENCES public.profiles(user_id),
  client_user_id UUID REFERENCES public.profiles(user_id),
  guest_user_id UUID REFERENCES public.guest_users(id),
  title TEXT NOT NULL,
  description TEXT,
  desired_date DATE,
  desired_time TIME,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  status public.mission_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT missions_client_check CHECK (
    (client_user_id IS NOT NULL AND guest_user_id IS NULL) OR 
    (client_user_id IS NULL AND guest_user_id IS NOT NULL)
  )
);

-- Enable RLS on missions
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Create policies for missions
CREATE POLICY "Technicians can view their missions" 
ON public.missions 
FOR SELECT 
USING (technician_id = auth.uid());

CREATE POLICY "Clients can view their missions" 
ON public.missions 
FOR SELECT 
USING (client_user_id = auth.uid());

CREATE POLICY "Anyone can create missions" 
ON public.missions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Technicians can update their missions" 
ON public.missions 
FOR UPDATE 
USING (technician_id = auth.uid());

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(user_id),
  receiver_id UUID NOT NULL REFERENCES public.profiles(user_id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view messages they sent or received" 
ON public.messages 
FOR SELECT 
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can create messages they are sending" 
ON public.messages 
FOR INSERT 
WITH CHECK (sender_id = auth.uid());

-- Create trigger for updating missions updated_at
CREATE TRIGGER update_missions_updated_at
BEFORE UPDATE ON public.missions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_missions_technician_id ON public.missions(technician_id);
CREATE INDEX idx_missions_client_user_id ON public.missions(client_user_id);
CREATE INDEX idx_missions_guest_user_id ON public.missions(guest_user_id);
CREATE INDEX idx_missions_status ON public.missions(status);
CREATE INDEX idx_messages_mission_id ON public.messages(mission_id);
CREATE INDEX idx_guest_users_browser_token ON public.guest_users(browser_token);