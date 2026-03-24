import { useEffect, useState } from "react";
import { TextField, Grid, MenuItem, Chip, CircularProgress, Alert, Collapse } from "@mui/material";
import { AddCircleOutline, DeleteOutline } from "@mui/icons-material";
import API from "../services/api";
import "../index.css";

const CAT_RAW = {
  electricity: { color: "#C9A84C", bg: "#FDF6E3", border: "#E8D498", icon: "⚡", label: "Electricity"},
  water: { color: "#2E7EB8", bg: "#EBF4FB", border: "#B3D4EE", icon: "💧", label: "Water"},
  waste: { color: "#2A7A4B", bg: "#E8F5EE", border: "#9DD0B3", icon: "🗑", label: "Waste"},
};

export default function Goals() {
  const [goals,   setGoals]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ title: "", category: "", target: "", unit: "", description: "" });

  useEffect(() => { fetchGoals(); }, []);

  const fetchGoals = async () => {
    try { const { data } = await API.get("/goals"); setGoals(data); }
    catch (e) { console.error(e); }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    let unit = form.unit;
    if (name === "category") {
      if (value === "electricity") unit = "kWh";
      if (value === "water")       unit = "L";
      if (value === "waste")       unit = "kg";
    }
    setForm({ ...form, [name]: value, unit });
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError(""); setSuccess(""); setLoading(true);
    try {
      await API.post("/goals", { ...form, target: Number(form.target) });
      setSuccess("Goal added successfully.");
      setForm({ title: "", category: "", target: "", unit: "", description: "" });
      fetchGoals();
    } catch (err) { setError(err.response?.data?.message || "Only admins can set goals."); }
    finally { setLoading(false); }
  };

  const handleDelete = async id => {
    try { await API.delete(`/goals/${id}`); fetchGoals(); }
    catch { setError("Delete failed."); }
  };

  return (
    <div className="eco-page">
      <div className="eco-fade">
        <div className="eco-page-eyebrow">🎯 Goals</div>
        <h1 className="eco-page-title">Sustainability Goals</h1>
        <p className="eco-page-sub">Define and track resource reduction targets for your institution</p>
      </div>

      {/* Add goal form */}
      <div className="eco-card eco-fade" style={{ marginBottom: 28 }}>
        <div className="eco-card-title"><div className="eco-card-dot" />Add New Goal</div>
        <Collapse in={!!error}><Alert severity="error" sx={{ mb: 2 }}>{error}</Alert></Collapse>
        <Collapse in={!!success}><Alert severity="success" sx={{ mb: 2 }}>{success}</Alert></Collapse>
        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth label="Goal Title" name="title" value={form.title} onChange={handleChange} required size="small" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField select fullWidth label="Category" name="category" value={form.category} onChange={handleChange} required size="small">
                <MenuItem value="electricity">⚡ Electricity</MenuItem>
                <MenuItem value="water">💧 Water</MenuItem>
                <MenuItem value="waste">🗑 Waste</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField fullWidth label="Target" name="target" type="number" value={form.target} onChange={handleChange} required size="small" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField fullWidth label="Unit (auto)" name="unit" value={form.unit} disabled size="small"
                sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#A09080" } }} />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField fullWidth label="Year (optional)" name="description" value={form.description} onChange={handleChange} size="small" placeholder="e.g. 2026" />
            </Grid>
          </Grid>
          <button type="submit" className="eco-btn-primary" disabled={loading}>
            {loading ? <CircularProgress size={16} sx={{ color: "#F5F0E8" }} /> : <><AddCircleOutline sx={{ fontSize: "1rem" }} /> Add Goal</>}
          </button>
        </form>
      </div>

      {/* Goals list */}
      <div className="eco-section-label eco-fade">
        Active Goals <span className="eco-section-count">{goals.length}</span>
      </div>

      {goals.length === 0 ? (
        <div className="eco-empty eco-fade">
          <div className="eco-empty-icon">🎯</div>
          <div className="eco-empty-text">No goals yet. Add your first sustainability target above.</div>
        </div>
      ) : (
        <Grid container spacing={2.5}>
          {goals.map(g => {
            const c = CAT_RAW[g.category] || { color: "#6E4E2B", bg: "#F5EDE4", border: "#C8A07A", icon: "📌", label: g.category };
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={g._id}>
                <div className="goal-card eco-fade" style={{ "--c-color": c.color }}>
                  <div className="goal-card-foot" style={{ marginBottom: 8, marginTop: 0 }}>
                    <Chip label={`${c.icon} ${c.label}`} size="small" sx={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "0.72rem" }} />
                    
                  </div>
                  <div className="goal-card-title">{g.title}</div>
                  <div>
                    <span className="goal-card-value">{g.target?.toLocaleString()}</span>
                    <span className="goal-card-unit">{g.unit}</span>
                  </div>
                  <div className="goal-card-label">Annual target</div>
                  <button className="eco-btn-danger" style={{ marginTop: 12 }} onClick={() => handleDelete(g._id)}>
                    <DeleteOutline sx={{ fontSize: "0.88rem" }} /> Delete
                  </button>
                </div>
              </Grid>
            );
          })}
        </Grid>
      )}
    </div>
  );
}