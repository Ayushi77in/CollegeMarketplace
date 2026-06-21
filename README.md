# 📚 CampusMarket

> A full-stack MERN marketplace application designed exclusively for college campuses, enabling students to buy and sell books, notes, electronics, and other essentials within their campus community.

Built with a focus on **simplicity, portability, and resilience**, CampusMarket continues to function even without MongoDB by automatically switching to an in-memory datastore.

---

## 🚀 Key Highlights

* 🏫 Student-to-student marketplace for college campuses
* ⚛️ Full-stack MERN application with RESTful APIs
* 📷 Image upload support with preview functionality
* 💬 Built-in buyer–seller chat system
* 🔄 Automatic MongoDB → In-Memory fallback
* 🔍 Server-side search and filtering
* 🚀 Fully demoable without any database setup

---

## 🏗️ System Architecture

```text
                ┌──────────────────────┐
                │     React Client     │
                │      (Frontend)      │
                └──────────┬───────────┘
                           │ HTTP Requests
                           ▼
                ┌──────────────────────┐
                │    Express Server    │
                │      REST APIs       │
                └──────────┬───────────┘
                           │
          ┌────────────────┴──────────────┐
          │                               │
          ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│    MongoDB       │          │ In-Memory Store │
│  (Production)    │          │   (Fallback)    │
└──────────────────┘          └──────────────────┘
```

---

## ✨ Features

### 📦 Marketplace Listings

Students can create listings with:

* Title
* Description
* Price
* Category
* Item condition
* Product image
* Seller information

Supported categories:

* Books
* Notes
* Electronics
* Clothes
* Stationery
* Other

---

### 🔍 Search & Filtering

Users can filter listings using:

* Live keyword search
* Category filters
* Maximum price filter
* Minimum price filter

Filtering is performed on the server side to keep the frontend lightweight and scalable.

---

### 💬 Buyer-Seller Chat

A lightweight chat system allows buyers to directly communicate with sellers.

Features include:

* Floating chat interface
* Automatic polling every 3 seconds
* Conversation history
* Auto-scroll to latest messages

---

### 📷 Image Upload

Listings support image uploads using **Multer**.

* Local image storage
* Automatic uploads directory creation
* Image preview before submission
* 5MB upload limit

---

## 🛡️ Fault-Tolerant Data Layer

One of the key engineering decisions in this project is the dual datastore architecture.

On startup, the server attempts to connect to MongoDB:

```javascript
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(() => console.warn("⚠️ Running with in-memory store"));
```

If MongoDB is unavailable:

* The application automatically switches to an in-memory datastore.
* Pre-seeded sample listings are loaded.
* All features continue to work without additional setup.

This makes the project extremely easy to demonstrate during interviews.

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>

cd campus-market
```

### 2. Install Dependencies

#### Root

```bash
npm install
```

#### Backend

```bash
cd server
npm install
cd ..
```

#### Frontend

```bash
cd client
npm install
cd ..
```

### 3. Configure Environment Variables

Create a `.env` file inside the `/server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

> If MongoDB is not configured, the application automatically runs using the in-memory datastore.

### 4. Run the Application

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:5000
```

---

## 📁 Project Structure

```text
campus-market/
│
├── server/
│   ├── server.js          # Complete Express backend
│   ├── .env               # Environment variables
│   ├── uploads/           # Uploaded images
│   └── package.json
│
└── client/
    └── src/
        └── App.jsx        # Complete React frontend
```

---

## 🔧 Backend Overview

### Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* Multer
* CORS

### Database Models

#### Listing Schema

```javascript
{
  title,
  description,
  price,
  category,
  condition,
  imageUrl,
  sellerName,
  sellerEmail,
  college,
  sold
}
```

#### Message Schema

```javascript
{
  listingId,
  senderName,
  receiverName,
  text
}
```

---

## 🔌 REST API Endpoints

### Listings

| Method | Endpoint                 | Description                   |
| ------ | ------------------------ | ----------------------------- |
| GET    | `/api/listings`          | Get all listings with filters |
| GET    | `/api/listings/:id`      | Get a single listing          |
| POST   | `/api/listings`          | Create a new listing          |
| PATCH  | `/api/listings/:id/sold` | Mark listing as sold          |
| DELETE | `/api/listings/:id`      | Delete a listing              |

### Messaging

| Method | Endpoint                   | Description         |
| ------ | -------------------------- | ------------------- |
| GET    | `/api/messages/:listingId` | Fetch chat messages |
| POST   | `/api/messages`            | Send a message      |

---

## 🎨 Frontend Overview

The frontend is intentionally built as a **single-file React application** to keep the project simple, portable, and easy to understand.

### Component Structure

```text
App
├── Navbar
├── ListingsView
│   ├── SearchBar
│   ├── CategoryFilters
│   ├── ListingCard
│   └── ListingModal
│
├── SellForm
└── ChatPanel
```

---

## 🎯 Key Design Decisions

### 1. Dual Data Layer

The application dynamically switches between MongoDB and in-memory storage.

**Benefit:** Zero setup demo experience.

---

### 2. Server-Side Filtering

Search and filter operations are performed on the backend.

**Benefit:** Better scalability and reduced frontend complexity.

---

### 3. Polling-Based Chat

Instead of WebSockets, chat uses lightweight polling.

```javascript
setInterval(fetchMessages, 3000);
```

**Benefit:** Simpler implementation while still providing near real-time communication.

---

### 4. Soft Delete Pattern

Listings are marked as sold rather than immediately removed.

```javascript
sold: true
```

**Benefit:** Preserves listing history.

---

## 🧪 Demo Scenarios

### Browse Marketplace

* Search for products
* Apply category filters
* View item details

### Sell an Item

* Upload product image
* Add details
* Publish listing

### Buyer-Seller Interaction

* Open two browser windows
* Sign in as different users
* Initiate chat between buyer and seller

---

## 🛠️ Tech Stack

| Layer            | Technologies       |
| ---------------- | ------------------ |
| Frontend         | React, Axios       |
| Backend          | Node.js, Express   |
| Database         | MongoDB, Mongoose  |
| File Uploads     | Multer             |
| Styling          | CSS, Inline Styles |
| State Management | React Hooks        |

---

## 🔮 Future Improvements

* JWT Authentication
* User Profiles
* Wishlist & Saved Listings
* WebSocket-based Real-Time Chat
* Notifications
* Pagination & Infinite Scroll
* Cloud Image Storage (Cloudinary / AWS S3)
* Payment Integration

---

## 🌟 Why This Project?

CampusMarket demonstrates:

* Full-stack development skills
* REST API design
* Database modelling
* File upload handling
* Fault-tolerant architecture
* Client-server communication
* React state management
* Real-world product thinking

This project was built as a prototype for creating a trusted marketplace ecosystem within college campuses.
