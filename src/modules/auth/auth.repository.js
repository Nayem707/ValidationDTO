const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AuthRepository {
  /**
   * Find user by email
   * @param {String} email - User email
   * @returns {Promise<Object|null>} User or null
   */
  async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
        isDeleted: false,
      },
    });
  }

  /**
   * Find user by ID
   * @param {String} id - User ID
   * @returns {Promise<Object|null>} User or null
   */
  async findUserById(id) {
    return await prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
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
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user without password
   */
  async createUser(userData) {
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  /**
   * Update user password
   * @param {String} userId - User ID
   * @param {String} newPassword - New hashed password
   * @returns {Promise<Object>} Updated user without password
   */
  async updatePassword(userId, newPassword) {
    return await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update user last login timestamp
   * @param {String} userId - User ID
   */
  async updateLastLogin(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() },
    });
  }

  /**
   * Check if email exists
   * @param {String} email - Email to check
   * @returns {Promise<Boolean>} True if email exists
   */
  async emailExists(email) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });
    return !!user;
  }
}

module.exports = new AuthRepository();
