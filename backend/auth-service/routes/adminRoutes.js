const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const {
  authenticateAdmin,
  requireSuperAdmin,
  validateRefreshToken,
} = require("../middleware/authMiddleware");

// ============================================
// Public Routes (No Authentication)
// ============================================

// Login
router.post("/login", adminController.login);

// Refresh token
router.post("/refresh", validateRefreshToken, adminController.refresh);

// ============================================
// Protected Routes (Authentication Required)
// ============================================

// Logout
router.post("/logout", authenticateAdmin, adminController.logout);

// Logout from all devices
router.post("/logout-all", authenticateAdmin, adminController.logoutAll);

// Profile routes
router.get("/me", authenticateAdmin, adminController.getProfile);
router.put("/me", authenticateAdmin, adminController.updateProfile);

// Change password
router.post("/change-password", authenticateAdmin, adminController.changePassword);

// Session management
router.get("/sessions", authenticateAdmin, adminController.getSessions);
router.delete("/sessions/:sessionId", authenticateAdmin, adminController.revokeSession);

// ============================================
// Admin Management Routes (SUPER_ADMIN Only)
// ============================================

// Get admin statistics (before :adminId to avoid conflict)
router.get("/manage/stats", authenticateAdmin, requireSuperAdmin, adminController.getStats);

// List all admins
router.get("/manage", authenticateAdmin, requireSuperAdmin, adminController.getAllAdmins);

// Create new admin
router.post("/manage", authenticateAdmin, requireSuperAdmin, adminController.createAdmin);

// Get admin by ID
router.get("/manage/:adminId", authenticateAdmin, requireSuperAdmin, adminController.getAdminById);

// Update admin
router.put("/manage/:adminId", authenticateAdmin, requireSuperAdmin, adminController.updateAdmin);

// Change admin role
router.put(
  "/manage/:adminId/role",
  authenticateAdmin,
  requireSuperAdmin,
  adminController.changeRole
);

// Deactivate admin
router.delete(
  "/manage/:adminId",
  authenticateAdmin,
  requireSuperAdmin,
  adminController.deactivateAdmin
);

module.exports = router;
