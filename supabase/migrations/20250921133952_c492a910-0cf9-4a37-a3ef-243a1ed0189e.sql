-- Just update the missions to use profile.id instead of user.id, without adding constraints yet
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