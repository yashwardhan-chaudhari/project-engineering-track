-- 1. Run EXPLAIN ANALYZE on the slow query (with the broken index)
EXPLAIN ANALYZE
SELECT *
FROM employees
WHERE department = 'Sales'
AND salary > 50000;

-- 2. Observe the Sequential Scan in the output.
-- Now, fix the index by dropping the incorrect one.
DROP INDEX IF EXISTS idx_salary_department;

-- 3. Create the corrected index matching the query's filter pattern.
-- We put the exact match column (`department`) first, followed by the range column (`salary`).
CREATE INDEX idx_department_salary ON employees(department, salary);

-- 4. Run EXPLAIN ANALYZE again on the same query
EXPLAIN ANALYZE
SELECT *
FROM employees
WHERE department = 'Sales'
AND salary > 50000;

-- 5. Observe the Index Scan or Bitmap Heap Scan in the output, demonstrating the improvement.
