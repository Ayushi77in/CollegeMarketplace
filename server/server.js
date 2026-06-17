const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/campus-market";

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// ─── Multer (image upload) ────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.warn("⚠️  MongoDB not connected — running with in-memory store:", err.message);
  });

// ─── Schemas & Models ─────────────────────────────────────────────────────────

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: {
      type: String,
      enum: ["Books", "Notes", "Electronics", "Clothes", "Stationery", "Other"],
      default: "Other",
    },
    condition: { type: String, enum: ["New", "Like New", "Good", "Fair"], default: "Good" },
    imageUrl: String,
    sellerName: { type: String, required: true },
    sellerEmail: { type: String, required: true },
    college: { type: String, default: "Campus University" },
    sold: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    senderName: { type: String, required: true },
    receiverName: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const Listing = mongoose.model("Listing", listingSchema);
const Message = mongoose.model("Message", messageSchema);

// ─── In-Memory Fallback (when MongoDB is unavailable) ─────────────────────────
let memListings = [
  {
    _id: "1",
    title: "Engineering Mathematics Vol. 2",
    description: "Slightly used, all pages intact. Great for 2nd year students.",
    price: 180,
    category: "Books",
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
    sellerName: "Rahul Sharma",
    sellerEmail: "rahul@college.edu",
    college: "COEP Tech",
    sold: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    title: "MacBook Charger 60W",
    description: "Original Apple charger, works perfectly.",
    price: 900,
    category: "Electronics",
    condition: "Like New",
    imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400",
    sellerName: "Priya Desai",
    sellerEmail: "priya@college.edu",
    college: "COEP Tech",
    sold: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "3",
    title: "DSA Complete Notes (Handwritten)",
    description: "Complete Data Structures notes — trees, graphs, DP. Very clean.",
    price: 120,
    category: "Notes",
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400",
    sellerName: "Amit Kulkarni",
    sellerEmail: "amit@college.edu",
    college: "COEP Tech",
    sold: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "4",
    title: "Physics H.C. Verma Part 1 & 2",
    description: "Classic reference books. Some highlighting but still very useful.",
    price: 250,
    category: "Books",
    condition: "Fair",
    imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
    sellerName: "Sneha Joshi",
    sellerEmail: "sneha@college.edu",
    college: "COEP Tech",
    sold: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "5",
    title: "Scientific Calculator Casio FX-991EX",
    description: "Works perfectly. Selling because I graduated.",
    price: 600,
    category: "Electronics",
    condition: "Like New",
    imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400",
    sellerName: "Karan Mehta",
    sellerEmail: "karan@college.edu",
    college: "COEP Tech",
    sold: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "6",
    title: "Lab Coat (M size)",
    description: "Used for 1 semester. Clean and in good shape.",
    price: 90,
    category: "Clothes",
    condition: "Good",
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
    sellerName: "Anjali Patil",
    sellerEmail: "anjali@college.edu",
    college: "COEP Tech",
    sold: false,
    createdAt: new Date().toISOString(),
  },
];
let memMessages = [];
let memIdCounter = 100;

const isMongoConnected = () => mongoose.connection.readyState === 1;

// ─── Listing Routes ───────────────────────────────────────────────────────────

// GET all listings (with optional search + filter)
app.get("/api/listings", async (req, res) => {
  try {
    const { search = "", category = "", minPrice, maxPrice } = req.query;
    if (isMongoConnected()) {
      const query = { sold: false };
      if (search) query.title = { $regex: search, $options: "i" };
      if (category) query.category = category;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }
      const listings = await Listing.find(query).sort({ createdAt: -1 });
      res.json(listings);
    } else {
      let results = memListings.filter((l) => !l.sold);
      if (search) results = results.filter((l) => l.title.toLowerCase().includes(search.toLowerCase()));
      if (category) results = results.filter((l) => l.category === category);
      if (minPrice) results = results.filter((l) => l.price >= Number(minPrice));
      if (maxPrice) results = results.filter((l) => l.price <= Number(maxPrice));
      res.json(results.reverse());
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single listing
app.get("/api/listings/:id", async (req, res) => {
  try {
    if (isMongoConnected()) {
      const listing = await Listing.findById(req.params.id);
      if (!listing) return res.status(404).json({ error: "Not found" });
      res.json(listing);
    } else {
      const listing = memListings.find((l) => l._id === req.params.id);
      if (!listing) return res.status(404).json({ error: "Not found" });
      res.json(listing);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create listing (with optional image)
app.post("/api/listings", upload.single("image"), async (req, res) => {
  try {
    const { title, description, price, category, condition, sellerName, sellerEmail, college } = req.body;
    const imageUrl = req.file
      ? `http://localhost:${PORT}/uploads/${req.file.filename}`
      : req.body.imageUrl || "";

    if (isMongoConnected()) {
      const listing = new Listing({ title, description, price, category, condition, sellerName, sellerEmail, college, imageUrl });
      await listing.save();
      res.status(201).json(listing);
    } else {
      const listing = { _id: String(++memIdCounter), title, description, price: Number(price), category, condition, sellerName, sellerEmail, college, imageUrl, sold: false, createdAt: new Date().toISOString() };
      memListings.push(listing);
      res.status(201).json(listing);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH mark as sold
app.patch("/api/listings/:id/sold", async (req, res) => {
  try {
    if (isMongoConnected()) {
      const listing = await Listing.findByIdAndUpdate(req.params.id, { sold: true }, { new: true });
      res.json(listing);
    } else {
      const listing = memListings.find((l) => l._id === req.params.id);
      if (listing) listing.sold = true;
      res.json(listing);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE listing
app.delete("/api/listings/:id", async (req, res) => {
  try {
    if (isMongoConnected()) {
      await Listing.findByIdAndDelete(req.params.id);
    } else {
      memListings = memListings.filter((l) => l._id !== req.params.id);
    }
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Message / Chat Routes ────────────────────────────────────────────────────

// GET messages for a listing (between two users)
app.get("/api/messages/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const { user1, user2 } = req.query;
    if (isMongoConnected()) {
      const msgs = await Message.find({
        listingId,
        $or: [
          { senderName: user1, receiverName: user2 },
          { senderName: user2, receiverName: user1 },
        ],
      }).sort({ createdAt: 1 });
      res.json(msgs);
    } else {
      const msgs = memMessages.filter(
        (m) =>
          m.listingId === listingId &&
          ((m.senderName === user1 && m.receiverName === user2) ||
            (m.senderName === user2 && m.receiverName === user1))
      );
      res.json(msgs);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST send message
app.post("/api/messages", async (req, res) => {
  try {
    const { listingId, senderName, receiverName, text } = req.body;
    if (isMongoConnected()) {
      const msg = new Message({ listingId, senderName, receiverName, text });
      await msg.save();
      res.status(201).json(msg);
    } else {
      const msg = { _id: String(++memIdCounter), listingId, senderName, receiverName, text, createdAt: new Date().toISOString() };
      memMessages.push(msg);
      res.status(201).json(msg);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
