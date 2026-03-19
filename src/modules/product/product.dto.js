const { z } = require("zod");

// Validation schema for creating a product
const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name cannot exceed 100 characters"),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  price: z
    .number()
    .positive("Price must be a positive number")
    .min(0.01, "Price must be at least $0.01")
    .max(999999.99, "Price cannot exceed $999,999.99"),

  category: z
    .string()
    .min(1, "Category is required")
    .min(2, "Category must be at least 2 characters")
    .max(50, "Category cannot exceed 50 characters"),

  stock: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .optional()
    .default(0),

  isActive: z.boolean().optional(),
});

// Validation schema for updating a product
const updateProductSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name cannot exceed 100 characters")
    .optional(),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  price: z
    .number()
    .positive("Price must be a positive number")
    .min(0.01, "Price must be at least $0.01")
    .max(999999.99, "Price cannot exceed $999,999.99")
    .optional(),

  category: z
    .string()
    .min(2, "Category must be at least 2 characters")
    .max(50, "Category cannot exceed 50 characters")
    .optional(),

  stock: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .optional(),

  isActive: z.boolean().optional(),
});

// Validation schema for query parameters
const queryProductsSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a number")
    .optional()
    .default("1"),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a number")
    .optional()
    .default("10"),
  category: z.string().optional(),
  minPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")
    .optional(),
  maxPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")
    .optional(),
  search: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
  sortBy: z
    .enum(["name", "price", "createdAt", "stock"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// DTO classes
class CreateProductDTO {
  constructor(data) {
    const validated = createProductSchema.parse(data);
    this.name = validated.name;
    this.description = validated.description;
    this.price = validated.price;
    this.category = validated.category;
    this.stock = validated.stock;
    this.isActive = validated.isActive;
  }

  static validate(data) {
    return createProductSchema.parse(data);
  }

  static safeParse(data) {
    return createProductSchema.safeParse(data);
  }
}

class UpdateProductDTO {
  constructor(data) {
    const validated = updateProductSchema.parse(data);
    this.name = validated.name;
    this.description = validated.description;
    this.price = validated.price;
    this.category = validated.category;
    this.stock = validated.stock;
    this.isActive = validated.isActive;
  }

  static validate(data) {
    return updateProductSchema.parse(data);
  }

  static safeParse(data) {
    return updateProductSchema.safeParse(data);
  }

  // Get only defined fields for partial update
  toUpdateObject() {
    const updateObj = {};
    if (this.name !== undefined) updateObj.name = this.name;
    if (this.description !== undefined)
      updateObj.description = this.description;
    if (this.price !== undefined) updateObj.price = this.price;
    if (this.category !== undefined) updateObj.category = this.category;
    if (this.stock !== undefined) updateObj.stock = this.stock;
    if (this.isActive !== undefined) updateObj.isActive = this.isActive;
    return updateObj;
  }
}

class QueryProductsDTO {
  constructor(data) {
    const validated = queryProductsSchema.parse(data);
    this.page = parseInt(validated.page);
    this.limit = parseInt(validated.limit);
    this.category = validated.category;
    this.minPrice = validated.minPrice
      ? parseFloat(validated.minPrice)
      : undefined;
    this.maxPrice = validated.maxPrice
      ? parseFloat(validated.maxPrice)
      : undefined;
    this.search = validated.search;
    this.isActive = validated.isActive
      ? validated.isActive === "true"
      : undefined;
    this.sortBy = validated.sortBy;
    this.sortOrder = validated.sortOrder;
  }

  static validate(data) {
    return queryProductsSchema.parse(data);
  }

  static safeParse(data) {
    return queryProductsSchema.safeParse(data);
  }
}

module.exports = {
  CreateProductDTO,
  UpdateProductDTO,
  QueryProductsDTO,
  createProductSchema,
  updateProductSchema,
  queryProductsSchema,
};
