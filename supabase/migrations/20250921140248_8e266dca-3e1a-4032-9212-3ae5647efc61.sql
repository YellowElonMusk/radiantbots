-- Update RLS policies for missions table to work with the new foreign key structure

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create missions" ON missions;
DROP POLICY IF EXISTS "Clients can view their missions" ON missions;
DROP POLICY IF EXISTS "Technicians can view their missions" ON missions;
DROP POLICY IF EXISTS "Technicians can update their missions" ON missions;

-- Create updated policies that work with profile.id instead of user.id
CREATE POLICY "Anyone can create missions" 
ON missions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Clients can view their own missions" 
ON missions 
FOR SELECT 
USING (
  client_user_id = (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Technicians can view their assigned missions" 
ON missions 
FOR SELECT 
USING (
  technician_id = (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Technicians can update their assigned missions" 
ON missions 
FOR UPDATE 
USING (
  technician_id = (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);