import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/**
 * Middleware: Protect Routes (JWT Authentication)
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // --------------------------------------------------
    // 1. Extract Token from Authorization Header
    // --------------------------------------------------
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // --------------------------------------------------
    // 2. Check if Token Exists
    // --------------------------------------------------
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // --------------------------------------------------
    // 3. Verify Token
    // --------------------------------------------------
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      // Handle specific JWT errors
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired. Please login again.",
        });
      }

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Authentication failed.",
      });
    }

    // --------------------------------------------------
    // 4. Validate Decoded Payload
    // --------------------------------------------------
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    // --------------------------------------------------
    // 5. Fetch User from Database
    // --------------------------------------------------
    const user = await User.findById(decoded.id).select(
      "_id role status isDeleted",
    );

    // --------------------------------------------------
    // 6. Check if User Exists
    // --------------------------------------------------
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Token invalid.",
      });
    }

    // --------------------------------------------------
    // 7. Check Soft Delete
    // --------------------------------------------------
    if (user.isDeleted) {
      return res.status(401).json({
        success: false,
        message: "User account has been deleted.",
      });
    }

    // --------------------------------------------------
    // 8. Check User Status
    // --------------------------------------------------
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "User account is inactive.",
      });
    }

    // --------------------------------------------------
    // 9. Attach User to Request
    // --------------------------------------------------
    req.user = {
      id: user._id,
      role: user.role,
    };

    // --------------------------------------------------
    // 10. Continue to Next Middleware
    // --------------------------------------------------
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};
