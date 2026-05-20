# SideHustle Leaky Cache Fix

This project is a fixed implementation of the `SideHustle-Leaky-Cache` backend challenge.

## What was fixed
- Added a cache service with TTL and namespaced cache keys.
- Added cache invalidation for create/update/delete operations.
- Prevented caching of null or missing responses.
- Refactored caching logic into a dedicated service layer.
- Ensured correct HTTP status codes and input validation.

## Run the app

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. API endpoints:
- `GET /tasks`
- `GET /tasks/:id`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`
