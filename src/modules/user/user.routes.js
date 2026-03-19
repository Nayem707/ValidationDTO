const express = require("express");
const userController = require("./user.controller");
const { authenticateToken, authorizeRoles } = require("../../middleware/auth");

const router = express.Router();

// Public routes (no authentication required)
router.get("/search", userController.searchUsers);

// Protected routes (authentication required)
router.use(authenticateToken);

// User profile routes
router.get("/profile", userController.getMyProfile);

// General user routes
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.patch("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.get("/:id/stats", userController.getUserStats);

// Admin-only routes
router.patch(
  "/:id/role",
  authorizeRoles(["admin"]),
  userController.updateUserRole,
);
router.patch(
  "/:id/restore",
  authorizeRoles(["admin"]),
  userController.restoreUser,
);

module.exports = router;
