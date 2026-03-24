const mongoose = require("mongoose");

//  USER SCHEMA 
const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true},
    password: { type: String, required: true},
    role: { type: String, enum: ["admin", "staff", "student"], default: "student"},
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
  },
  { timestamps: true }
);

//  IDEA SCHEMA 
const ideaSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    submittedBy: { type: String },
    category: { type: String, enum: ["idea", "feedback"], default: "idea" },
  },
  { timestamps: true }
);

//  GOAL SCHEMA
const goalSchema = mongoose.Schema( 
  {
    title: { type: String, required: true },
    category: { type: String, enum: ["water", "electricity", "waste"], required: true},
    target: { type: Number, required: true },
    current: { type: Number, default: 0 },
    unit: { type: String, required: true},
    duration: { type: String},
    description: { type: String}
  },
  { timestamps: true }
);


// USAGE SCHEMA 
const usageSchema = mongoose.Schema(
  {
    category: {type: String, enum: ["water", "electricity", "waste"], required: true },
    amount: { type: Number, required: true},
    unit: { type: String, required: true},
    usageDate: { type: Date, required: true},
    submittedBy: { type: String}
  },
  { timestamps: true }
);

const Usage = mongoose.model("Usage", usageSchema);
const Goal = mongoose.model("Goal", goalSchema);
const Idea = mongoose.model("Ideas", ideaSchema);
const User = mongoose.model("User", userSchema);


module.exports = { Idea, Usage, Goal, User }