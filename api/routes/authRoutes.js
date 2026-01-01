// api/routes/authRoutes.js
const express = require("express");
const passport = require("passport");
const router = express.Router();

// Iniciar login con Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback de Google
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/home");
  }
);

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/login"));
});

// 🔑 Exportar el router
module.exports = router;
