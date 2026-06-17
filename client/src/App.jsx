import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const GLOBAL_STYLE = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #F7F4EF;
    --surface: #FFFFFF;
    --border: #E5E0D8;
    --accent: #E85D2F;
    --text: #1A1A1A;
    --muted: #7A7570;
  }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    min-height: 100vh;
  }
  h1, h2, h3, h4 { font-family: 'Syne', sans-serif; }
  button { cursor: pointer; font-family: inherit; }
  input, textarea, select { font-family: inherit; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { background: #E5E0D8; border-radius: 4px; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes shimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .fadeUp { animation: fadeUp 0.35s ease forwards; }
  .fadeIn { animation: fadeIn 0.3s ease forwards; }
  .card:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(0,0,0,0.12) !important; }
  .card { transition: transform 0.2s, box-shadow 0.2s; }
  .skeleton {
    background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
    background-size: 400px 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 12px;
  }
  .pill-active { background: #1A1A1A !important; color: #fff !important; border-color: #1A1A1A !important; }
  .pill { transition: all 0.18s; }
  .pill:hover { border-color: #1A1A1A !important; color: #1A1A1A !important; }
`;

const API = "http://localhost:5000/api";
const CATEGORIES = ["All", "Books", "Notes", "Electronics", "Clothes", "Stationery", "Other"];
const CONDITIONS = ["New", "Like New", "Good", "Fair"];
const CAT_ICON = { Books: "📚", Notes: "📝", Electronics: "💻", Clothes: "👕", Stationery: "✏️", Other: "📦" };

const inputSt = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1.5px solid #E5E0D8", fontSize: 15, outline: "none", background: "#fff",
};
const labelSt = {
  fontSize: 12, fontWeight: 700, color: "#7A7570", marginBottom: 6,
  display: "block", textTransform: "uppercase", letterSpacing: 0.5,
};

function CondBadge({ cond }) {
  const bg = { New: "#EEF6F2", "Like New": "#EEF6F2", Good: "#FEF0EB", Fair: "#FEECEC" };
  const cl = { New: "#2D6A4F", "Like New": "#2D6A4F", Good: "#C84B1C", Fair: "#B00020" };
  return (
    <span style={{ background: bg[cond] || "#F0F0F0", color: cl[cond] || "#555",
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
      textTransform: "uppercase", letterSpacing: 0.5 }}>
      {cond}
    </span>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ view, setView, user, setUser }) {
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");

  return (
    <nav style={{
      background: "#fff", borderBottom: "1.5px solid #E5E0D8",
      padding: "0 28px", height: 60,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <div onClick={() => setView("listings")} style={{
          fontSize: 20, fontWeight: 800, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, fontFamily: "Syne",
        }}>
          <span style={{ background: "#E85D2F", color: "#fff", borderRadius: 8, padding: "2px 10px" }}>C</span>
          ampusMarket
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[["listings", "🛍 Browse"], ["sell", "➕ Sell"]].map(([v, l]) => (
            <button key={v} onClick={() => setView(v)} style={{
              background: view === v ? "#1A1A1A" : "transparent",
              color: view === v ? "#fff" : "#7A7570",
              border: "none", borderRadius: 8,
              padding: "6px 14px", fontWeight: 600, fontSize: 14, transition: "all 0.2s",
            }}>{l}</button>
          ))}
        </div>
      </div>
      <div>
        {user ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ background: "#F7F4EF", border: "1.5px solid #E5E0D8", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600 }}>
              👤 {user}
            </span>
            <button onClick={() => setUser("")} style={{ background: "transparent", border: "1.5px solid #E5E0D8", borderRadius: 8, padding: "6px 12px", fontSize: 13, color: "#7A7570" }}>
              Sign out
            </button>
          </div>
        ) : (
          <button onClick={() => setModal(true)} style={{ background: "#E85D2F", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, fontSize: 14 }}>
            Sign In
          </button>
        )}
      </div>

      {modal && (
        <div onClick={() => setModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} className="fadeUp" style={{
            background: "#fff", borderRadius: 20, padding: 36, width: 360,
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
            <h2 style={{ fontSize: 24, marginBottom: 6 }}>Welcome back!</h2>
            <p style={{ color: "#7A7570", fontSize: 14, marginBottom: 24 }}>Enter your name to get started</p>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name"
              onKeyDown={e => { if (e.key === "Enter" && name.trim()) { setUser(name.trim()); setModal(false); } }}
              style={{ ...inputSt, marginBottom: 14 }} autoFocus />
            <button onClick={() => { if (name.trim()) { setUser(name.trim()); setModal(false); } }} style={{
              width: "100%", background: "#E85D2F", color: "#fff",
              border: "none", borderRadius: 10, padding: 12, fontSize: 15, fontWeight: 700,
            }}>Enter Campus</button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Listing Card ──────────────────────────────────────────────────────────────
function ListingCard({ listing, onClick, delay = 0 }) {
  return (
    <div onClick={onClick} className="card fadeUp" style={{
      background: "#fff", borderRadius: 12, border: "1.5px solid #E5E0D8",
      overflow: "hidden", cursor: "pointer",
      animationDelay: `${delay}s`,
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    }}>
      <div style={{ height: 180, background: "#F0EDE8", overflow: "hidden", position: "relative" }}>
        {listing.imageUrl ? (
          <img src={listing.imageUrl} alt={listing.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { e.target.style.display = "none"; }} />
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56 }}>
            {CAT_ICON[listing.category] || "📦"}
          </div>
        )}
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <CondBadge cond={listing.condition} />
        </div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 12, color: "#7A7570", fontWeight: 600, marginBottom: 4 }}>
          {CAT_ICON[listing.category]} {listing.category}
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {listing.title}
        </h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 22, fontWeight: 900, fontFamily: "Syne", color: "#E85D2F" }}>₹{listing.price}</span>
          <span style={{ fontSize: 12, color: "#7A7570" }}>by {listing.sellerName}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Chat Panel ────────────────────────────────────────────────────────────────
function ChatPanel({ listing, user, onClose }) {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const receiver = listing.sellerName;

  useEffect(() => {
    fetchMsgs();
    const t = setInterval(fetchMsgs, 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const fetchMsgs = async () => {
    try {
      const { data } = await axios.get(`${API}/messages/${listing._id}`, { params: { user1: user, user2: receiver } });
      setMsgs(data);
    } catch { setMsgs([]); }
    finally { setLoading(false); }
  };

  const send = async () => {
    if (!text.trim()) return;
    const t = text; setText("");
    try {
      const { data } = await axios.post(`${API}/messages`, { listingId: listing._id, senderName: user, receiverName: receiver, text: t });
      setMsgs(p => [...p, data]);
    } catch { alert("Send failed"); }
  };

  const fmt = d => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fadeUp" style={{
      position: "fixed", bottom: 24, right: 24, width: 360, height: 490,
      background: "#fff", borderRadius: 18, border: "1.5px solid #E5E0D8",
      boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      display: "flex", flexDirection: "column", zIndex: 300, overflow: "hidden",
    }}>
      <div style={{ padding: "14px 18px", background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontFamily: "Syne", fontSize: 14 }}>💬 {receiver}</div>
          <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>re: {listing.title.slice(0, 28)}{listing.title.length > 28 ? "…" : ""}</div>
        </div>
        <button onClick={onClose} style={{ background: "#333", border: "none", color: "#fff", borderRadius: 8, width: 30, height: 30, fontSize: 18, fontWeight: 700 }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#7A7570", marginTop: 40 }}>Loading…</div>
        ) : msgs.length === 0 ? (
          <div style={{ textAlign: "center", color: "#7A7570", marginTop: 50, lineHeight: 1.6 }}>
            <div style={{ fontSize: 40 }}>👋</div>
            <div style={{ fontSize: 14, marginTop: 10 }}>Start the conversation!<br />Ask about the item or negotiate price.</div>
          </div>
        ) : msgs.map(m => {
          const mine = m.senderName === user;
          return (
            <div key={m._id} style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
              <div style={{
                background: mine ? "#E85D2F" : "#F0EDE8", color: mine ? "#fff" : "#1A1A1A",
                borderRadius: mine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                padding: "9px 14px", maxWidth: "78%", fontSize: 14, lineHeight: 1.45,
              }}>{m.text}</div>
              <span style={{ fontSize: 11, color: "#AAA", marginTop: 3 }}>{m.senderName} · {fmt(m.createdAt)}</span>
            </div>
          );
        })}
        <div ref={ref} />
      </div>
      <div style={{ padding: "12px 14px", borderTop: "1.5px solid #E5E0D8", display: "flex", gap: 8 }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Message…"
          style={{ flex: 1, padding: "9px 14px", borderRadius: 10, border: "1.5px solid #E5E0D8", fontSize: 14, outline: "none" }} />
        <button onClick={send} disabled={!text.trim()} style={{
          width: 40, background: text.trim() ? "#E85D2F" : "#E5E0D8",
          border: "none", borderRadius: 10, color: "#fff", fontSize: 18,
          transition: "background 0.2s",
        }}>↑</button>
      </div>
    </div>
  );
}

// ─── Listing Modal ─────────────────────────────────────────────────────────────
function ListingModal({ listing, user, onClose, onChat }) {
  const isSeller = user === listing.sellerName;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 150, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} className="fadeUp" style={{
        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 600,
        maxHeight: "90vh", overflow: "auto", boxShadow: "0 28px 80px rgba(0,0,0,0.22)",
      }}>
        <div style={{ height: 260, background: "#F0EDE8", position: "relative", borderRadius: "20px 20px 0 0", overflow: "hidden" }}>
          {listing.imageUrl ? (
            <img src={listing.imageUrl} alt={listing.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80 }}>
              {CAT_ICON[listing.category] || "📦"}
            </div>
          )}
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", width: 36, height: 36, fontSize: 20, fontWeight: 700 }}>×</button>
        </div>
        <div style={{ padding: 28 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{ background: "#F0EDE8", color: "#7A7570", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
              {CAT_ICON[listing.category]} {listing.category}
            </span>
            <CondBadge cond={listing.condition} />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 10 }}>{listing.title}</h2>
          <p style={{ color: "#7A7570", lineHeight: 1.65, marginBottom: 22 }}>{listing.description || "No description provided."}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, background: "#F7F4EF", borderRadius: 12, padding: 18, marginBottom: 24 }}>
            {[["Seller", listing.sellerName], ["College", listing.college || "—"], ["Contact", listing.sellerEmail], ["Posted", new Date(listing.createdAt).toLocaleDateString()]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: "#7A7570", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>{k}</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <span style={{ fontSize: 36, fontWeight: 900, fontFamily: "Syne", color: "#E85D2F" }}>₹{listing.price}</span>
            {user && !isSeller ? (
              <button onClick={onChat} style={{ background: "#E85D2F", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 15, fontWeight: 700 }}>
                💬 Chat with Seller
              </button>
            ) : isSeller ? (
              <span style={{ color: "#7A7570", fontStyle: "italic" }}>Your listing</span>
            ) : (
              <span style={{ color: "#7A7570" }}>Sign in to contact seller</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sell Form ─────────────────────────────────────────────────────────────────
function SellForm({ user, onSuccess }) {
  const [form, setForm] = useState({ title: "", description: "", price: "", category: "Books", condition: "Good", sellerName: user || "", sellerEmail: "", college: "" });
  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const onImg = e => {
    const f = e.target.files[0];
    if (f) { setImg(f); setPreview(URL.createObjectURL(f)); }
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.title || !form.price || !form.sellerName || !form.sellerEmail) { alert("Please fill all required fields (*)"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (img) fd.append("image", img);
      await axios.post(`${API}/listings`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setDone(true);
      setTimeout(onSuccess, 1600);
    } catch { alert("Failed to post. Is the server running?"); }
    finally { setLoading(false); }
  };

  if (done) return (
    <div style={{ textAlign: "center", padding: "100px 20px" }} className="fadeIn">
      <div style={{ fontSize: 72 }}>🎉</div>
      <h2 style={{ fontSize: 30, marginTop: 20, marginBottom: 10 }}>Listing Posted!</h2>
      <p style={{ color: "#7A7570" }}>Redirecting to browse…</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "40px 20px 80px" }}>
      <h1 style={{ fontSize: 34, fontWeight: 900, marginBottom: 6 }}>Post a Listing</h1>
      <p style={{ color: "#7A7570", marginBottom: 36 }}>Sell your books, notes and more to fellow students</p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div>
          <label style={labelSt}>Photo</label>
          <label style={{ display: "block", height: 200, border: "2px dashed #E5E0D8", borderRadius: 14, cursor: "pointer", overflow: "hidden", background: preview ? "transparent" : "#F7F4EF" }}>
            <input type="file" accept="image/*" onChange={onImg} style={{ display: "none" }} />
            {preview ? (
              <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#7A7570" }}>
                <span style={{ fontSize: 40 }}>📷</span>
                <span style={{ marginTop: 10, fontSize: 14 }}>Click to upload a photo</span>
                <span style={{ fontSize: 12, marginTop: 4, color: "#AAA" }}>JPG, PNG up to 5MB</span>
              </div>
            )}
          </label>
        </div>

        <div>
          <label style={labelSt}>Title *</label>
          <input value={form.title} onChange={set("title")} placeholder="e.g. Engineering Maths Vol. 2" style={inputSt} />
        </div>

        <div>
          <label style={labelSt}>Description</label>
          <textarea value={form.description} onChange={set("description")} rows={3} placeholder="Condition, edition, any highlights or damage…" style={{ ...inputSt, resize: "vertical", lineHeight: 1.5 }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelSt}>Category *</label>
            <select value={form.category} onChange={set("category")} style={inputSt}>
              {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelSt}>Condition *</label>
            <select value={form.condition} onChange={set("condition")} style={inputSt}>
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelSt}>Price (₹) *</label>
            <input type="number" value={form.price} onChange={set("price")} placeholder="0" min="0" style={inputSt} />
          </div>
        </div>

        <div style={{ borderTop: "1.5px solid #E5E0D8", paddingTop: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, fontFamily: "Syne" }}>Your Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelSt}>Name *</label>
              <input value={form.sellerName} onChange={set("sellerName")} placeholder="Full name" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>College</label>
              <input value={form.college} onChange={set("college")} placeholder="e.g. COEP Tech" style={inputSt} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelSt}>College Email *</label>
              <input type="email" value={form.sellerEmail} onChange={set("sellerEmail")} placeholder="you@college.edu" style={inputSt} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ background: loading ? "#E5E0D8" : "#E85D2F", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, marginTop: 6, transition: "background 0.2s" }}>
          {loading ? "Posting…" : "🚀 Post Listing"}
        </button>
      </form>
    </div>
  );
}

// ─── Listings View ─────────────────────────────────────────────────────────────
function ListingsView({ user, onChat }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => { load(); }, [search, category, maxPrice]);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== "All") params.category = category;
      if (maxPrice) params.maxPrice = maxPrice;
      const { data } = await axios.get(`${API}/listings`, { params });
      setListings(data);
    } catch { setListings([]); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20, marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.05 }}>Campus<br /><span style={{ color: "#E85D2F" }}>Marketplace</span></h1>
          <p style={{ color: "#7A7570", marginTop: 10 }}>{loading ? "Loading…" : `${listings.length} items available`}</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings…"
              style={{ ...inputSt, width: 220, paddingLeft: 38 }} />
          </div>
          <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
            placeholder="Max ₹" type="number"
            style={{ ...inputSt, width: 110 }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className="pill" style={{
            background: category === cat ? "#1A1A1A" : "#fff",
            color: category === cat ? "#fff" : "#7A7570",
            border: `1.5px solid ${category === cat ? "#1A1A1A" : "#E5E0D8"}`,
            borderRadius: 24, padding: "6px 18px", fontSize: 13, fontWeight: 600,
          }}>
            {cat !== "All" && CAT_ICON[cat] + " "}{cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 285 }} />)}
        </div>
      ) : listings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#7A7570" }}>
          <div style={{ fontSize: 60 }}>🕵️</div>
          <h3 style={{ marginTop: 16, fontSize: 22 }}>No results found</h3>
          <p style={{ marginTop: 8 }}>Try different keywords or clear filters</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
          {listings.map((l, i) => (
            <ListingCard key={l._id} listing={l} delay={i * 0.04} onClick={() => setSelected(l)} />
          ))}
        </div>
      )}

      {selected && (
        <ListingModal listing={selected} user={user} onClose={() => setSelected(null)}
          onChat={() => { onChat(selected); setSelected(null); }} />
      )}
    </div>
  );
}

// ─── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("listings");
  const [user, setUser] = useState("");
  const [chat, setChat] = useState(null);

  const handleChat = listing => {
    if (!user) { alert("Please sign in to chat with sellers"); return; }
    setChat(listing);
  };

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <Navbar view={view} setView={setView} user={user} setUser={setUser} />
      {view === "listings"
        ? <ListingsView user={user} onChat={handleChat} />
        : <SellForm user={user} onSuccess={() => setView("listings")} />
      }
      {chat && <ChatPanel listing={chat} user={user} onClose={() => setChat(null)} />}
    </>
  );
}
