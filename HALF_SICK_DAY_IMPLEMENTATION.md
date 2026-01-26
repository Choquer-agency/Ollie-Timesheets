# Half-Day Sick Leave Feature - Implementation Summary

## Overview
Successfully implemented a half-day sick leave feature that allows employees to mark partial sick days (counted as 0.5 days), preserves worked hours, and enforces a configurable time cutoff.

## What Was Implemented

### 1. Database Schema Changes
**File:** `add-half-sick-day-columns.sql`
- Added `is_half_sick_day` boolean column to `time_entries` table
- Added `half_day_sick_cutoff_time` text column to `settings` table (default: '12:00')

**To apply these changes, run:**
```bash
# Connect to your Supabase database and execute:
psql <your-database-url> < add-half-sick-day-columns.sql
```

### 2. TypeScript Type Definitions
**Files:** `types.ts`, `supabaseClient.ts`
- Added `isHalfSickDay?: boolean` to `TimeEntry` interface
- Added `halfDaySickCutoffTime?: string` to `AppSettings` interface
- Added `HALF_SICK_DAY` to `IssueType` union type
- Updated database type definitions for Supabase client

### 3. Utility Functions
**File:** `utils.ts`
- `isBeforeCutoffTime(cutoffTime: string): boolean` - Checks if current time is before the cutoff
- `canMarkHalfSickDay(cutoffTime?: string): boolean` - Wrapper function for UI state
- Updated `calculateStats()` to handle half-sick days (preserves worked hours unlike full sick days)
- Updated CSV export to show "Half Sick" status

### 4. Data Store (SupabaseStore.tsx)
- Maps `is_half_sick_day` from database to frontend state
- Maps `half_day_sick_cutoff_time` from settings (defaults to '12:00')
- Updated `updateEntry()` to save `isHalfSickDay` field to database
- Updated `updateSettings()` to save cutoff time configuration

### 5. Employee Dashboard (App.tsx)
**Employee Features:**
- Added "Half Sick" button alongside "Sick Day" and "Vacation" buttons
- Button is disabled (grayed out) if current time is past the cutoff
- Shows "Past cutoff" message when disabled
- Preserves any existing clock-in/out times and breaks when marking half-sick
- Updated status display to show "Half Sick Day" badge (amber color)
- Updated history view to display half-sick entries with amber badge
- Half-sick days don't block employees from viewing their dashboard

**UI Changes:**
- Changed toggle grid from 2 columns to 3 columns to accommodate half-sick button
- Adjusted button sizing for better mobile display
- Added amber color theme for half-sick (differentiates from full sick in rose)

### 6. Admin Dashboard (App.tsx)
**Display Updates:**
- Period summaries now count half-sick days as 0.5 (not 1.0)
- Half-sick days show both worked hours AND sick status together
- Added "Half Sick" badge display in daily view
- Time range shows actual clock times for half-sick entries (if they worked)
- Preserves worked hours in payroll calculations for half-sick days

**Calculation Logic:**
```javascript
if (entry.isHalfSickDay) {
   sickDays += 0.5; // Half sick day counts as 0.5
   totalMinutes += stats.totalWorkedMinutes; // Preserves worked hours
   if (stats.totalWorkedMinutes > 0) daysWorked++;
}
```

### 7. Time Card Modal (TimeCardModal.tsx)
**Admin/Employee Edit Features:**
- Added "Half Sick" toggle alongside "Sick Day" and "Vacation" toggles
- Mutually exclusive: can only be one of (sick, half-sick, vacation, or regular)
- Shows "0.5 sick day" label for clarity
- Displays "Half Sick Day" in entry status when viewing
- Admin can manually mark any entry as half-sick (no cutoff restriction)

### 8. Settings Configuration (App.tsx)
**Admin Settings:**
- Added time input field in Config section: "Half-Day Sick Leave Cutoff Time"
- Default value: 12:00 (noon)
- Helper text explains: "Employees can only mark half-day sick leave before this time"
- Saves to database when admin clicks "Save Configuration"

## Business Rules Implemented

1. **Half-day sick leave counts as 0.5 days** in all reports and statistics
2. **Worked hours are preserved** - both clockIn/clockOut and isHalfSickDay can be true simultaneously
3. **Time cutoff is enforced for employees** - cannot mark half-sick after the cutoff (default 12:00 PM)
4. **Admin override allowed** - admins can mark any entry as half-sick regardless of time
5. **Mutually exclusive** - cannot be both full sick and half sick simultaneously
6. **No blocking** - half-sick days don't prevent employees from accessing their dashboard

## Visual Indicators

- **Full Sick Day**: Rose/red color (🤒)
- **Half Sick Day**: Amber/orange color (🤧)
- **Vacation**: Sky blue color (✈️)

## Testing Checklist

Before deploying, verify:
- [ ] Database migration has been run
- [ ] Employee can mark half-sick before cutoff time
- [ ] Employee cannot mark half-sick after cutoff time (button disabled)
- [ ] Worked hours are preserved when marking half-sick
- [ ] Half-sick counts as 0.5 in period reports (not 1.0)
- [ ] Admin can configure cutoff time in settings
- [ ] Admin can manually mark entries as half-sick in time card modal
- [ ] Time card modal displays both worked time and half-sick status
- [ ] Cannot be both full sick and half sick simultaneously
- [ ] Period summary calculations show decimals correctly (e.g., "2.5 sick days")

## Database Migration Required

**IMPORTANT:** Before using this feature, you must run the SQL migration:

```sql
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS is_half_sick_day BOOLEAN DEFAULT FALSE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS half_day_sick_cutoff_time TEXT DEFAULT '12:00';
```

This can be done via Supabase SQL Editor or by running the `add-half-sick-day-columns.sql` file.

## Files Modified

1. `add-half-sick-day-columns.sql` - New migration file
2. `types.ts` - Type definitions
3. `supabaseClient.ts` - Database type definitions
4. `utils.ts` - Helper functions and calculations
5. `SupabaseStore.tsx` - Data loading and persistence
6. `App.tsx` - Employee and Admin UI
7. `components/TimeCardModal.tsx` - Time card editing modal

## Configuration

Admins can configure the cutoff time:
1. Navigate to Settings (gear icon)
2. Click on "Config" tab
3. Set "Half-Day Sick Leave Cutoff Time" (format: HH:MM)
4. Click "Save Configuration"

Default cutoff: 12:00 PM (noon)

## Notes

- Half-sick days are designed for employees who come in briefly then leave sick
- The cutoff prevents abuse (e.g., marking half-sick at end of day)
- Worked hours are always preserved, making it a hybrid entry type
- Reports accurately reflect 0.5 sick days for accounting purposes
