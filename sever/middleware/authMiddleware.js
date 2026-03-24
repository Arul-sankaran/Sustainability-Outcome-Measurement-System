const jwt = require("jsonwebtoken");

const { User } = require("../models/model.js");

// Protect Middleware
const protect = async (req, res, next) => {
  try {
    let token;

    //  Check Authorization Header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find User
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Approval Check (Admin bypass allowed)
    if (
      user.role !== "admin" &&
      user.status?.toLowerCase() !== "approved"
    ) {
      return res
        .status(403)
        .json({ message: "Your account is not yet approved" });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Role Authorization Middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Not authorized for this action" });
    }
    next();
  };
};

module.exports = { protect, authorize };