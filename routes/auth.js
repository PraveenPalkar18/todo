// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { forwardAuth } = require("../middleware/authMiddleware");

// GET Register
router.get("/register", forwardAuth, (req, res) => {
  res.render("register", { title: "Register" });
});

// POST Register
router.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    if (!name || !email || !password || !confirmPassword) {
      req.session.message = { type: "danger", text: "All fields are required." };
      return res.redirect("/register");
    }

    if (password !== confirmPassword) {
      req.session.message = { type: "danger", text: "Passwords do not match." };
      return res.redirect("/register");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.session.message = { type: "danger", text: "Email already registered." };
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.message = { type: "success", text: "Welcome! Account created." };

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    req.session.message = { type: "danger", text: "Something went wrong." };
    res.redirect("/register");
  }
});

// GET Login
router.get("/login", forwardAuth, (req, res) => {
  res.render("login", { title: "Login" });
});

// POST Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      req.session.message = { type: "danger", text: "All fields are required." };
      return res.redirect("/login");
    }

    const user = await User.findOne({ email });
    if (!user) {
      req.session.message = { type: "danger", text: "Invalid credentials." };
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.session.message = { type: "danger", text: "Invalid credentials." };
      return res.redirect("/login");
    }

    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.message = { type: "success", text: "Logged in successfully." };

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    req.session.message = { type: "danger", text: "Something went wrong." };
    res.redirect("/login");
  }
});

// GET Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
