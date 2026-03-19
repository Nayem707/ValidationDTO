const userService = require("./user.service");
const { UpdateUserDTO, QueryUsersDTO } = require("./user.dto");
const {
  sendSuccess,
  sendError,
  sendPaginatedResponse,
} = require("../../utils/response");

class UserController {
  /**
   * Get all users with filters and pagination
   * GET /api/users
   */
  async getAllUsers(req, res, next) {
    try {
      // Validate query parameters
      const queryValidation = QueryUsersDTO.safeParse(req.query);
      if (!queryValidation.success) {
        return sendError(
          res,
          "Invalid query parameters",
          400,
          queryValidation.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        );
      }

      const queryDto = new QueryUsersDTO(queryValidation.data);
      const result = await userService.getAllUsers(queryDto);

      return sendPaginatedResponse(res, result, "Users retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return sendError(res, "User ID is required", 400);
      }

      const user = await userService.getUserById(id);
      return sendSuccess(res, user, "User retrieved successfully");
    } catch (error) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
      next(error);
    }
  }

  /**
   * Get current user's profile with statistics
   * GET /api/users/profile
   */
  async getMyProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await userService.getUserProfile(userId);

      return sendSuccess(res, profile, "Profile retrieved successfully");
    } catch (error) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
      next(error);
    }
  }

  /**
   * Update user profile
   * PATCH /api/users/:id
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return sendError(res, "User ID is required", 400);
      }

      // Validate DTO
      const validation = UpdateUserDTO.safeParse(req.body);
      if (!validation.success) {
        return sendError(
          res,
          "Validation failed",
          400,
          validation.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        );
      }

      const updateDto = new UpdateUserDTO(validation.data);
      const updateData = updateDto.toUpdateObject();

      if (Object.keys(updateData).length === 0) {
        return sendError(
          res,
          "At least one field must be provided for update",
          400,
        );
      }

      const requestingUserId = req.user.id;
      const user = await userService.updateUser(
        id,
        updateData,
        requestingUserId,
      );

      return sendSuccess(res, user, "User updated successfully");
    } catch (error) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
      if (
        error.message.includes("own profile") ||
        error.message.includes("already exists")
      ) {
        return sendError(res, error.message, 403);
      }
      next(error);
    }
  }

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return sendError(res, "User ID is required", 400);
      }

      const requestingUserId = req.user.id;
      const result = await userService.deleteUser(id, requestingUserId);

      return sendSuccess(res, result, "User deleted successfully");
    } catch (error) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
      if (error.message.includes("own account")) {
        return sendError(res, error.message, 403);
      }
      next(error);
    }
  }

  /**
   * Search users
   * GET /api/users/search
   */
  async searchUsers(req, res, next) {
    try {
      const { q: searchTerm, ...filters } = req.query;

      if (!searchTerm) {
        return sendError(res, "Search term is required", 400);
      }

      // Validate query parameters
      const queryValidation = QueryUsersDTO.safeParse(filters);
      if (!queryValidation.success) {
        return sendError(res, "Invalid query parameters", 400);
      }

      const result = await userService.searchUsers(searchTerm, filters);
      return sendPaginatedResponse(
        res,
        result,
        "Search results retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user statistics
   * GET /api/users/:id/stats
   */
  async getUserStats(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return sendError(res, "User ID is required", 400);
      }

      const stats = await userService.getUserStatistics(id);
      return sendSuccess(res, stats, "User statistics retrieved successfully");
    } catch (error) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
      next(error);
    }
  }

  /**
   * Update user role (admin only)
   * PATCH /api/users/:id/role
   */
  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!id) {
        return sendError(res, "User ID is required", 400);
      }

      if (!role || !["user", "admin"].includes(role)) {
        return sendError(res, "Valid role is required (user or admin)", 400);
      }

      const requestingUserId = req.user.id;
      const user = await userService.updateUserRole(id, role, requestingUserId);

      return sendSuccess(res, user, "User role updated successfully");
    } catch (error) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
      if (error.message.includes("administrators")) {
        return sendError(res, error.message, 403);
      }
      next(error);
    }
  }

  /**
   * Restore deleted user (admin only)
   * PATCH /api/users/:id/restore
   */
  async restoreUser(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return sendError(res, "User ID is required", 400);
      }

      const requestingUserId = req.user.id;
      const user = await userService.restoreUser(id, requestingUserId);

      return sendSuccess(res, user, "User restored successfully");
    } catch (error) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
      if (
        error.message.includes("administrators") ||
        error.message.includes("not deleted")
      ) {
        return sendError(res, error.message, 403);
      }
      next(error);
    }
  }
}

module.exports = new UserController();
