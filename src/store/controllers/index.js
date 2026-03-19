// Centralized controller exports
const authController = require("../../modules/auth/auth.controller");
const userController = require("../../modules/user/user.controller");
const productController = require("../../modules/product/product.controller");

module.exports = {
  authController,
  userController,
  productController,
};
