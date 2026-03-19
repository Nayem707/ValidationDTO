const productService = require("./product.service");
const {
  CreateProductDTO,
  UpdateProductDTO,
  QueryProductsDTO,
} = require("./product.dto");
const {
  sendSuccess,
  sendError,
  sendPaginatedResponse,
} = require("../../utils/response");

class ProductController {
  /**
   * Get all products with filters and pagination
   * GET /api/products
   * Query parameters: page, limit, search, category, sortBy, sortOrder
   */
  async getAllProducts(req, res, next) {
    try {
      // Validate query parameters
      const queryValidation = QueryProductsDTO.safeParse(req.query);
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

      const queryDto = new QueryProductsDTO(queryValidation.data);
      const result = await productService.getAllProducts(queryDto);

      return sendPaginatedResponse(
        res,
        result,
        "Products retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product by ID
   * GET /api/products/:id
   */
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return sendError(res, "Product ID is required", 400);
      }

      const product = await productService.getProductById(id);
      return sendSuccess(res, product, "Product retrieved successfully");
    } catch (error) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
      next(error);
    }
  }

  /**
   * Get current user's products
   * GET /api/products/my-products
   */
  async getMyProducts(req, res, next) {
    try {
      const userId = req.user.id;

      const products = await productService.getProductsByUserId(userId);
      return sendSuccess(res, products, "Your products retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new product
   * POST /api/products
   */
  async createProduct(req, res, next) {
    try {
      // Validate DTO
      const validation = CreateProductDTO.safeParse(req.body);
      if (!validation.success) {
        return sendError(
          res,
          "Validation failed",
          400,
          validation.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        );
      }

      const createDto = new CreateProductDTO(req.body);
      const userId = req.user.id;

      const product = await productService.createProduct(createDto, userId);
      return sendSuccess(res, product, "Product created successfully", 201);
    } catch (error) {
      if (error.message.includes("already exists")) {
        return sendError(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Update product
   * PATCH /api/products/:id
   */
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return sendError(res, "Product ID is required", 400);
      }

      // Validate DTO
      const validation = UpdateProductDTO.safeParse(req.body);
      if (!validation.success) {
        return sendError(
          res,
          "Validation failed",
          400,
          validation.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        );
      }

      const updateDto = new UpdateProductDTO(req.body);
      const updateData = updateDto.toUpdateObject();

      if (Object.keys(updateData).length === 0) {
        return sendError(
          res,
          "At least one field must be provided for update",
          400,
        );
      }

      const userId = req.user.id;
      const product = await productService.updateProduct(
        id,
        updateData,
        userId,
      );

      return sendSuccess(res, product, "Product updated successfully");
    } catch (error) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
      if (error.message.includes("own products")) {
        return sendError(res, error.message, 403);
      }
      next(error);
    }
  }

  /**
   * Delete product
   * DELETE /api/products/:id
   */
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return sendError(res, "Product ID is required", 400);
      }

      const userId = req.user.id;
      const result = await productService.deleteProduct(id, userId);

      return sendSuccess(res, result, "Product deleted successfully");
    } catch (error) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
      if (error.message.includes("own products")) {
        return sendError(res, error.message, 403);
      }
      next(error);
    }
  }

  /**
   * Update product stock
   * PATCH /api/products/:id/stock
   */
  async updateStock(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity, operation } = req.body;

      if (!id) {
        return sendError(res, "Product ID is required", 400);
      }

      if (!quantity || typeof quantity !== "number" || quantity <= 0) {
        return sendError(res, "Valid quantity is required", 400);
      }

      if (!operation || !["add", "subtract"].includes(operation)) {
        return sendError(
          res,
          'Operation must be either "add" or "subtract"',
          400,
        );
      }

      const userId = req.user.id;
      const product = await productService.updateProductStock(
        id,
        quantity,
        operation,
        userId,
      );

      return sendSuccess(res, product, "Product stock updated successfully");
    } catch (error) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
      if (error.message.includes("own products")) {
        return sendError(res, error.message, 403);
      }
      if (error.message.includes("Insufficient stock")) {
        return sendError(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Search products
   * GET /api/products/search
   */
  async searchProducts(req, res, next) {
    try {
      const { q: searchTerm, ...filters } = req.query;

      if (!searchTerm) {
        return sendError(res, "Search term is required", 400);
      }

      // Validate query parameters
      const queryValidation = QueryProductsDTO.safeParse(filters);
      if (!queryValidation.success) {
        return sendError(res, "Invalid query parameters", 400);
      }

      const queryDto = new QueryProductsDTO(queryValidation.data);
      const result = await productService.searchProducts(searchTerm, queryDto);
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
   * Get products by category
   * GET /api/products/category/:category
   */
  async getProductsByCategory(req, res, next) {
    try {
      const { category } = req.params;
      const { limit = 10, includeInactive = false } = req.query;

      if (!category) {
        return sendError(res, "Category is required", 400);
      }

      const products = await productService.getProductsByCategory(category, {
        limit: parseInt(limit),
        includeInactive: includeInactive === "true",
      });

      return sendSuccess(
        res,
        products,
        `Products in "${category}" category retrieved successfully`,
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's product statistics
   * GET /api/products/stats
   */
  async getProductStats(req, res, next) {
    try {
      const userId = req.user.id;

      const stats = await productService.getUserProductStats(userId);
      return sendSuccess(
        res,
        stats,
        "Product statistics retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restore deleted product
   * PATCH /api/products/:id/restore
   */
  async restoreProduct(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return sendError(res, "Product ID is required", 400);
      }

      const userId = req.user.id;
      const product = await productService.restoreProduct(id, userId);

      return sendSuccess(res, product, "Product restored successfully");
    } catch (error) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
      if (error.message.includes("own products")) {
        return sendError(res, error.message, 403);
      }
      if (error.message.includes("not deleted")) {
        return sendError(res, error.message, 400);
      }
      next(error);
    }
  }
}

module.exports = new ProductController();
