const express = require("express");

const router = express.Router();

const { Idea } = require("../models/model.js");

const { protect, authorize } = require("../middleware/authMiddleware");

// GET ALL IDEAS

router.get("/", protect, authorize("admin", "staff","student"), async (req, res, next) => {
  try {
    const ideas = await Idea.find().sort({ createdAt: -1 });
    res.status(200).json(ideas);
  } catch (error) {
    next(error);
  }
});

// SUBMIT IDEA
// Any approved user can submit

router.post("/", protect, async (req, res, next) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description) {
      res.status(400);
      throw new Error("Title and description are required");
    }

    const idea = await Idea.create({
      title,
      description,
      category,
      submittedBy: req.user.name
    });

    res.status(201).json(idea);
  } catch (error) {
    next(error);
  }
});

// DELETE IDEA
// Admin only

router.delete("/:id", protect, authorize("admin"), async (req, res, next) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      res.status(404);
      throw new Error("Idea not found");
    }

    await idea.deleteOne();

    res.status(200).json({ message: "Idea deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;