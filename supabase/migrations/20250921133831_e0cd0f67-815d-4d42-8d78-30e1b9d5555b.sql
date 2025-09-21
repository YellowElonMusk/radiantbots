-- Fix the client_user_id to reference profiles.id instead of auth.users.id
-- Update existing missions to use the correct profile.id

UPDATE missions 
SET client_user_id = (
    SELECT p.id 
    FROM profiles p 
    WHERE p.user_id = missions.client_user_id
)
WHERE client_user_id IS NOT NULL
AND EXISTS (
    SELECT 1 
    FROM profiles p 
    WHERE p.user_id = missions.client_user_id
);

-- Add foreign key constraints for better data integrity
ALTER TABLE missions 
ADD CONSTRAINT missions_client_user_id_fkey 
FOREIGN KEY (client_user_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE missions 
ADD CONSTRAINT missions_technician_id_fkey 
FOREIGN KEY (technician_id) REFERENCES profiles(user_id) ON DELETE CASCADE;