const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/model.js");

const router = express.Router();
//helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // If rejected — allow re-registration, reset their account
      if (existingUser.status === "rejected") {
        const hashed = await bcrypt.hash(password, 10);
        existingUser.name = name;
        existingUser.password = hashed;
        existingUser.status = "pending";
        existingUser.role = email === "admin@bit.ac.in" ? "admin" : "student";
        await existingUser.save();
        return res.status(200).json({ message: "Re-registration successful. Awaiting admin approval." });
      }

      // If pending or approved — block
      return res.status(400).json({ message: "Email already registered." });
    }

    // New user — normal registration
    const hashed = await bcrypt.hash(password, 10);
    const role = email === "admin@bit.ac.in" ? "admin" : "student";

    await User.create({ name, email, password: hashed, role, status: "pending" });
    res.status(201).json({ message: "Registration successful. Awaiting admin approval." });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN 
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(
      password.trim(),
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status === "pending") {
      return res.status(403).json({ message: "Your account is not yet approved by the admin." });
    }

    if (user.status === "rejected") {
      return res.status(403).json({ message: "Your request has been rejected by the admin. Please try again." });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;