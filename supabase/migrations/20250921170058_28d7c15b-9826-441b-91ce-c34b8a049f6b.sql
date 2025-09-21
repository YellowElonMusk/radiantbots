-- Database Schema Refactor for Marketplace App - FIXED VERSION
-- This migration will unify the user system and clean up the schema safely

-- Step 1: Create new user_type enum
CREATE TYPE user_type AS ENUM ('technician', 'enterprise');

-- Step 2: Add user_type column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_type user_type;

-- Step 3: Update existing data safely
UPDATE profiles 
SET user_type = 'enterprise' 
WHERE role = 'client';

UPDATE profiles 
SET user_type = 'technician' 
WHERE role IS NULL OR role != 'client';

-- Make user_type required
ALTER TABLE profiles 
ALTER COLUMN user_type SET NOT NULL;

-- Step 4: Clean up messages table first (remove invalid references)
-- Delete messages where sender_id doesn't exist in profiles
DELETE FROM messages 
WHERE sender_id NOT IN (SELECT user_id FROM profiles);

-- Delete messages where receiver_id doesn't exist in profiles  
DELETE FROM messages 
WHERE receiver_id NOT IN (SELECT user_id FROM profiles);

-- Step 5: Update messages to use profile IDs instead of user IDs
-- Create temporary columns
ALTER TABLE messages 
ADD COLUMN sender_profile_id uuid;

ALTER TABLE messages 
ADD COLUMN receiver_profile_id uuid;

-- Migrate sender_id from user_id to profile.id
UPDATE messages 
SET sender_profile_id = (
  SELECT id FROM profiles WHERE user_id = messages.sender_id
);

-- Migrate receiver_id from user_id to profile.id
UPDATE messages 
SET receiver_profile_id = (
  SELECT id FROM profiles WHERE user_id = messages.receiver_id
);

-- Remove messages that couldn't be migrated
DELETE FROM messages 
WHERE sender_profile_id IS NULL OR receiver_profile_id IS NULL;

-- Drop old columns
ALTER TABLE messages DROP COLUMN sender_id;
ALTER TABLE messages DROP COLUMN receiver_id;

-- Rename new columns
ALTER TABLE messages RENAME COLUMN sender_profile_id TO sender_id;
ALTER TABLE messages RENAME COLUMN receiver_profile_id TO receiver_id;

-- Step 6: Restructure missions table
-- Add new foreign key columns
ALTER TABLE missions 
ADD COLUMN IF NOT EXISTS client_id uuid;

ALTER TABLE missions 
ADD COLUMN IF NOT EXISTS technician_profile_id uuid;

-- Migrate existing data from client_user_id to client_id (profile id)
UPDATE missions 
SET client_id = (
  SELECT id FROM profiles WHERE user_id = missions.client_user_id
) WHERE client_user_id IS NOT NULL;

-- Migrate technician_id to profile id
UPDATE missions 
SET technician_profile_id = (
  SELECT id FROM profiles WHERE user_id = missions.technician_id
) WHERE technician_id IS NOT NULL;

-- Remove missions that couldn't be migrated
DELETE FROM missions 
WHERE (client_user_id IS NOT NULL AND client_id IS NULL)
OR (technician_id IS NOT NULL AND technician_profile_id IS NULL);

-- Drop old columns
ALTER TABLE missions DROP COLUMN IF EXISTS client_user_id;
ALTER TABLE missions DROP COLUMN technician_id;

-- Rename new column
ALTER TABLE missions RENAME COLUMN technician_profile_id TO technician_id;

-- Step 7: Add foreign key constraints
ALTER TABLE missions 
ADD CONSTRAINT fk_missions_client 
FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE missions 
ADD CONSTRAINT fk_missions_technician 
FOREIGN KEY (technician_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT fk_messages_sender 
FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT fk_messages_mission 
FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE;

-- Step 8: Update RLS policies
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

-- Step 9: Clean up orphaned records
DELETE FROM technician_skills 
WHERE user_id NOT IN (SELECT user_id FROM profiles);

DELETE FROM technician_brands 
WHERE user_id NOT IN (SELECT user_id FROM profiles);

DELETE FROM availability 
WHERE user_id NOT IN (SELECT user_id FROM profiles);

DELETE FROM availability_periods 
WHERE user_id NOT IN (SELECT user_id FROM profiles);