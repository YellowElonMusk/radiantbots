-- Enable real-time for missions table
ALTER TABLE public.missions REPLICA IDENTITY FULL;

-- Add missions table to realtime publication (if not already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.missions;