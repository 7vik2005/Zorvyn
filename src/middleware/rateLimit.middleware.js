import rateLimit from "express-rate-limit";

/**
 * General API Rate Limiter
 * Applies to all routes
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  max: 100, // max 100 requests per IP

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },

  standardHeaders: true, // RateLimit-* headers
  legacyHeaders: false,

  // Skip successful requests? (optional)
  // skipSuccessfulRequests: false,
});

/**
 * Strict limiter for auth routes (login/register)
 */
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes

  max: 10, // max 10 login attempts

  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});
