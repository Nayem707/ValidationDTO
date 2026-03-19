const bcrypt = require("bcryptjs");
const authRepository = require("./auth.repository");
const jwtService = require("../../utils/jwt");

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user and token
   */
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await authRepository.findUserByEmail(userData.email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const user = await authRepository.createUser({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwtService.generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        user,
        token,
        message: "User registered successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} User and token
   */
  async login(credentials) {
    try {
      // Find user
      const user = await authRepository.findUserByEmail(credentials.email);
      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }

      // Update last login
      await authRepository.updateLastLogin(user.id);

      // Generate JWT token
      const token = jwtService.generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token,
        message: "Login successful",
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user profile
   * @param {String} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getProfile(userId) {
    try {
      const user = await authRepository.findUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user password
   * @param {String} userId - User ID
   * @param {Object} passwordData - Password change data
   * @returns {Promise<Object>} Success message
   */
  async changePassword(userId, passwordData) {
    try {
      // Get user with password
      const user = await authRepository.findUserByEmail(
        (await authRepository.findUserById(userId)).email,
      );

      if (!user) {
        throw new Error("User not found");
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        passwordData.currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(
        passwordData.newPassword,
        saltRounds,
      );

      // Update password
      await authRepository.updatePassword(userId, hashedNewPassword);

      return { message: "Password changed successfully" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify JWT token
   * @param {String} token - JWT token
   * @returns {Promise<Object>} Decoded token
   */
  async verifyToken(token) {
    try {
      const decoded = await jwtService.verifyToken(token);

      // Verify user still exists
      const user = await authRepository.findUserById(decoded.id);
      if (!user) {
        throw new Error("User not found");
      }

      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
}

module.exports = new AuthService();
