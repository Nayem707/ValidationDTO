const jwt = require("jsonwebtoken");
const { promisify } = require("util");

class JWTService {
  constructor() {
    this.secret = process.env.JWT_SECRET || "your-super-secret-jwt-key";
    this.expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  }

  /**
   * Generate JWT token
   * @param {Object} payload - Data to encode in token
   * @returns {String} JWT token
   */
  generateToken(payload) {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
      issuer: "ValidationDTO-API",
    });
  }

  /**
   * Verify JWT token
   * @param {String} token - JWT token to verify
   * @returns {Object} Decoded token payload
   */
  async verifyToken(token) {
    try {
      const verify = promisify(jwt.verify);
      return await verify(token, this.secret);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * Decode JWT token without verification
   * @param {String} token - JWT token to decode
   * @returns {Object} Decoded token payload
   */
  decodeToken(token) {
    return jwt.decode(token);
  }

  /**
   * Extract token from Authorization header
   * @param {String} authHeader - Authorization header value
   * @returns {String|null} Extracted token or null
   */
  extractTokenFromHeader(authHeader) {
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }
    return null;
  }
}

module.exports = new JWTService();
