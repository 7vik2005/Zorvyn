import User from "../models/user.model.js";
import mongoose from "mongoose";

/**
 * Utility: Escape special regex characters from user input
 */
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Utility: Validate and clamp pagination params
 */
const sanitizePagination = (page, limit) => {
  let p = parseInt(page) || 1;
  let l = parseInt(limit) || 10;

  if (p < 1) p = 1;
  if (l < 1) l = 1;
  if (l > 100) l = 100;

  return { page: p, limit: l };
};

/**
 * GET ALL USERS (Admin)
 */
export const getAllUsers = async (query) => {
  let { page, limit, role, status, search } = query;

  const pagination = sanitizePagination(page, limit);
  page = pagination.page;
  limit = pagination.limit;

  const skip = (page - 1) * limit;

  const filter = { isDeleted: false };

  // Filtering
  if (role && ["viewer", "analyst", "admin"].includes(role)) {
    filter.role = role;
  }

  if (status && ["active", "inactive"].includes(status)) {
    filter.status = status;
  }

  // Search (name/email) — with regex escaping
  if (search && typeof search === "string" && search.trim().length > 0) {
    const safeSearch = escapeRegex(search.trim().substring(0, 100));
    filter.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
    ];
  }

  // Fetch Users
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  return {
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    count: users.length,
    data: users,
  };
};

/**
 * GET SINGLE USER
 */
export const getUserById = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const user = await User.findOne({
    _id: userId,
    isDeleted: false,
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

/**
 * UPDATE USER (role/status)
 */
export const updateUser = async (adminId, userId, data) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const user = await User.findOne({
    _id: userId,
    isDeleted: false,
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Prevent self-role change
  if (adminId.toString() === userId.toString()) {
    throw new Error("You cannot modify your own role/status");
  }

  // Update role
  if (data.role) {
    if (!["viewer", "analyst", "admin"].includes(data.role)) {
      throw new Error("Invalid role. Must be 'viewer', 'analyst', or 'admin'");
    }
    user.role = data.role;
  }

  // Update status
  if (data.status) {
    if (!["active", "inactive"].includes(data.status)) {
      throw new Error("Invalid status. Must be 'active' or 'inactive'");
    }
    user.status = data.status;
  }

  await user.save();

  return user;
};

/**
 * DELETE USER (Soft Delete)
 */
export const deleteUser = async (adminId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const user = await User.findOne({
    _id: userId,
    isDeleted: false,
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Prevent self-delete
  if (adminId.toString() === userId.toString()) {
    throw new Error("You cannot delete your own account");
  }

  // Prevent deleting the last admin
  if (user.role === "admin") {
    const activeAdminCount = await User.countDocuments({
      role: "admin",
      isDeleted: false,
      status: "active",
    });

    if (activeAdminCount <= 1) {
      throw new Error(
        "Cannot delete the last active admin. Promote another user to admin first.",
      );
    }
  }

  user.isDeleted = true;
  user.status = "inactive";
  await user.save();

  return { message: "User deleted successfully" };
};
