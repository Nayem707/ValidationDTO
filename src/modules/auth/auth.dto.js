const { z } = require("zod");

// Validation schema for user registration
const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters"),

    email: z
      .string()
      .email("Invalid email format")
      .min(1, "Email is required")
      .max(100, "Email cannot exceed 100 characters"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password cannot exceed 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Validation schema for user login
const loginSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),

  password: z.string().min(1, "Password is required"),
});

// Validation schema for password change
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password cannot exceed 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      ),

    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

// DTO classes
class RegisterUserDTO {
  constructor(data) {
    const validated = registerSchema.parse(data);
    this.name = validated.name;
    this.email = validated.email.toLowerCase();
    this.password = validated.password;
  }

  static validate(data) {
    return registerSchema.parse(data);
  }

  static safeParse(data) {
    return registerSchema.safeParse(data);
  }
}

class LoginUserDTO {
  constructor(data) {
    const validated = loginSchema.parse(data);
    this.email = validated.email.toLowerCase();
    this.password = validated.password;
  }

  static validate(data) {
    return loginSchema.parse(data);
  }

  static safeParse(data) {
    return loginSchema.safeParse(data);
  }
}

class ChangePasswordDTO {
  constructor(data) {
    const validated = changePasswordSchema.parse(data);
    this.currentPassword = validated.currentPassword;
    this.newPassword = validated.newPassword;
  }

  static validate(data) {
    return changePasswordSchema.parse(data);
  }

  static safeParse(data) {
    return changePasswordSchema.safeParse(data);
  }
}

module.exports = {
  RegisterUserDTO,
  LoginUserDTO,
  ChangePasswordDTO,
  registerSchema,
  loginSchema,
  changePasswordSchema,
};
