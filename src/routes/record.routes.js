import express from "express";

import {
  create,
  getAll,
  update,
  remove,
} from "../controllers/record.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * ROUTES: /api/records
 */

/**
 * @route   GET /api/records
 * @desc    Get all records (with filters, pagination, search)
 * @access  Private (All authenticated roles)
 */
router.get("/", protect, getAll);

/**
 * @route   POST /api/records
 * @desc    Create a new financial record
 * @access  Private (Admin only)
 */
router.post("/", protect, authorize("admin"), create);

/**
 * @route   PUT /api/records/:id
 * @desc    Update a financial record
 * @access  Private (Admin only)
 */
router.put("/:id", protect, authorize("admin"), update);

/**
 * @route   DELETE /api/records/:id
 * @desc    Soft delete a financial record
 * @access  Private (Admin only)
 */
router.delete("/:id", protect, authorize("admin"), remove);

export default router;
