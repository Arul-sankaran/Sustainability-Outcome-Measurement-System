import { useEffect, useState } from "react";
import {
  TextField, Grid, MenuItem, Chip, CircularProgress, Alert, Collapse, Box, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  InputAdornment, Paper, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip
} from "@mui/material";
import { PersonAdd, CheckCircle, Cancel, Search, EditOutlined, DeleteOutline, Close, FilterList } from "@mui/icons-material";
import API from "../services/api";
import "../index.css";

/* ── constants ── */
const STATUS = {
  pending:  { color: "#92620A", bg: "#FDF6E3", border: "#E8D498", label: "Pending"  },
  approved: { color: "#2A7A4B", bg: "#E8F5EE", border: "#9DD0B3", label: "Approved" },
  rejected: { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", label: "Rejected" },
};
const ROLE = {
  admin:   { color: "#0D2818", bg: "#E4F0E9", border: "#9DD0B3" },
  staff:   { color: "#2E7EB8", bg: "#EBF4FB", border: "#B3D4EE" },
  student: { color: "#2A7A4B", bg: "#E8F5EE", border: "#9DD0B3" },
};
const initials = n => n?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

/* ── MUI table tokens ── */
const TH = { fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: ".07em", color: "#4A5040", background: "#F5F1EB", borderBottom: "1px solid #E2D9CC", py: 1.5, px: 2 };
const TD = { fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.85rem", color: "#1C1A17", borderBottom: "1px solid #F0ECE6", py: 1.3, px: 2 };
const PAPER_SX   = { border: "1px solid #E2D9CC", borderRadius: "14px", overflow: "hidden", mb: 4, boxShadow: "0 4px 18px rgba(13,40,24,0.07)" };
const PAGINATION_SX = { borderTop: "1px solid #E2D9CC", background: "#FDFCFA", "& .MuiTablePagination-toolbar,& .MuiTablePagination-selectLabel,& .MuiTablePagination-displayedRows,& .MuiSelect-select": { fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.82rem", color: "#7A6F62" } };

/* ── chips ── */
const StatusChip = ({ status }) => {
  const s = STATUS[status] || STATUS.pending;
  return <Chip label={s.label} size="small" sx={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "0.69rem" }} />;
};
const RoleChip = ({ role }) => {
  const r = ROLE[role] || ROLE.student;
  return <Chip label={role?.charAt(0).toUpperCase() + role?.slice(1) || "—"} size="small" sx={{ background: r.bg, color: r.color, border: `1px solid ${r.border}`, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "0.69rem" }} />;
};

/* ── FilterBar ── */
function FilterBar({ search, onSearch, role, onRole, status, onStatus, showStatus = true, count }) {
  const isActive = search || role !== "all" || (showStatus && status !== "all");
  return (
    <div className="eco-filter-card eco-fade">
      <div className="eco-filter-header">
        <FilterList sx={{ fontSize: "0.88rem", color: "#1A5230" }} />
        <span className="eco-filter-title">Filter &amp; Search</span>
        {count !== undefined && (
          <Box sx={{ ml: "auto", background: "#E4F0E9", border: "1px solid #9DD0B3", borderRadius: "8px", px: "9px", py: "1px", fontSize: "0.7rem", fontWeight: 800, color: "#1A5230", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {count} result{count !== 1 ? "s" : ""}
          </Box>
        )}
      </div>
      <Grid container spacing={1.5} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField fullWidth size="small" placeholder="Search by name or email…" value={search} onChange={e => onSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: "1rem", color: "#A09080" }} /></InputAdornment> }} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: showStatus ? 2 : 3 }}>
          <TextField select fullWidth size="small" label="Role" value={role} onChange={e => onRole(e.target.value)}>
            <MenuItem value="all">All Roles</MenuItem>
            {["admin","staff","student"].map(r => (
              <MenuItem key={r} value={r}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: ROLE[r].color }} />
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        {showStatus && (
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField select fullWidth size="small" label="Status" value={status} onChange={e => onStatus(e.target.value)}>
              <MenuItem value="all">All Status</MenuItem>
              {[
                { v: "pending",  color: "#D97706" },
                { v: "approved", color: "#2A7A4B" },
                { v: "rejected", color: "#DC2626"  },
              ].map(s => (
                <MenuItem key={s.v} value={s.v}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                    {s.v.charAt(0).toUpperCase() + s.v.slice(1)}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}
        {isActive && (
          <Grid size={{ xs: 12, sm: "auto" }}>
            <button className="uc-clear-btn" onClick={() => { onSearch(""); onRole("all"); if (showStatus) onStatus("all"); }}>
              <Close sx={{ fontSize: "0.8rem" }} /> Clear filters
            </button>
          </Grid>
        )}
      </Grid>
    </div>
  );
}

/* ── PaginatedTable ── */
function PaginatedTable({ rows, headerRow, renderRow, emptyMsg = "No users found.", colSpan = 6 }) {
  const [page, setPage] = useState(0);
  const [rpp,  setRpp]  = useState(10);
  const paged = rows.slice(page * rpp, page * rpp + rpp);
  return (
    <Paper elevation={0} sx={PAPER_SX} className="eco-fade">
      <TableContainer>
        <Table size="small">
          <TableHead>{headerRow}</TableHead>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow><TableCell colSpan={colSpan} sx={{ ...TD, textAlign: "center", color: "#A09080", py: 5 }}>{emptyMsg}</TableCell></TableRow>
            ) : paged.map((u, i) => renderRow(u, page * rpp + i + 1))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination component="div" count={rows.length} page={page} onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(+e.target.value); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25, 50]} sx={PAGINATION_SX} />
    </Paper>
  );
}

/* ── Row variants ── */
function BaseRow({ u, idx, actions }) {
  const rl = ROLE[u.role] || ROLE.student;
  return (
    <TableRow hover sx={{ "&:hover": { background: "#FAFAF8" }, "&:last-child td": { borderBottom: "none" } }}>
      <TableCell sx={{ ...TD, color: "#A09080", fontWeight: 600, width: 44 }}>{idx}</TableCell>
      <TableCell sx={TD}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Avatar sx={{ width: 28, height: 28, fontSize: "0.68rem", fontWeight: 800, background: rl.bg, color: rl.color, border: `1.5px solid ${rl.border}`, flexShrink: 0 }}>{initials(u.name)}</Avatar>
          <span style={{ fontWeight: 600 }}>{u.name}</span>
        </Box>
      </TableCell>
      <TableCell sx={{ ...TD, color: "#7A6F62" }}>{u.email}</TableCell>
      <TableCell sx={TD}><RoleChip role={u.role} /></TableCell>
      <TableCell sx={TD}><StatusChip status={u.status} /></TableCell>
      {actions && <TableCell sx={TD}>{actions}</TableCell>}
    </TableRow>
  );
}

const PlainRow = ({ u, idx }) => <BaseRow u={u} idx={idx} />;

function AllUserRow({ u, idx, onEdit, onDelete }) {
  return (
    <BaseRow u={u} idx={idx} actions={
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <Tooltip title="Edit user">
          <IconButton size="small" className="uc-edit-btn" onClick={() => onEdit(u)}><EditOutlined sx={{ fontSize: "0.9rem" }} /></IconButton>
        </Tooltip>
        <Tooltip title="Delete user">
          <IconButton size="small" className="uc-del-btn" onClick={() => onDelete(u)}><DeleteOutline sx={{ fontSize: "0.9rem" }} /></IconButton>
        </Tooltip>
      </Box>
    } />
  );
}

function PendingRow({ u, idx, onApprove, onReject }) {
  return (
    <BaseRow u={u} idx={idx} actions={
      <Box sx={{ display: "flex", gap: 0.8 }}>
        <button className="uc-approve-btn" onClick={() => onApprove(u._id)}><CheckCircle sx={{ fontSize: "0.78rem" }} /> Approve</button>
        <button className="uc-reject-btn"  onClick={() => onReject(u._id)}><Cancel  sx={{ fontSize: "0.78rem" }} /> Reject</button>
      </Box>
    } />
  );
}

/* ── Table headers ── */
const HDR_PLAIN = (
  <TableRow>
    {["#","User","Email","Role","Status"].map(h => <TableCell key={h} sx={TH}>{h}</TableCell>)}
  </TableRow>
);
const HDR_ACTIONS = (
  <TableRow>
    {["#","User","Email","Role","Status","Actions"].map(h => <TableCell key={h} sx={TH}>{h}</TableCell>)}
  </TableRow>
);

/* ── Edit Dialog ── */
function EditDialog({ user, open, onClose, onSave }) {
  const [form, setForm] = useState({ name: "", email: "", role: "", status: "" });
  useEffect(() => { if (user) setForm({ name: user.name || "", email: user.email || "", role: user.role || "", status: user.status || "" }); }, [user]);
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px", fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: "0 16px 60px rgba(13,40,24,0.18)" } }}>
      <DialogTitle sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#1C1A17", pb: 0.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Edit User
        <IconButton size="small" onClick={onClose} sx={{ color: "#A09080" }}><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Full Name" name="name" value={form.name} onChange={set} size="small" /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Email" name="email" value={form.email} onChange={set} size="small" type="email" /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select fullWidth label="Role" name="role" value={form.role} onChange={set} size="small">
              {["admin","staff","student"].map(r => <MenuItem key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select fullWidth label="Status" name="status" value={form.status} onChange={set} size="small">
              {["pending","approved","rejected"].map(s => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <button onClick={onClose} className="uc-dialog-cancel">Cancel</button>
        <button onClick={() => onSave(form)} className="uc-dialog-save">Save Changes</button>
      </DialogActions>
    </Dialog>
  );
}

/* ── Delete Dialog ── */
function DeleteDialog({ user, open, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "16px", boxShadow: "0 16px 60px rgba(13,40,24,0.18)" } }}>
      <DialogTitle sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "#1C1A17", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Delete User <IconButton size="small" onClick={onClose} sx={{ color: "#A09080" }}><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent>
        <div className="uc-delete-confirm">
          <div className="uc-delete-icon-wrap"><DeleteOutline sx={{ color: "#DC2626", fontSize: "1.5rem" }} /></div>
          <p className="uc-delete-msg">
            Are you sure you want to delete <strong style={{ color: "#1C1A17" }}>{user?.name}</strong>?<br />This action cannot be undone.
          </p>
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <button onClick={onClose} className="uc-dialog-cancel">Cancel</button>
        <button onClick={() => onConfirm(user?._id)} className="uc-dialog-delete">Delete</button>
      </DialogActions>
    </Dialog>
  );
}

/* ── helpers ── */
const applyFilter = (list, q, role, stat) => list.filter(u => {
  const lq = q.toLowerCase();
  return (!lq || u.name?.toLowerCase().includes(lq) || u.email?.toLowerCase().includes(lq))
    && (role === "all" || u.role === role)
    && (!stat || stat === "all" || u.status === stat);
});

function useFilters(initStat = "all") {
  const [q, setQ]     = useState("");
  const [role, setRole] = useState("all");
  const [stat, setStat] = useState(initStat);
  return [q, role, stat, setQ, setRole, setStat];
}

function EmptyState({ icon, msg }) {
  return <div className="eco-empty eco-fade"><div className="eco-empty-icon">{icon}</div><div className="eco-empty-text">{msg}</div></div>;
}

function ApprovedTable({ users }) {
  const [q, role,, setQ, setRole] = useFilters();
  const filtered = applyFilter(users.filter(u => u.status === "approved"), q, role, "approved");
  return (
    <>
      <FilterBar search={q} onSearch={setQ} role={role} onRole={setRole} showStatus={false} count={filtered.length} />
      {filtered.length === 0
        ? <EmptyState icon="👥" msg="No approved users found." />
        : <PaginatedTable rows={filtered} headerRow={HDR_PLAIN} colSpan={5} renderRow={(u, i) => <PlainRow key={u._id} u={u} idx={i} />} emptyMsg="No approved users match your filters." />}
    </>
  );
}

/* ══════════════════════════════
   MAIN COMPONENT
══════════════════════════════ */
export default function User() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [tab,      setTab]      = useState("all");
  const [form,     setForm]     = useState({ name: "", email: "", password: "", role: "" });
  const [editUser, setEditUser]   = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const [allQ, allRole,, setAllQ, setAllRole] = useFilters();
  const [penQ, penRole,, setPenQ, setPenRole] = useFilters();
  const [rejQ, rejRole,, setRejQ, setRejRole] = useFilters();

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try { const { data } = await API.get("/users?limit=1000&page=1"); setUsers(data.users || data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async e => {
    e.preventDefault(); setError(""); setSuccess("");
    try { await API.post("/users", form); setSuccess("User created successfully."); setForm({ name: "", email: "", password: "", role: "" }); fetchUsers(); }
    catch (err) { setError(err.response?.data?.message || "Error creating user."); }
  };

  const handleApprove = async id => { try { await API.put(`/users/approve/${id}`); fetchUsers(); } catch { setError("Approve failed."); } };
  const handleReject  = async id => { try { await API.put(`/users/reject/${id}`);  fetchUsers(); } catch { setError("Reject failed."); } };

  const handleEditSave = async (form) => {
    try { await API.put(`/users/${editUser._id}`, form); setEditUser(null); fetchUsers(); }
    catch { setError("Edit failed."); setEditUser(null); }
  };
  const handleDeleteConfirm = async (id) => {
    try { await API.delete(`/users/${id}`); setDeleteUser(null); fetchUsers(); }
    catch { setError("Delete failed."); setDeleteUser(null); }
  };

  const counts = {
    all:      users.filter(u => u.status === "approved").length,
    pending:  users.filter(u => u.status === "pending").length,
    approved: users.filter(u => u.status === "approved").length,
    rejected: users.filter(u => u.status === "rejected").length,
  };

  const approvedUsers = users.filter(u => u.status === "approved");
  const recentUsers   = [...approvedUsers].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 10);
  const allFiltered   = applyFilter(approvedUsers, allQ, allRole, "all");
  const penFiltered   = applyFilter(users.filter(u => u.status === "pending"),  penQ, penRole, "pending");
  const rejFiltered   = applyFilter(users.filter(u => u.status === "rejected"), rejQ, rejRole, "rejected");

  return (
    <div className="eco-page">
      <div className="eco-fade">
        <div className="eco-page-eyebrow">👥 Admin</div>
        <h1 className="eco-page-title">User Management</h1>
        <p className="eco-page-sub">Review and manage campus user registrations</p>
      </div>

      {/* Tabs */}
      <div className="filter-bar eco-fade">
        {[{ key: "all", label: "All Users" }, { key: "pending", label: "Pending" }, { key: "approved", label: "Approved" }, { key: "rejected", label: "Rejected" }].map(f => (
          <div key={f.key} className={`filter-pill${tab === f.key ? ` fp-${f.key}` : ""}`} onClick={() => setTab(f.key)}>
            {f.label}<span className="fp-count">{counts[f.key]}</span>
          </div>
        ))}
      </div>

      <EditDialog   user={editUser}   open={!!editUser}   onClose={() => setEditUser(null)}   onSave={handleEditSave} />
      <DeleteDialog user={deleteUser} open={!!deleteUser} onClose={() => setDeleteUser(null)} onConfirm={handleDeleteConfirm} />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: "#1A5230" }} size={28} /></Box>
      ) : (
        <>
          {/* ALL TAB */}
          {tab === "all" && (
            <>
              <div className="eco-card eco-fade" style={{ marginBottom: 28 }}>
                <div className="eco-card-title"><div className="eco-card-dot" />Create New User</div>
                <Collapse in={!!error}><Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert></Collapse>
                <Collapse in={!!success}><Alert severity="success" sx={{ mb: 2 }}>{success}</Alert></Collapse>
                <form onSubmit={handleCreate} noValidate>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}><TextField fullWidth label="Full Name"  name="name"     value={form.name}     onChange={e => setForm(f => ({ ...f, name:     e.target.value }))} required size="small" /></Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}><TextField fullWidth label="Email"      name="email"    value={form.email}    onChange={e => setForm(f => ({ ...f, email:    e.target.value }))} required size="small" type="email" /></Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}><TextField fullWidth label="Password"   name="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required size="small" type="password" /></Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <TextField select fullWidth label="Role" name="role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required size="small">
                        {["admin","staff","student"].map(r => <MenuItem key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</MenuItem>)}
                      </TextField>
                    </Grid>
                  </Grid>
                  <button type="submit" className="uc-create-btn"><PersonAdd sx={{ fontSize: "0.95rem" }} /> Create User</button>
                </form>
              </div>

              <div className="eco-section-label eco-fade" style={{ marginBottom: 10 }}>
                Recent Registrations <span className="eco-section-count">{recentUsers.length}</span>
              </div>
              <Paper elevation={0} sx={PAPER_SX} className="eco-fade">
                <TableContainer>
                  <Table size="small">
                    <TableHead>{HDR_PLAIN}</TableHead>
                    <TableBody>
                      {recentUsers.length === 0
                        ? <TableRow><TableCell colSpan={5} sx={{ ...TD, textAlign: "center", color: "#A09080", py: 4 }}>No users yet</TableCell></TableRow>
                        : recentUsers.map((u, i) => <PlainRow key={u._id} u={u} idx={i + 1} />)}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              <div className="eco-section-label eco-fade" style={{ marginBottom: 12 }}>
                All Users <span className="eco-section-count">{allFiltered.length}</span>
              </div>
              <FilterBar search={allQ} onSearch={setAllQ} role={allRole} onRole={setAllRole} showStatus={false} count={allFiltered.length} />
              <PaginatedTable rows={allFiltered} headerRow={HDR_ACTIONS} colSpan={6}
                renderRow={(u, i) => <AllUserRow key={u._id} u={u} idx={i} onEdit={setEditUser} onDelete={setDeleteUser} />}
                emptyMsg="No users match your filters." />
            </>
          )}

          {/* PENDING TAB */}
          {tab === "pending" && (
            <>
              <div className="eco-section-label eco-fade" style={{ marginBottom: 12 }}>
                Pending Approvals <span className="eco-section-count">{penFiltered.length}</span>
              </div>
              <FilterBar search={penQ} onSearch={setPenQ} role={penRole} onRole={setPenRole} showStatus={false} count={penFiltered.length} />
              {penFiltered.length === 0
                ? <EmptyState icon="✅" msg="No pending users — all caught up!" />
                : <PaginatedTable rows={penFiltered} headerRow={HDR_ACTIONS} colSpan={6}
                    renderRow={(u, i) => <PendingRow key={u._id} u={u} idx={i} onApprove={handleApprove} onReject={handleReject} />}
                    emptyMsg="No pending users match your filters." />}
            </>
          )}

          {/* APPROVED TAB */}
          {tab === "approved" && (
            <>
              <div className="eco-section-label eco-fade" style={{ marginBottom: 12 }}>
                Approved Users <span className="eco-section-count">{counts.approved}</span>
              </div>
              <ApprovedTable users={users} />
            </>
          )}

          {/* REJECTED TAB */}
          {tab === "rejected" && (
            <>
              <div className="eco-section-label eco-fade" style={{ marginBottom: 12 }}>
                Rejected Users <span className="eco-section-count">{rejFiltered.length}</span>
              </div>
              <FilterBar search={rejQ} onSearch={setRejQ} role={rejRole} onRole={setRejRole} showStatus={false} count={rejFiltered.length} />
              {rejFiltered.length === 0
                ? <EmptyState icon="👥" msg="No rejected users found." />
                : <PaginatedTable rows={rejFiltered} headerRow={HDR_PLAIN} colSpan={5}
                    renderRow={(u, i) => <PlainRow key={u._id} u={u} idx={i} />}
                    emptyMsg="No rejected users match your filters." />}
            </>
          )}
        </>
      )}
    </div>
  );
}