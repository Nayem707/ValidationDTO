const productRepository = require("./product.repository");

class ProductService {
  /**
   * Get all products with filters and pagination
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Products with pagination info
   */
  async getAllProducts(filters = {}) {
    try {
      return await productRepository.findMany(filters);
    } catch (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  /**
   * Get product by ID
   * @param {String} id - Product ID
   * @returns {Promise<Object|null>} Product or null
   */
  async getProductById(id) {
    try {
      const product = await productRepository.findById(id);
      if (!product) {
        throw new Error("Product not found");
      }
      return product;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get products by user ID
   * @param {String} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} User's products
   */
  async getProductsByUserId(userId, options = {}) {
    try {
      return await productRepository.findByUserId(userId, options);
    } catch (error) {
      throw new Error(`Failed to fetch user products: ${error.message}`);
    }
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data from DTO
   * @param {String} userId - User ID who creates the product
   * @returns {Promise<Object>} Created product
   */
  async createProduct(productData, userId) {
    try {
      // Business logic validation can go here
      if (productData.price <= 0) {
        throw new Error("Product price must be greater than zero");
      }

      return await productRepository.create(productData, userId);
    } catch (error) {
      if (error.code === "P2002") {
        throw new Error("A product with similar details already exists");
      }
      throw error;
    }
  }

  /**
   * Update product by ID
   * @param {String} id - Product ID
   * @param {Object} updateData - Update data from DTO
   * @param {String} userId - User ID for ownership check
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(id, updateData, userId) {
    try {
      // Check if product exists
      const existingProduct = await productRepository.findById(id);
      if (!existingProduct) {
        throw new Error("Product not found");
      }

      // Check ownership
      if (existingProduct.userId !== userId) {
        throw new Error("You can only update your own products");
      }

      // Business logic validation
      if (updateData.price && updateData.price <= 0) {
        throw new Error("Product price must be greater than zero");
      }

      return await productRepository.update(id, updateData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete product (soft delete)
   * @param {String} id - Product ID
   * @param {String} userId - User ID for ownership check
   * @throws {Error} If product not found or user doesn't own it
   */
  async deleteProduct(id, userId) {
    try {
      // Check if product exists and user owns it
      const existingProduct = await productRepository.findById(id);
      if (!existingProduct) {
        throw new Error("Product not found");
      }

      if (existingProduct.userId !== userId) {
        throw new Error("You can only delete your own products");
      }

      await productRepository.softDelete(id);
      return { message: "Product deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update product stock
   * @param {String} id - Product ID
   * @param {Number} quantity - Quantity to add/subtract
   * @param {String} operation - 'add' or 'subtract'
   * @param {String} userId - User ID for ownership check
   * @returns {Promise<Object>} Updated product
   */
  async updateProductStock(id, quantity, operation = "add", userId) {
    try {
      // Check ownership
      const isOwner = await productRepository.isOwner(id, userId);
      if (!isOwner) {
        throw new Error("You can only update your own products");
      }

      if (quantity <= 0) {
        throw new Error("Quantity must be greater than zero");
      }

      return await productRepository.updateStock(id, quantity, operation);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get products by category
   * @param {String} category - Product category
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Products in category
   */
  async getProductsByCategory(category, options = {}) {
    try {
      return await productRepository.findByCategory(category, options);
    } catch (error) {
      throw new Error(`Failed to fetch products by category: ${error.message}`);
    }
  }

  /**
   * Search products
   * @param {String} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} Search results with pagination
   */
  async searchProducts(searchTerm, filters = {}) {
    try {
      const searchFilters = {
        ...filters,
        search: searchTerm,
      };
      return await productRepository.findMany(searchFilters);
    } catch (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }
  }

  /**
   * Get product statistics for a user
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Product statistics
   */
  async getUserProductStats(userId) {
    try {
      const products = await productRepository.findByUserId(userId, {
        includeDeleted: true,
        includeInactive: true,
      });

      const stats = {
        total: products.length,
        active: products.filter((p) => p.isActive && !p.isDeleted).length,
        inactive: products.filter((p) => !p.isActive && !p.isDeleted).length,
        deleted: products.filter((p) => p.isDeleted).length,
        totalValue: products
          .filter((p) => !p.isDeleted)
          .reduce((sum, p) => sum + p.price * p.stock, 0),
        totalStock: products
          .filter((p) => !p.isDeleted)
          .reduce((sum, p) => sum + p.stock, 0),
      };

      return stats;
    } catch (error) {
      throw new Error(`Failed to fetch product statistics: ${error.message}`);
    }
  }

  /**
   * Restore a soft deleted product
   * @param {String} id - Product ID
   * @param {String} userId - User ID for ownership check
   * @returns {Promise<Object>} Restored product
   */
  async restoreProduct(id, userId) {
    try {
      // Check if product exists (including deleted ones)
      const existingProduct = await productRepository.findById(id, true);
      if (!existingProduct) {
        throw new Error("Product not found");
      }

      if (existingProduct.userId !== userId) {
        throw new Error("You can only restore your own products");
      }

      if (!existingProduct.isDeleted) {
        throw new Error("Product is not deleted");
      }

      return await productRepository.restore(id);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProductService();
