-- Add enterprise and freelance roles to the user_role enum
ALTER TYPE user_role ADD VALUE 'enterprise';
ALTER TYPE user_role ADD VALUE 'freelance';