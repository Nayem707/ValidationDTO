// Centralized service exports
const authService = require("../../modules/auth/auth.service");
const userService = require("../../modules/user/user.service");
const productService = require("../../modules/product/product.service");

module.exports = {
  authService,
  userService,
  productService,
};
