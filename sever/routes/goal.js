require("dotenv").config();

const express = require("express");

const { Goal } = require("../models/model.js");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const goals = await Goal.find();
  res.json(goals);
});

router.post("/", protect, authorize("admin", "staff"), async (req, res) => {
  const goal = await Goal.create(req.body);
  res.status(201).json(goal);
});

router.put("/:id", protect, authorize("admin"), async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  if (goal) {
    Object.assign(goal, req.body);
    await goal.save();
    res.json(goal);
  } else {
    res.status(404);
    throw new Error("Goal not found");
  }
});

router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  await Goal.findByIdAndDelete(req.params.id);
  res.json({ message: "Goal deleted" });
});

module.exports = router;