-- Migration: Add pending_approval column to time_entries table
-- This column is used to mark vacation requests that are awaiting admin approval

-- Add the column with default value false
ALTER TABLE time_entries 
ADD COLUMN IF NOT EXISTS pending_approval BOOLEAN DEFAULT FALSE;

-- Add index for faster queries on pending requests
CREATE INDEX IF NOT EXISTS idx_time_entries_pending_approval 
ON time_entries(pending_approval) 
WHERE pending_approval = TRUE;

-- Update RLS policies to ensure employees can view their own pending requests
-- (This may already be covered by existing policies, but we're being explicit)
