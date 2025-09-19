-- Create a new table for availability periods
CREATE TABLE public.availability_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  selected_weekdays TEXT[] NOT NULL,
  weekend_excluded BOOLEAN NOT NULL DEFAULT true,
  count_weekdays INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.availability_periods ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own availability periods" 
ON public.availability_periods 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own availability periods" 
ON public.availability_periods 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own availability periods" 
ON public.availability_periods 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own availability periods" 
ON public.availability_periods 
FOR DELETE 
USING (auth.uid() = user_id);

-- Public can view availability periods for catalog search
CREATE POLICY "Public can view availability periods for catalog search" 
ON public.availability_periods 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_availability_periods_updated_at
BEFORE UPDATE ON public.availability_periods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();