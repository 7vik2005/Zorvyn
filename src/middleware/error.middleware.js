/**
 * Global Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Use err.statusCode if set, then check res.statusCode, fallback to 500
  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || "Internal Server Error";

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    message = `Invalid ${err.path || "resource"} ID: ${err.value}`;
    statusCode = 400;
  }

  // Handle Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(", ") || "field";
    message = `Duplicate value for: ${field}`;
    statusCode = 409;
  }

  // Handle Validation Errors
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    statusCode = 400;
  }

  // Handle JWT Errors (fallback — auth middleware has its own)
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token";
    statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    message = "Token expired. Please login again.";
    statusCode = 401;
  }

  // Handle Malformed JSON Body
  if (err.type === "entity.parse.failed") {
    message = "Invalid JSON in request body";
    statusCode = 400;
  }

  // Final Response
  res.status(statusCode).json({
    success: false,
    message,
    // show stack only in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
