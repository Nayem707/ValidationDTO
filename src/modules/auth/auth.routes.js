const express = require("express");
const authController = require("./auth.controller");
const { authenticateToken } = require("../../middleware/auth");

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify", authController.verifyToken);

// Protected routes (authentication required)
router.use(authenticateToken);

router.get("/profile", authController.getProfile);
router.post("/change-password", authController.changePassword);
router.post("/logout", authController.logout);

module.exports = router;
