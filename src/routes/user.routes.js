import express from "express";

import {
  getUsers,
  getUser,
  update,
  remove,
} from "../controllers/user.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * --------------------------------------------------
 * 👤 ROUTES: /api/users
 * --------------------------------------------------
 */

/**
 * @route   GET /api/users
 * @desc    Get all users (with filters, pagination)
 * @access  Private (Admin only)
 */
router.get("/", protect, authorize("admin"), getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get single user
 * @access  Private (Admin only)
 */
router.get("/:id", protect, authorize("admin"), getUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (role/status)
 * @access  Private (Admin only)
 */
router.put("/:id", protect, authorize("admin"), update);

/**
 * @route   DELETE /api/users/:id
 * @desc    Soft delete user
 * @access  Private (Admin only)
 */
router.delete("/:id", protect, authorize("admin"), remove);

export default router;
