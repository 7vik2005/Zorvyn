import express from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * ROUTES: /api/dashboard
 */

/**
 * @route   GET /api/dashboard
 * @desc    Get dashboard analytics (totals, trends, etc.)
 * @access  Private (Analyst + Admin only)
 */
router.get("/", protect, authorize("analyst", "admin"), getDashboard);

export default router;
