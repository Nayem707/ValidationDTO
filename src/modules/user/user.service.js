const userRepository = require("./user.repository");

class UserService {
  /**
   * Get all users with filters and pagination
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Users with pagination info
   */
  async getAllUsers(filters = {}) {
    try {
      return await userRepository.findMany(filters);
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  /**
   * Get user by ID
   * @param {String} id - User ID
   * @returns {Promise<Object|null>} User or null
   */
  async getUserById(id) {
    try {
      const user = await userRepository.findById(id);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user profile with statistics
   * @param {String} userId - User ID
   * @returns {Promise<Object>} User profile with stats
   */
  async getUserProfile(userId) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const stats = await userRepository.getUserStats(userId);

      return {
        ...user,
        statistics: stats,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {String} id - User ID
   * @param {Object} updateData - Update data from DTO
   * @param {String} requestingUserId - ID of user making the request
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(id, updateData, requestingUserId) {
    try {
      // Check if user exists
      const existingUser = await userRepository.findById(id);
      if (!existingUser) {
        throw new Error("User not found");
      }

      // Users can only update their own profile (unless admin)
      const requestingUser = await userRepository.findById(requestingUserId);
      if (requestingUserId !== id && requestingUser.role !== "admin") {
        throw new Error("You can only update your own profile");
      }

      // If email is being updated, check for uniqueness
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await userRepository.findByEmail(updateData.email);
        if (emailExists) {
          throw new Error("User with this email already exists");
        }
      }

      return await userRepository.update(id, updateData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user (soft delete)
   * @param {String} id - User ID
   * @param {String} requestingUserId - ID of user making the request
   * @throws {Error} If user not found or insufficient permissions
   */
  async deleteUser(id, requestingUserId) {
    try {
      // Check if user exists
      const existingUser = await userRepository.findById(id);
      if (!existingUser) {
        throw new Error("User not found");
      }

      // Only admin or the user themselves can delete
      const requestingUser = await userRepository.findById(requestingUserId);
      if (requestingUserId !== id && requestingUser.role !== "admin") {
        throw new Error("You can only delete your own account");
      }

      await userRepository.softDelete(id);
      return { message: "User deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search users
   * @param {String} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} Search results with pagination
   */
  async searchUsers(searchTerm, filters = {}) {
    try {
      const searchFilters = {
        ...filters,
        search: searchTerm,
      };
      return await userRepository.findMany(searchFilters);
    } catch (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }
  }

  /**
   * Get user statistics
   * @param {String} userId - User ID
   * @returns {Promise<Object>} User statistics
   */
  async getUserStatistics(userId) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      return await userRepository.getUserStats(userId);
    } catch (error) {
      throw new Error(`Failed to fetch user statistics: ${error.message}`);
    }
  }

  /**
   * Update user role (admin only)
   * @param {String} userId - User ID to update
   * @param {String} newRole - New role
   * @param {String} requestingUserId - ID of user making the request
   * @returns {Promise<Object>} Updated user
   */
  async updateUserRole(userId, newRole, requestingUserId) {
    try {
      // Check if requesting user is admin
      const requestingUser = await userRepository.findById(requestingUserId);
      if (requestingUser.role !== "admin") {
        throw new Error("Only administrators can update user roles");
      }

      // Check if target user exists
      const targetUser = await userRepository.findById(userId);
      if (!targetUser) {
        throw new Error("User not found");
      }

      return await userRepository.updateRole(userId, newRole);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Restore deleted user (admin only)
   * @param {String} id - User ID
   * @param {String} requestingUserId - ID of user making the request
   * @returns {Promise<Object>} Restored user
   */
  async restoreUser(id, requestingUserId) {
    try {
      // Check if requesting user is admin
      const requestingUser = await userRepository.findById(requestingUserId);
      if (requestingUser.role !== "admin") {
        throw new Error("Only administrators can restore users");
      }

      // Check if user exists (including deleted ones)
      const existingUser = await userRepository.findById(id, true);
      if (!existingUser) {
        throw new Error("User not found");
      }

      if (!existingUser.isDeleted) {
        throw new Error("User is not deleted");
      }

      return await userRepository.restore(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user exists
   * @param {String} userId - User ID
   * @returns {Promise<Boolean>} True if user exists
   */
  async userExists(userId) {
    try {
      return await userRepository.exists(userId);
    } catch (error) {
      throw new Error(`Failed to check user existence: ${error.message}`);
    }
  }
}

module.exports = new UserService();
