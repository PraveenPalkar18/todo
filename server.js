// server.js
require("dotenv").config();
const path = require("path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const morgan = require("morgan");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const todoRoutes = require("./routes/todos");

// 1) Connect DB
connectDB();

// 2) Create app
const app = express();

// 3) View engine + layouts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout"); // uses views/layout.ejs

// 4) Static files
app.use(express.static(path.join(__dirname, "public")));

// 5) Body parser
app.use(express.urlencoded({ extended: true }));

// 6) Logger
app.use(morgan("dev"));

// 7) Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallbacksecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

// 8) Flash-style messages via session
app.use((req, res, next) => {
  res.locals.message = req.session.message || null;
  delete req.session.message;
  res.locals.currentPath = req.path;
  res.locals.userName = req.session.userName;
  next();
});

// 9) Routes
app.use("/", authRoutes);
app.use("/", todoRoutes);

app.get("/", (req, res) => {
  if (req.session.userId) return res.redirect("/dashboard");
  res.redirect("/login");
});

// 10) Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
