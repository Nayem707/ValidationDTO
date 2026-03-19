const authService = require("./auth.service");
const {
  RegisterUserDTO,
  LoginUserDTO,
  ChangePasswordDTO,
} = require("./auth.dto");
const { sendSuccess, sendError } = require("../../utils/response");

class AuthController {
  /**
   * Register new user
   * POST /api/auth/register
   * Request body: { name, email, password }
   */
  async register(req, res, next) {
    try {
      // Validate DTO
      const validation = RegisterUserDTO.safeParse(req.body);
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

      const registerDto = new RegisterUserDTO(validation.data);
      const result = await authService.register(registerDto);

      return sendSuccess(res, result, "User registered successfully", 201);
    } catch (error) {
      if (error.message.includes("already exists")) {
        return sendError(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      // Validate DTO
      const validation = LoginUserDTO.safeParse(req.body);
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

      const loginDto = new LoginUserDTO(validation.data);
      const result = await authService.login(loginDto);

      return sendSuccess(res, result, "Login successful");
    } catch (error) {
      if (error.message.includes("Invalid email or password")) {
        return sendError(res, "Invalid email or password", 401);
      }
      next(error);
    }
  }

  /**
   * Get user profile
   * GET /api/auth/profile
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await authService.getProfile(userId);

      return sendSuccess(res, user, "Profile retrieved successfully");
    } catch (error) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
      next(error);
    }
  }

  /**
   * Change password
   * POST /api/auth/change-password
   */
  async changePassword(req, res, next) {
    try {
      // Validate DTO
      const validation = ChangePasswordDTO.safeParse(req.body);
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

      const passwordDto = new ChangePasswordDTO(validation.data);
      const userId = req.user.id;

      const result = await authService.changePassword(userId, passwordDto);
      return sendSuccess(res, result, "Password changed successfully");
    } catch (error) {
      if (error.message.includes("incorrect")) {
        return sendError(res, error.message, 400);
      }
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
      next(error);
    }
  }

  /**
   * Verify token
   * POST /api/auth/verify
   */
  async verifyToken(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        return sendError(res, "Token is required", 400);
      }

      const decoded = await authService.verifyToken(token);
      return sendSuccess(res, decoded, "Token is valid");
    } catch (error) {
      return sendError(res, "Invalid or expired token", 401);
    }
  }

  /**
   * Logout user (client-side token removal)
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      // Since we're using stateless JWT, logout is handled on client side
      // This endpoint is just for consistency
      return sendSuccess(
        res,
        { message: "Logged out successfully" },
        "Logout successful",
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
