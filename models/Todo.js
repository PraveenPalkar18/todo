// models/Todo.js
const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    },
    dueDate: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Todo", todoSchema);
