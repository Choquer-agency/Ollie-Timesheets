-- Fix existing time entries that were created with wrong owner_id
-- 
-- PROBLEM: When employees clocked in/out before the fix, their time entries
-- were saved with owner_id = employee's user_id instead of the business owner's user_id
--
-- SOLUTION: Update all time_entries and breaks to use the correct owner_id
-- based on the employee's owner_id from the employees table

-- Fix time_entries: Set owner_id to match the owner_id of the employee who created it
UPDATE time_entries
SET owner_id = employees.owner_id
FROM employees
WHERE time_entries.employee_id = employees.id
  AND time_entries.owner_id != employees.owner_id;

-- Fix breaks: Set owner_id to match the owner_id from the time_entry's employee
UPDATE breaks
SET owner_id = employees.owner_id
FROM time_entries
JOIN employees ON time_entries.employee_id = employees.id
WHERE breaks.time_entry_id = time_entries.id
  AND breaks.owner_id != employees.owner_id;

-- Verify the fix - this should return the count of entries that were fixed
SELECT 
  COUNT(*) as fixed_entries_count,
  'Time entries fixed' as description
FROM time_entries te
JOIN employees e ON te.employee_id = e.id
WHERE te.owner_id = e.owner_id;

