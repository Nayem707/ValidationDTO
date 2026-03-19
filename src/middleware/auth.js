const jwtService = require("../utils/jwt");
const { sendError } = require("../utils/response");

/**
 * JWT Authentication Middleware
 * Verifies JWT token and adds user data to request object
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return sendError(res, "Access token is required", 401);
    }

    const decoded = await jwtService.verifyToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    return sendError(res, "Invalid or expired token", 401);
  }
};

/**
 * Role-based Authorization Middleware
 * @param {Array} allowedRoles - Array of roles allowed to access the route
 */
const authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Authentication required", 401);
    }

    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return sendError(res, "Insufficient permissions", 403);
    }

    next();
  };
};

/**
 * Optional Authentication Middleware
 * Adds user data to request if token is present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = await jwtService.verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  optionalAuth,
};
