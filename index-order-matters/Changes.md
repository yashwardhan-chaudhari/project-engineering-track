# Index Order Investigation and Optimization

## 1. What the Original Index Did
The original index was created using the following definition:
```sql
CREATE INDEX idx_salary_department ON employees(salary, department);
```
This index sorted the `employees` records first by `salary`, and then by `department`. When a query executed looking for a specific `department` first and a range of `salary` values, the database could not efficiently jump to the correct starting point in the index because the primary sorting key was `salary`, which the query used as a broad range rather than a specific equality match.

## 2. Why the Incorrect Index Was Ineffective
Our analytics query was:
```sql
SELECT *
FROM employees
WHERE department = 'Sales'
AND salary > 50000;
```
Because the existing index was `INDEX(salary, department)`, the query planner noticed that `department = 'Sales'` (an exact match) could not be utilized at the root of the B-Tree index. The database would have had to scan the entire index (since salaries could be anything and are scattered everywhere) to find the 'Sales' department entries. The query planner correctly decided that performing a **Sequential Scan** on the table would be faster than doing a full index scan. Thus, the index was ignored.

## 3. The Left-Most Prefix Rule
The **Left-Most Prefix Rule** dictates that a composite (multi-column) index can only be efficiently used if the columns in the query's `WHERE` clause match the index columns starting from the **leftmost** column. 

If an index is `(A, B, C)`, it can optimize queries filtering on:
- `A`
- `A` and `B`
- `A`, `B`, and `C`

It **cannot** efficiently optimize queries filtering only on `B`, or `B` and `C`, because the data is primarily sorted by `A`. 
In our case, the query primarily filtered by an exact match on `department`, but the leftmost column of the index was `salary`. Since `salary` was used as a range (`> 50000`), the database couldn't establish a single contiguous block of index entries to scan for `department = 'Sales'`.

## 4. How the Corrected Index Improved Performance
To align with the Left-Most Prefix Rule and the specific query pattern, we dropped the incorrect index and created a new one:
```sql
DROP INDEX idx_salary_department;
CREATE INDEX idx_department_salary ON employees(department, salary);
```
With `INDEX(department, salary)`, the database first searches the index for the exact match `department = 'Sales'`. Because the records for 'Sales' are grouped together in the index, the database can instantly jump to that section. Once there, the secondary sort on `salary` allows the database to quickly scan only the records where `salary > 50000`.

When we ran `EXPLAIN ANALYZE` after this fix, the query plan shifted from a **Sequential Scan** to an **Index Scan** (or **Bitmap Index Scan**), drastically reducing the query execution time, especially as data scales.
