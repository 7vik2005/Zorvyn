/**
 * Global Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";

  // --------------------------------------------------
  // Handle Mongoose Bad ObjectId
  // --------------------------------------------------
  if (err.name === "CastError") {
    message = "Invalid resource ID";
    statusCode = 400;
  }

  // --------------------------------------------------
  // Handle Duplicate Key Error
  // --------------------------------------------------
  if (err.code === 11000) {
    message = "Duplicate field value entered";
    statusCode = 400;
  }

  // --------------------------------------------------
  // Handle Validation Errors
  // --------------------------------------------------
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    statusCode = 400;
  }

  // --------------------------------------------------
  // Final Response
  // --------------------------------------------------
  res.status(statusCode).json({
    success: false,
    message,
    // show stack only in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
