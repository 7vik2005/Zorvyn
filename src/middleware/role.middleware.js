/**
 * Middleware: Role-Based Access Control (RBAC)
 *
 * Usage:
 * authorize("admin")
 * authorize("admin", "analyst")
 */

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user exists in request
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Access denied. User not authenticated.",
        });
      }

      const userRole = req.user.role;

      // Validate role existence
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: "User role not defined.",
        });
      }

      // If no roles specified → allow access (fallback safety)
      if (!allowedRoles || allowedRoles.length === 0) {
        return next();
      }

      // Check if user's role is allowed
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Role '${userRole}' is not permitted.`,
        });
      }

      // Authorized → proceed
      next();
    } catch (error) {
      console.error("RBAC Middleware Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error during authorization.",
      });
    }
  };
};
