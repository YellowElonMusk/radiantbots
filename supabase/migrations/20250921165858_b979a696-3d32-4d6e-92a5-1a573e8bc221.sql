-- Database Schema Refactor for Marketplace App
-- This migration will unify the user system and clean up the schema

-- Step 1: Update the user_role enum to include enterprise
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'enterprise';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'technician';

-- Step 2: Create new user_type enum for the unified approach
CREATE TYPE user_type AS ENUM ('technician', 'enterprise');

-- Step 3: Update profiles table structure
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_type user_type;

-- Update existing data: map 'client' role to 'enterprise' user_type
UPDATE profiles 
SET user_type = 'enterprise' 
WHERE role = 'client';

-- Update technician profiles
UPDATE profiles 
SET user_type = 'technician' 
WHERE role IS NULL OR role != 'client';

-- Make user_type required and set default
ALTER TABLE profiles 
ALTER COLUMN user_type SET NOT NULL;

-- Step 4: Add primary key constraint to profiles.id for foreign key references
-- First, update any NULL profile IDs
UPDATE profiles SET id = gen_random_uuid() WHERE id IS NULL;

-- Step 5: Restructure missions table
-- Add new foreign key columns
ALTER TABLE missions 
ADD COLUMN IF NOT EXISTS client_id uuid,
ADD COLUMN IF NOT EXISTS technician_profile_id uuid;

-- Migrate existing data from client_user_id to client_id
UPDATE missions 
SET client_id = client_user_id 
WHERE client_user_id IS NOT NULL;

-- Migrate technician_id to technician_profile_id (if technician_id currently references user_id)
UPDATE missions 
SET technician_profile_id = (
  SELECT id FROM profiles WHERE user_id = missions.technician_id
) WHERE technician_id IS NOT NULL;

-- If technician_id already references profiles.id, copy directly
UPDATE missions 
SET technician_profile_id = technician_id 
WHERE technician_id IS NOT NULL AND technician_profile_id IS NULL;

-- Add foreign key constraints
ALTER TABLE missions 
ADD CONSTRAINT fk_missions_client 
FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE missions 
ADD CONSTRAINT fk_missions_technician 
FOREIGN KEY (technician_profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 6: Restructure messages table
-- Ensure sender_id references profiles.id
-- Update sender_id to reference profile IDs instead of user IDs
UPDATE messages 
SET sender_id = (
  SELECT id FROM profiles WHERE user_id = messages.sender_id
) WHERE sender_id IS NOT NULL;

UPDATE messages 
SET receiver_id = (
  SELECT id FROM profiles WHERE user_id = messages.receiver_id
) WHERE receiver_id IS NOT NULL;

-- Add foreign key constraints for messages
ALTER TABLE messages 
ADD CONSTRAINT fk_messages_sender 
FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT fk_messages_mission 
FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE;

-- Step 7: Clean up old columns
ALTER TABLE missions 
DROP COLUMN IF EXISTS client_user_id,
DROP COLUMN IF EXISTS technician_id;

-- Rename new columns
ALTER TABLE missions 
RENAME COLUMN technician_profile_id TO technician_id;

-- Step 8: Drop redundant tables
DROP TABLE IF EXISTS guest_users CASCADE;

-- Step 9: Update RLS policies

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view complete technician profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create new unified RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view technician profiles" 
ON profiles FOR SELECT 
USING (user_type = 'technician' AND first_name IS NOT NULL AND last_name IS NOT NULL);

CREATE POLICY "Users can create their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Update missions RLS policies
DROP POLICY IF EXISTS "Clients can view their own missions" ON missions;
DROP POLICY IF EXISTS "Technicians can view their assigned missions" ON missions;
DROP POLICY IF EXISTS "Technicians can update their assigned missions" ON missions;
DROP POLICY IF EXISTS "Anyone can create missions" ON missions;

CREATE POLICY "Clients can view their missions" 
ON missions FOR SELECT 
USING (client_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Technicians can view assigned missions" 
ON missions FOR SELECT 
USING (technician_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can create missions" 
ON missions FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Technicians can update assigned missions" 
ON missions FOR UPDATE 
USING (technician_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can update their missions" 
ON missions FOR UPDATE 
USING (client_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Update messages RLS policies
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON messages;
DROP POLICY IF EXISTS "Users can create messages they are sending" ON messages;
DROP POLICY IF EXISTS "Users can mark received messages as read" ON messages;

CREATE POLICY "Users can view mission messages" 
ON messages FOR SELECT 
USING (
  sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) 
  OR 
  mission_id IN (
    SELECT id FROM missions 
    WHERE client_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR technician_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages for their missions" 
ON messages FOR INSERT 
WITH CHECK (
  sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  AND
  mission_id IN (
    SELECT id FROM missions 
    WHERE client_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR technician_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can mark messages as read" 
ON messages FOR UPDATE 
USING (
  mission_id IN (
    SELECT id FROM missions 
    WHERE client_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR technician_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

-- Step 10: Create trigger for automatic messaging unlock after mission acceptance
CREATE OR REPLACE FUNCTION unlock_messaging_on_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- When a mission is accepted, messaging is automatically available
  -- This is handled by the RLS policies above
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mission_acceptance_trigger
  AFTER UPDATE ON missions
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status = 'accepted')
  EXECUTE FUNCTION unlock_messaging_on_acceptance();

-- Step 11: Clean up orphaned records
-- Remove messages without valid mission references
DELETE FROM messages 
WHERE mission_id NOT IN (SELECT id FROM missions);

-- Remove technician_skills for non-existent users
DELETE FROM technician_skills 
WHERE user_id NOT IN (SELECT user_id FROM profiles);

-- Remove technician_brands for non-existent users  
DELETE FROM technician_brands 
WHERE user_id NOT IN (SELECT user_id FROM profiles);

-- Remove availability records for non-existent users
DELETE FROM availability 
WHERE user_id NOT IN (SELECT user_id FROM profiles);

DELETE FROM availability_periods 
WHERE user_id NOT IN (SELECT user_id FROM profiles);