// backend/auth-service/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// ============================================
// Public Student Routes (No Authentication)
// ============================================

// Create new signup
router.post("/signup", studentController.createSignup);

// Get signup confirmation
router.get("/signup/:signupId", studentController.getSignupConfirmation);

// Get all signups for a student
router.get("/:studentId/signups", studentController.getStudentSignups);

// Update opt-out preferences
router.patch("/:studentId/opt-out", studentController.updateOptOut);

module.exports = router;
