# Dev Confessions API

A simple Node.js Express API that lets developers anonymously post confessions.

## Setup

```bash
npm install
npm start
```

The server runs on `http://localhost:3000`

## Endpoints

- `GET /confessions` - Get all confessions
- `POST /confessions` - Create a new confession
- `GET /confessions/:id` - Get confession by ID
- `PUT /confessions/:id/upvote` - Upvote a confession
- `DELETE /confessions/:id` - Delete a confession
- `GET /trending` - Get trending topics
- `GET /stats/:userId` - Get user stats
- `GET /recommendations` - Get recommendations
- `POST /webhook` - Webhook endpoint

## Database

MongoDB running on `mongodb://localhost:27017/confessions`
