# Changes

## Issues identified
- caching keys were not namespaced, causing shared or incorrect cache reuse.
- cached entries had no TTL, resulting in stale data being returned indefinitely.
- delete/update operations did not invalidate related cache keys, so deleted tasks could still appear.
- invalid or null responses could be cached, causing broken or inconsistent API results.
- caching logic was mixed with business logic instead of being separated into a service layer.
- HTTP status codes were not always correct for create/update/delete actions.

## Improvements implemented
- added a `cacheService` with namespaced keys: `tasks:list` and `task:{id}`.
- all cache entries now use a TTL of 60 seconds.
- `createTask`, `updateTask`, and `deleteTask` invalidate the `tasks:list` cache and the single-task cache when relevant.
- `getTaskById` only caches successful task responses; null results are never cached.
- separated data access and cache behavior into `taskService` and `cacheService`.
- ensured `POST /tasks` returns `201 Created`, `DELETE /tasks/:id` returns `204 No Content`, and invalid requests return `400`.
- fixed async/await usage across services so promises are awaited consistently.

## Result
The backend now returns consistent, reliable task data while still benefiting from caching for repeated reads.
Cache invalidation and TTL prevent stale data from being served after task updates or deletions.
