-- Update missions table to use profile.id instead of profile.user_id for client_user_id
-- This ensures proper foreign key relationships with the profiles table

-- First, let's create a temporary function to update existing missions
CREATE OR REPLACE FUNCTION update_missions_client_user_id() RETURNS void AS $$
DECLARE
    mission_record RECORD;
    profile_id UUID;
BEGIN
    -- Loop through all missions with non-null client_user_id
    FOR mission_record IN 
        SELECT id, client_user_id 
        FROM missions 
        WHERE client_user_id IS NOT NULL
    LOOP
        -- Find the corresponding profile.id for this user_id
        SELECT profiles.id INTO profile_id
        FROM profiles 
        WHERE profiles.user_id = mission_record.client_user_id;
        
        -- Update the mission if we found a matching profile
        IF profile_id IS NOT NULL THEN
            UPDATE missions 
            SET client_user_id = profile_id
            WHERE id = mission_record.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to update existing data
SELECT update_missions_client_user_id();

-- Drop the temporary function
DROP FUNCTION update_missions_client_user_id();