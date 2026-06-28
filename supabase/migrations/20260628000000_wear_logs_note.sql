-- Add note column to wear_logs for journaling
ALTER TABLE wear_logs ADD COLUMN IF NOT EXISTS note TEXT;
