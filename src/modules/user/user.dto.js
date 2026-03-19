const { z } = require("zod");

// Validation schema for updating user profile
const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .optional(),

  email: z
    .string()
    .email("Invalid email format")
    .max(100, "Email cannot exceed 100 characters")
    .optional(),
});

// Validation schema for user query parameters
const queryUsersSchema = z.object({
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
  search: z.string().optional(),
  role: z.enum(["user", "admin"]).optional(),
  sortBy: z
    .enum(["name", "email", "createdAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// DTO classes
class UpdateUserDTO {
  constructor(data) {
    const validated = updateUserSchema.parse(data);
    this.name = validated.name;
    this.email = validated.email ? validated.email.toLowerCase() : undefined;
  }

  static validate(data) {
    return updateUserSchema.parse(data);
  }

  static safeParse(data) {
    return updateUserSchema.safeParse(data);
  }

  // Get only defined fields for partial update
  toUpdateObject() {
    const updateObj = {};
    if (this.name !== undefined) updateObj.name = this.name;
    if (this.email !== undefined) updateObj.email = this.email;
    return updateObj;
  }
}

class QueryUsersDTO {
  constructor(data) {
    const validated = queryUsersSchema.parse(data);
    this.page = parseInt(validated.page);
    this.limit = parseInt(validated.limit);
    this.search = validated.search;
    this.role = validated.role;
    this.sortBy = validated.sortBy;
    this.sortOrder = validated.sortOrder;
  }

  static validate(data) {
    return queryUsersSchema.parse(data);
  }

  static safeParse(data) {
    return queryUsersSchema.safeParse(data);
  }
}

module.exports = {
  UpdateUserDTO,
  QueryUsersDTO,
  updateUserSchema,
  queryUsersSchema,
};
