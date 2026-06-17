# 🎓 CampusMarket — Student Buy/Sell Marketplace

A full-stack MERN app for buying and selling books, notes, and items within a college campus.

---

## ⚡ Quick Start (2 minutes)

### 1. Install dependencies

```bash
# Root (installs concurrently)
npm install

# Server
cd server && npm install && cd ..

# Client
cd client && npm install && cd ..
```

### 2. Run both servers

```bash
npm run dev
```

- **Frontend** → http://localhost:3000  
- **Backend API** → http://localhost:5000

> **No MongoDB?** No problem! The server automatically falls back to in-memory data with 6 pre-seeded listings so you can demo instantly.

---

## 🗂 Project Structure

```
campus-market/
├── server/
│   ├── server.js          # Express API + Mongoose models
│   └── uploads/           # Uploaded images (auto-created)
└── client/
    └── src/
        └── App.jsx        # All React components (single-file, clean)
```

---

## ✨ Features

| Feature | Details |
|---|---|
| 📋 **Product Listings** | Title, description, category, condition, price, image |
| 🔍 **Search & Filter** | Live search + category pills + max price filter |
| 💬 **Buyer-Seller Chat** | Floating chat panel, auto-polls every 3 seconds |
| 📷 **Image Upload** | Upload photos via Multer, falls back to emoji |
| 🚀 **Post a Listing** | Full sell form with image preview |
| 💾 **MongoDB + Fallback** | Uses MongoDB when available, in-memory store otherwise |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/listings` | List all (supports `?search=`, `?category=`, `?maxPrice=`) |
| GET | `/api/listings/:id` | Single listing |
| POST | `/api/listings` | Create listing (multipart/form-data) |
| PATCH | `/api/listings/:id/sold` | Mark as sold |
| DELETE | `/api/listings/:id` | Delete listing |
| GET | `/api/messages/:listingId` | Get chat messages |
| POST | `/api/messages` | Send a message |

---

## 🛠 Tech Stack

- **MongoDB** — Database (with Mongoose ODM)
- **Express.js** — REST API + Multer for file uploads
- **React** — SPA with hooks, no external UI library
- **Node.js** — Server runtime

---

## 🎯 Demo Tips

1. Open two browser tabs, sign in as different users
2. One user posts a listing, the other chats with the seller
3. Show the search + category filter working live
4. Show the image upload in the Sell form
