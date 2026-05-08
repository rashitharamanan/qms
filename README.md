# QueueMS — Queue Management System

A full-stack MERN production-ready Queue Management System with real-time updates via Socket.io.

## 🏗️ Architecture

```
QueueMS
├── backend/          # Node.js + Express REST API
│   ├── config/       # Database connection
│   ├── controllers/  # Business logic
│   ├── middleware/   # Auth & error handlers
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API route definitions
│   ├── services/     # Seed data & utilities
│   └── server.js     # Entry point + Socket.io
└── frontend/         # React + Vite + Tailwind
    └── src/
        ├── components/ # Reusable UI components
        ├── context/    # Auth & Socket contexts
        ├── layouts/    # Page layout wrappers
        ├── pages/      # Route-level components
        ├── services/   # Axios API client
        └── utils/      # Helper functions
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Default Credentials
- **Admin**: admin@qms.com / admin123
- Register as Vendor or Customer to test other roles

## 🔑 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/qms
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Customer
- `GET /api/categories` — List categories
- `GET /api/shops` — List approved shops
- `GET /api/shops/:id` — Shop details
- `GET /api/shops/:shopId/services` — Shop services
- `POST /api/queue/join` — Join queue
- `GET /api/queue/my-tokens` — My tokens today
- `PUT /api/queue/:id/cancel` — Cancel token

### Vendor (Protected)
- `POST /api/vendor/shop` — Create shop
- `GET /api/vendor/shop` — Get my shop
- `PUT /api/vendor/shop` — Update shop
- `PUT /api/vendor/shop/toggle` — Open/close shop
- `GET /api/vendor/dashboard` — Dashboard stats
- `GET /api/vendor/queue` — Today's queue
- `PUT /api/vendor/queue/call-next` — Call next token
- `PUT /api/vendor/queue/skip` — Skip token
- `PUT /api/vendor/queue/complete` — Complete token
- CRUD `/api/vendor/services` — Manage services

### Admin (Protected)
- `GET /api/admin/dashboard` — System stats
- `GET /api/admin/shops` — All shops
- `PUT /api/admin/shops/:id/approve` — Approve shop
- CRUD `/api/admin/categories` — Manage categories
- `GET /api/admin/users` — All users

## 🔴 Real-time Events (Socket.io)

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-shop` | Client→Server | Subscribe to shop updates |
| `new-token` | Server→Client | New customer joined queue |
| `token-called` | Server→Client | Token was called |
| `token-completed` | Server→Client | Token completed |
| `token-skipped` | Server→Client | Token was skipped |
| `token-cancelled` | Server→Client | Customer cancelled |
| `shop-status-changed` | Server→Client | Shop opened/closed |

## 🚢 Production Deployment

### Backend (Railway / Render / EC2)
```bash
npm install --production
NODE_ENV=production node server.js
```

### Frontend (Vercel / Netlify)
```bash
npm run build
# Deploy dist/ folder
# Set VITE_API_URL env var if backend is on different domain
```

### MongoDB Atlas
1. Create free cluster at mongodb.com/atlas
2. Get connection string
3. Set as MONGODB_URI in backend .env

## 👥 Roles

| Role | Access |
|------|--------|
| **Customer** | Browse shops, join queues, view tokens |
| **Vendor** | Manage shop, services, queue operations |
| **Admin** | Approve shops, manage categories & users |
