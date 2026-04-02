import User from "../models/user.model.js";
import mongoose from "mongoose";

/**
 * GET ALL USERS (Admin)
 */
export const getAllUsers = async (query) => {
  let { page = 1, limit = 10, role, status, search } = query;

  page = parseInt(page);
  limit = parseInt(limit);

  const skip = (page - 1) * limit;

  const filter = { isDeleted: false };

  // -------------------------
  // 🔍 Filtering
  // -------------------------
  if (role && ["viewer", "analyst", "admin"].includes(role)) {
    filter.role = role;
  }

  if (status && ["active", "inactive"].includes(status)) {
    filter.status = status;
  }

  // -------------------------
  // 🔎 Search (name/email)
  // -------------------------
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // -------------------------
  // 📊 Fetch Users
  // -------------------------
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  return {
    total,
    page,
    pages: Math.ceil(total / limit),
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

  // -------------------------
  // 🚫 Prevent self-role change (optional but strong)
  // -------------------------
  if (adminId.toString() === userId.toString()) {
    throw new Error("You cannot modify your own role/status");
  }

  // -------------------------
  // 🔄 Update role
  // -------------------------
  if (data.role) {
    if (!["viewer", "analyst", "admin"].includes(data.role)) {
      throw new Error("Invalid role");
    }
    user.role = data.role;
  }

  // -------------------------
  // 🔄 Update status
  // -------------------------
  if (data.status) {
    if (!["active", "inactive"].includes(data.status)) {
      throw new Error("Invalid status");
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

  // -------------------------
  // 🚫 Prevent self-delete
  // -------------------------
  if (adminId.toString() === userId.toString()) {
    throw new Error("You cannot delete your own account");
  }

  user.isDeleted = true;
  await user.save();

  return { message: "User deleted successfully" };
};
