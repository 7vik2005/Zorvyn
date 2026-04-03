import User from "../models/user.model.js";

/**
 * Utility: Validate email format (extra safety beyond schema)
 */
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Utility: Strong password validation
 * At least 6 chars (you can upgrade later)
 */
const isStrongPassword = (password) => {
  return typeof password === "string" && password.length >= 6;
};

/**
 * REGISTER USER
 */
export const registerUser = async (data) => {
  const { name, email, password, role } = data;

  // Basic Field Validation
  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }

  // Validate types
  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    throw new Error("Name, email, and password must be strings");
  }

  // Sanitize and validate name
  const trimmedName = name.trim();
  if (trimmedName.length < 2) {
    throw new Error("Name must be at least 2 characters");
  }
  if (trimmedName.length > 50) {
    throw new Error("Name cannot exceed 50 characters");
  }

  if (!isValidEmail(email)) {
    throw new Error("Invalid email format");
  }

  if (!isStrongPassword(password)) {
    throw new Error("Password must be at least 6 characters long");
  }

  // Normalize Input
  const normalizedEmail = email.toLowerCase().trim();

  // Check Existing User
  const existingUser = await User.findOne({
    email: normalizedEmail,
    isDeleted: false,
  });

  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  // Role Safety Check
  // Prevent anyone from registering as admin directly
  let assignedRole = "viewer";

  if (role && ["viewer", "analyst"].includes(role)) {
    assignedRole = role;
  }

  // Create User
  const user = await User.create({
    name: trimmedName,
    email: normalizedEmail,
    password, // hashing handled in model
    role: assignedRole,
  });

  // Return Safe User
  return user;
};

/**
 * LOGIN USER
 */
export const loginUser = async (email, password) => {
  // Validation
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  if (typeof email !== "string" || typeof password !== "string") {
    throw new Error("Email and password must be strings");
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (!isValidEmail(normalizedEmail)) {
    throw new Error("Invalid email format");
  }

  // Find User (include password)
  const user = await User.findOne({
    email: normalizedEmail,
    isDeleted: false,
  }).select("+password");

  if (!user) {
    // Avoid revealing user existence
    throw new Error("Invalid email or password");
  }

  // Compare Password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Check User Status
  if (user.status !== "active") {
    throw new Error("Your account is inactive. Contact admin.");
  }

  // Update Last Login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Strip password before returning
  user.password = undefined;

  return user;
};

/**
 * Get Current User Profile
 */
export const getUserProfile = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
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
