const { sendError } = require("../utils/response");

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = null;

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = err.details || err.errors;
  } else if (err.name === "ZodError") {
    statusCode = 400;
    message = "Validation failed";
    errors = err.errors.map((error) => ({
      field: error.path.join("."),
      message: error.message,
    }));
  } else if (err.code === "P2002") {
    // Prisma unique constraint error
    statusCode = 409;
    message = "Duplicate entry error";
  } else if (err.code === "P2025") {
    // Prisma record not found error
    statusCode = 404;
    message = "Record not found";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  } else if (err.message.includes("not found")) {
    statusCode = 404;
  } else if (err.message.includes("already exists")) {
    statusCode = 409;
  } else if (err.message.includes("unauthorized")) {
    statusCode = 401;
  } else if (err.message.includes("forbidden")) {
    statusCode = 403;
  }

  return sendError(res, message, statusCode, errors);
};

/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res) => {
  return sendError(
    res,
    `Route ${req.method} ${req.originalUrl} not found`,
    404,
  );
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
