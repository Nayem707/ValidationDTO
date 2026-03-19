const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ProductRepository {
  /**
   * Find products with filters and pagination
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Products with pagination info
   */
  async findMany(filters = {}) {
    const {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      search,
      isActive,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const skip = (page - 1) * limit;
    const where = { isDeleted: false };

    // Apply filters
    if (category) {
      where.category = { contains: category, mode: "insensitive" };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, page, limit };
  }

  /**
   * Find a single product by ID
   * @param {String} id - Product ID
   * @param {Boolean} includeDeleted - Include deleted products
   * @returns {Promise<Object|null>} Product or null
   */
  async findById(id, includeDeleted = false) {
    const where = { id };
    if (!includeDeleted) {
      where.isDeleted = false;
    }

    return await prisma.product.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find products by user ID
   * @param {String} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} User's products
   */
  async findByUserId(userId, options = {}) {
    const { includeDeleted = false, includeInactive = false } = options;

    const where = { userId };
    if (!includeDeleted) where.isDeleted = false;
    if (!includeInactive) where.isActive = true;

    return await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @param {String} userId - User ID who creates the product
   * @returns {Promise<Object>} Created product
   */
  async create(productData, userId) {
    return await prisma.product.create({
      data: {
        ...productData,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Update a product by ID
   * @param {String} id - Product ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated product
   */
  async update(id, updateData) {
    return await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Soft delete a product
   * @param {String} id - Product ID
   * @returns {Promise<Object>} Updated product with isDeleted: true
   */
  async softDelete(id) {
    return await prisma.product.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
      },
    });
  }

  /**
   * Hard delete a product
   * @param {String} id - Product ID
   * @returns {Promise<Object>} Deleted product
   */
  async hardDelete(id) {
    return await prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Restore a soft deleted product
   * @param {String} id - Product ID
   * @returns {Promise<Object>} Restored product
   */
  async restore(id) {
    return await prisma.product.update({
      where: { id },
      data: { isDeleted: false },
    });
  }

  /**
   * Update product stock
   * @param {String} id - Product ID
   * @param {Number} quantity - Quantity to add/subtract
   * @param {String} operation - 'add' or 'subtract'
   * @returns {Promise<Object>} Updated product
   */
  async updateStock(id, quantity, operation = "add") {
    const product = await this.findById(id);
    if (!product) throw new Error("Product not found");

    const newStock =
      operation === "add" ? product.stock + quantity : product.stock - quantity;

    if (newStock < 0) {
      throw new Error("Insufficient stock");
    }

    return await this.update(id, { stock: newStock });
  }

  /**
   * Get products by category
   * @param {String} category - Product category
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Products in category
   */
  async findByCategory(category, options = {}) {
    const { limit = 10, includeInactive = false } = options;

    const where = {
      category: { contains: category, mode: "insensitive" },
      isDeleted: false,
    };

    if (!includeInactive) {
      where.isActive = true;
    }

    return await prisma.product.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Check if user owns the product
   * @param {String} productId - Product ID
   * @param {String} userId - User ID
   * @returns {Promise<Boolean>} True if user owns the product
   */
  async isOwner(productId, userId) {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId,
        isDeleted: false,
      },
    });

    return !!product;
  }
}

module.exports = new ProductRepository();
