import jwt from "jsonwebtoken";

/**
 * Generate JWT Token
 * @param {string} userId - MongoDB user ID
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  if (!userId) {
    throw new Error("User ID is required to generate token");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  try {
    const token = jwt.sign(
      {
        id: userId, // payload
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE || "7d",
      },
    );

    return token;
  } catch (error) {
    throw new Error("Token generation failed");
  }
};

export default generateToken;
