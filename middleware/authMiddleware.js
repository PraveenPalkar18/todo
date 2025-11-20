// middleware/authMiddleware.js
module.exports = {
  ensureAuth: (req, res, next) => {
    if (req.session && req.session.userId) {
      return next();
    }
    req.session.message = { type: "warning", text: "Please log in first." };
    res.redirect("/login");
  },

  forwardAuth: (req, res, next) => {
    if (req.session && req.session.userId) {
      return res.redirect("/dashboard");
    }
    next();
  }
};
