// routes/todos.js
const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");
const { ensureAuth } = require("../middleware/authMiddleware");

// GET Dashboard (list todos)
router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.session.userId }).sort({ createdAt: -1 });
    res.render("dashboard", {
      title: "Dashboard",
      todos,
      userName: req.session.userName
    });
  } catch (err) {
    console.error(err);
    req.session.message = { type: "danger", text: "Could not load your todos." };
    res.redirect("/login");
  }
});

// CREATE Todo
router.post("/todos", ensureAuth, async (req, res) => {
  const { title, description, priority, dueDate } = req.body;
  try {
    if (!title) {
      req.session.message = { type: "danger", text: "Title is required." };
      return res.redirect("/dashboard");
    }

    await Todo.create({
      user: req.session.userId,
      title,
      description,
      priority: priority || "Medium",
      dueDate: dueDate || null
    });

    req.session.message = { type: "success", text: "Task added." };
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    req.session.message = { type: "danger", text: "Could not create task." };
    res.redirect("/dashboard");
  }
});

// TOGGLE Complete
router.post("/todos/:id/toggle", ensureAuth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.session.userId });
    if (!todo) {
      req.session.message = { type: "warning", text: "Task not found." };
      return res.redirect("/dashboard");
    }
    todo.isCompleted = !todo.isCompleted;
    await todo.save();

    req.session.message = { type: "success", text: "Task updated." };
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    req.session.message = { type: "danger", text: "Could not update task." };
    res.redirect("/dashboard");
  }
});

// UPDATE Todo (title + description + priority + dueDate)
router.post("/todos/:id/update", ensureAuth, async (req, res) => {
  const { title, description, priority, dueDate } = req.body;
  try {
    await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.session.userId },
      { title, description, priority, dueDate: dueDate || null },
      { new: true }
    );
    req.session.message = { type: "success", text: "Task edited." };
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    req.session.message = { type: "danger", text: "Could not edit task." };
    res.redirect("/dashboard");
  }
});

// DELETE Todo
router.post("/todos/:id/delete", ensureAuth, async (req, res) => {
  try {
    await Todo.findOneAndDelete({ _id: req.params.id, user: req.session.userId });
    req.session.message = { type: "success", text: "Task deleted." };
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    req.session.message = { type: "danger", text: "Could not delete task." };
    res.redirect("/dashboard");
  }
});

module.exports = router;
