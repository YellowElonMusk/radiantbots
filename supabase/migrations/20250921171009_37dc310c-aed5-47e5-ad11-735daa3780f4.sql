-- Add foreign key constraints that were missing
ALTER TABLE missions 
ADD CONSTRAINT missions_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES profiles(id);

ALTER TABLE missions 
ADD CONSTRAINT missions_technician_id_fkey 
FOREIGN KEY (technician_id) REFERENCES profiles(id);

ALTER TABLE messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES profiles(id);

ALTER TABLE messages 
ADD CONSTRAINT messages_receiver_id_fkey 
FOREIGN KEY (receiver_id) REFERENCES profiles(id);

ALTER TABLE messages 
ADD CONSTRAINT messages_mission_id_fkey 
FOREIGN KEY (mission_id) REFERENCES missions(id);

-- Fix the data integrity issue - the mission booking form is using old column names
-- Update any existing missions that have client_user_id set but not client_id
UPDATE missions 
SET client_id = (
    SELECT id FROM profiles WHERE user_id = missions.client_user_id
)
WHERE client_user_id IS NOT NULL AND client_id IS NULL;

-- Update any existing missions that have technician_id as user_id instead of profile id
UPDATE missions 
SET technician_id = (
    SELECT id FROM profiles WHERE user_id = missions.technician_id
)
WHERE technician_id IN (
    SELECT user_id FROM profiles WHERE user_id = missions.technician_id
);