// backend/routes/dashboardRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

// Temporary test route
router.get("/", authMiddleware, (req, res) => {
  res.json({
    message: "Dashboard working ✅",
    user: req.user
  });
});

module.exports = router;