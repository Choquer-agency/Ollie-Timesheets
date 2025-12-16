-- Add company logo URL to settings table
-- Run this in your Supabase SQL Editor

ALTER TABLE settings ADD COLUMN IF NOT EXISTS company_logo_url TEXT;

COMMENT ON COLUMN settings.company_logo_url IS 'URL to the company logo stored in Supabase Storage, used in email templates';

