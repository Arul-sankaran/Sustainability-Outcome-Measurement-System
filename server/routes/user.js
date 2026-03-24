const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const User    = require("../models/model").User;  // adjust path if needed
const { protect, authorize } = require("../middleware/authMiddleware.js");

/* ── GET all users (paginated) ── */
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page  = parseInt(req.query.page)  || 1;
    const skip  = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ── POST create user (admin only, bypasses approval) ── */
router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered." });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({
      name, email,
      password: hashed,
      role:   role   || "student",
      status: "approved", 
    });

    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, status: user.status });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ── PUT approve ── */
router.put("/approve/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ── PUT reject ── */
router.put("/reject/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ── PUT edit user (name, email, role, status) ── */
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    if (email) {
      const conflict = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (conflict) return res.status(400).json({ message: "Email already in use." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, status },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ── DELETE user ── */
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;