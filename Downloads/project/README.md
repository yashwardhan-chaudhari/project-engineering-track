# Creator's Platform — Full CRUD App

A full-stack MERN application with complete Create, Read, Update, and Delete functionality including JWT authentication and ownership-based authorization.

## Tech Stack
- **Frontend:** React (Vite) + React Router
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (JSON Web Tokens)

---

## Project Structure

```
project/
├── server/          # Express backend
│   ├── controllers/ # Route handlers (auth, posts)
│   ├── middleware/  # JWT auth middleware
│   ├── models/      # Mongoose schemas (User, Post)
│   ├── routes/      # API routes
│   ├── .env         # Environment variables
│   └── index.js     # Server entry point
│
└── client/          # React frontend (Vite)
    └── src/
        ├── context/ # AuthContext (global auth state)
        ├── pages/   # Home, Login, Register, Dashboard, CreatePost, EditPost
        └── components/ # Navbar
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally OR a MongoDB Atlas connection string

---

### 1. Setup the Backend

```bash
cd server
npm install
```

Edit `.env` and update your MongoDB URI and JWT secret:

```env
MONGO_URI=mongodb://localhost:27017/crud-app
JWT_SECRET=your_super_secret_key_change_this
PORT=5000
```

Start the server:

```bash
npm run dev
```

Server runs on **http://localhost:5000**

---

### 2. Setup the Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

The Vite proxy is configured to forward `/api` requests to `localhost:5000` automatically.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |

### Posts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/posts | Public | Get all posts (paginated) |
| GET | /api/posts/my | Required | Get logged-in user's posts |
| GET | /api/posts/:id | Required | Get post by ID (owner only) |
| POST | /api/posts | Required | Create new post |
| PUT | /api/posts/:id | Required | Update post (owner only) |
| DELETE | /api/posts/:id | Required | Delete post (owner only) |

---

## Features

- ✅ Register & Login with JWT
- ✅ Public post feed with pagination
- ✅ Dashboard showing only your posts
- ✅ Create new posts
- ✅ Edit your posts (pre-filled form)
- ✅ Delete your posts (confirmation dialog)
- ✅ Optimistic UI updates on delete
- ✅ Ownership authorization — 403 if you try to edit/delete someone else's post
- ✅ Proper error handling throughout
