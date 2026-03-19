const express = require("express");
const productController = require("./product.controller");
const { authenticateToken, authorizeRoles } = require("../../middleware/auth");

const router = express.Router();

// Public routes (no authentication required)
router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/category/:category", productController.getProductsByCategory);
router.get("/:id", productController.getProductById);

// Protected routes (authentication required)
router.use(authenticateToken);

// User's own products
router.get("/user/my-products", productController.getMyProducts);
router.get("/user/stats", productController.getProductStats);

// Create, update, delete products
router.post("/", productController.createProduct);
router.patch("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

// Stock management
router.patch("/:id/stock", productController.updateStock);

// Restore deleted product
router.patch("/:id/restore", productController.restoreProduct);

// Admin-only routes (if needed)
// router.use(authorizeRoles(['admin']));
// router.get('/admin/all', productController.getAllProductsIncludingDeleted);

module.exports = router;
