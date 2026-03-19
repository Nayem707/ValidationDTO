const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class UserRepository {
  /**
   * Find users with filters and pagination
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Users with pagination info
   */
  async findMany(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const skip = (page - 1) * limit;
    const where = { isDeleted: false };

    // Apply filters
    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  /**
   * Find a single user by ID
   * @param {String} id - User ID
   * @param {Boolean} includeDeleted - Include deleted users
   * @returns {Promise<Object|null>} User or null
   */
  async findById(id, includeDeleted = false) {
    const where = { id };
    if (!includeDeleted) {
      where.isDeleted = false;
    }

    return await prisma.user.findFirst({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  /**
   * Find user by email
   * @param {String} email - User email
   * @param {Boolean} includeDeleted - Include deleted users
   * @returns {Promise<Object|null>} User or null
   */
  async findByEmail(email, includeDeleted = false) {
    const where = { email: email.toLowerCase() };
    if (!includeDeleted) {
      where.isDeleted = false;
    }

    return await prisma.user.findUnique({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update a user by ID
   * @param {String} id - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated user
   */
  async update(id, updateData) {
    return await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Soft delete a user
   * @param {String} id - User ID
   * @returns {Promise<Object>} Updated user with isDeleted: true
   */
  async softDelete(id) {
    return await prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  /**
   * Hard delete a user
   * @param {String} id - User ID
   * @returns {Promise<Object>} Deleted user
   */
  async hardDelete(id) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Restore a soft deleted user
   * @param {String} id - User ID
   * @returns {Promise<Object>} Restored user
   */
  async restore(id) {
    return await prisma.user.update({
      where: { id },
      data: { isDeleted: false },
    });
  }

  /**
   * Get user statistics
   * @param {String} userId - User ID
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats(userId) {
    const stats = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        _count: {
          select: {
            products: {
              where: {
                isDeleted: false,
              },
            },
          },
        },
        products: {
          where: {
            isDeleted: false,
          },
          select: {
            price: true,
            stock: true,
            isActive: true,
          },
        },
      },
    });

    if (!stats) return null;

    const totalProducts = stats._count.products;
    const activeProducts = stats.products.filter((p) => p.isActive).length;
    const totalValue = stats.products.reduce(
      (sum, p) => sum + p.price * p.stock,
      0,
    );
    const totalStock = stats.products.reduce((sum, p) => sum + p.stock, 0);

    return {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      totalPortfolioValue: totalValue,
      totalStock,
    };
  }

  /**
   * Check if user exists
   * @param {String} id - User ID
   * @returns {Promise<Boolean>} True if user exists
   */
  async exists(id) {
    const user = await prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      select: { id: true },
    });

    return !!user;
  }

  /**
   * Update user role
   * @param {String} id - User ID
   * @param {String} role - New role
   * @returns {Promise<Object>} Updated user
   */
  async updateRole(id, role) {
    return await this.update(id, { role });
  }
}

module.exports = new UserRepository();
