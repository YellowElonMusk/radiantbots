-- Drop existing foreign key constraint if it exists
ALTER TABLE missions DROP CONSTRAINT IF EXISTS missions_client_user_id_fkey;

-- Update the missions to use profile.id instead of user.id
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

-- Add back the foreign key constraint pointing to profiles.id
ALTER TABLE missions 
ADD CONSTRAINT missions_client_user_id_fkey 
FOREIGN KEY (client_user_id) REFERENCES profiles(id) ON DELETE SET NULL;