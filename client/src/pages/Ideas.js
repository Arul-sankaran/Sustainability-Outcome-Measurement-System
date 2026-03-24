import { useEffect, useState, useContext } from "react";
import { TextField, CircularProgress, Alert, Collapse, Box, Avatar, Chip, Grid, MenuItem } from "@mui/material";
import { Send, DeleteOutline, EmojiObjects } from "@mui/icons-material";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "../index.css";

const PALETTES = [
  { color: "#0D2818", bg: "#E4F0E9", border: "#9DD0B3" },
  { color: "#2E7EB8", bg: "#EBF4FB", border: "#B3D4EE" },
  { color: "#2A7A4B", bg: "#E8F5EE", border: "#9DD0B3" },
  { color: "#92620A", bg: "#FDF6E3", border: "#E8D498" },
  { color: "#6E4E2B", bg: "#F5EDE4", border: "#C8A07A" },
];
const palette  = id => PALETTES[(id?.charCodeAt(id.length - 1) || 0) % PALETTES.length];
const initials = n  => n?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

const CAT = {
  idea:     { label: "Idea",     icon: "💡", chipBg: "#E4F0E9", chipColor: "#0D2818", chipBorder: "#9DD0B3" },
  feedback: { label: "Feedback", icon: "💬", chipBg: "#EBF4FB", chipColor: "#2E7EB8", chipBorder: "#B3D4EE" },
};

const groupByUser = list => {
  const map = {};
  list.forEach(item => { const key = item.submittedBy || "Anonymous"; if (!map[key]) map[key] = []; map[key].push(item); });
  return Object.entries(map);
};

/* ── Single card ── */
function IdeaCard({ item, onDelete, isAdmin }) {
  const p   = palette(item._id);
  const cat = CAT[item.category] || CAT.idea;
  return (
    <div className="idea-card" style={{ borderLeft: `3px solid ${p.color}` }}>
      <div className="idea-card-meta">
        <Chip label={`${cat.icon} ${cat.label}`} size="small" sx={{ background: cat.chipBg, color: cat.chipColor, border: `1px solid ${cat.chipBorder}`, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "0.68rem" }} />
        <div className="idea-card-author">
          <Avatar sx={{ width: 20, height: 20, fontSize: "0.58rem", fontWeight: 800, background: p.bg, color: p.color, border: `1px solid ${p.border}` }}>
            {initials(item.submittedBy)}
          </Avatar>
          <span className="idea-author-name">{item.submittedBy || "Anonymous"}</span>
        </div>
      </div>
      <div className="idea-card-title">{item.title}</div>
      <div className="idea-card-desc" style={{ marginBottom: isAdmin ? "12px" : 0 }}>{item.description}</div>
      {isAdmin && (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="idea-delete-btn" onClick={() => onDelete(item._id)}>
            <DeleteOutline sx={{ fontSize: "0.82rem" }} /> Delete
          </button>
        </Box>
      )}
    </div>
  );
}

/* ── Grouped section ── */
function GroupedSection({ title, icon, items, onDelete, isAdmin, emptyText }) {
  const grouped = groupByUser(items);
  return (
    <div style={{ marginBottom: 40 }}>
      <div className="ideas-section-hdr">
        <span className="ideas-section-icon">{icon}</span>
        <span className="ideas-section-title">{title}</span>
        <span className="ideas-section-count">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="ideas-empty-section">{emptyText}</div>
      ) : (
        grouped.map(([userName, userItems]) => {
          const p = palette(userItems[0]._id);
          return (
            <div key={userName} style={{ marginBottom: 28 }}>
              <div className="ideas-user-row">
                <Avatar sx={{ width: 28, height: 28, fontSize: "0.66rem", fontWeight: 800, background: p.bg, color: p.color, border: `1.5px solid ${p.border}` }}>
                  {initials(userName)}
                </Avatar>
                <span className="ideas-user-name">{userName}</span>
                <Chip label={`${userItems.length} ${title.toLowerCase().replace(/s$/, "")}${userItems.length !== 1 ? "s" : ""}`} size="small"
                  sx={{ background: p.bg, border: `1px solid ${p.border}`, color: p.color, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "0.68rem" }} />
              </div>
              <Grid container spacing={2}>
                {userItems.map(item => (
                  <Grid size={{ xs: 12 }} key={item._id}>
                    <IdeaCard item={item} onDelete={onDelete} isAdmin={isAdmin} />
                  </Grid>
                ))}
              </Grid>
            </div>
          );
        })
      )}
    </div>
  );
}

/* MAIN PAGE */

export default function Ideas() {
  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "idea" });
  const { user } = useContext(AuthContext);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try { const { data } = await API.get("/ideas"); setItems(data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault(); setError(""); setSubmitting(true);
    try {
      await API.post("/ideas", form);
      setSuccess(true);
      setForm({ title: "", description: "", category: "idea" });
      fetchItems();
      setTimeout(() => setSuccess(false), 4000);
    } catch { setError("Error submitting. Please try again."); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async id => {
    try { await API.delete(`/ideas/${id}`); fetchItems(); }
    catch { setError("Delete failed."); }
  };

  const ideas    = items.filter(i => i.category === "idea");
  const feedback = items.filter(i => i.category === "feedback");

  return (
    <div className="eco-page">
      <div className="eco-fade">
        <div className="eco-page-eyebrow">💡 Ideas &amp; Feedback</div>
        <h1 className="eco-page-title">Ideas &amp; Feedback</h1>
        <p className="eco-page-sub">Share ideas and feedback to improve campus sustainability — visible to everyone</p>
      </div>

      {/* ── Submit form ── */}
      <div className="eco-submit-card eco-fade">
        <div className="eco-submit-header">
          <EmojiObjects sx={{ fontSize: "0.9rem", color: "#1A5230" }} />
          <span className="eco-submit-label">Share Your Thoughts</span>
          <div className="eco-submit-stats">
            {[
              { val: ideas.length,    lbl: "Ideas"        },
              { val: feedback.length, lbl: "Feedback"     },
              { val: new Set(items.map(i => i.submittedBy)).size, lbl: "Contributors" },
            ].map(s => (
              <div key={s.lbl}>
                <div className="eco-submit-stat-val">{s.val}</div>
                <div className="eco-submit-stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        <Collapse in={!!error}>
          <Alert severity="error" sx={{ mb: 2, borderRadius: "9px" }}>{error}</Alert>
        </Collapse>

        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={1.5} alignItems="flex-start">
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField select fullWidth label="Category" name="category" value={form.category} onChange={handleChange} size="small">
                <MenuItem value="idea"     sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.84rem" }}>💡 Idea</MenuItem>
                <MenuItem value="feedback" sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.84rem" }}>💬 Feedback</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField fullWidth label="Title" name="title" value={form.title} onChange={handleChange} required size="small" />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField fullWidth label={form.category === "feedback" ? "Your feedback" : "Describe your idea"}
                name="description" value={form.description} onChange={handleChange} required size="small" />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <button type="submit" disabled={submitting} className="eco-form-submit-btn">
                {submitting ? <CircularProgress size={15} sx={{ color: "#F5F0E8" }} /> : <><Send sx={{ fontSize: "0.85rem" }} /> Submit</>}
              </button>
            </Grid>
          </Grid>
        </form>

        {success && (
          <div className="eco-success-strip">✓ Submitted successfully!</div>
        )}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#1A5230" }} size={28} />
        </Box>
      ) : (
        <>
          <GroupedSection title="Ideas" icon="💡" items={ideas} onDelete={handleDelete} isAdmin={user?.role === "admin"} emptyText="No ideas submitted yet. Be the first to share one!" />
          <GroupedSection title="Feedback" icon="💬" items={feedback} onDelete={handleDelete} isAdmin={user?.role === "admin"} emptyText="No feedback submitted yet. Share your thoughts!" />
        </>
      )}
    </div>
  );
}