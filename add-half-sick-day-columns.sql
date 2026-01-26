-- Add half-day sick leave support to time entries
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS is_half_sick_day BOOLEAN DEFAULT FALSE;

-- Add configurable cutoff time to settings
ALTER TABLE settings ADD COLUMN IF NOT EXISTS half_day_sick_cutoff_time TEXT DEFAULT '12:00';

-- Add comment for documentation
COMMENT ON COLUMN time_entries.is_half_sick_day IS 'Indicates if this entry is a half-day sick leave (counts as 0.5 days)';
COMMENT ON COLUMN settings.half_day_sick_cutoff_time IS 'Time cutoff for employees to mark half-day sick leave (format: HH:MM, e.g., 12:00)';
