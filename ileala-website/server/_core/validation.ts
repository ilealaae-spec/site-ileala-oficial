import { z } from 'zod';

/**
 * Utility functions for input validation and sanitization
 */

// Sanitize string inputs (remove leading/trailing whitespace, prevent XSS)
export function sanitizeString(input: string | undefined | null): string {
  if (!input) return '';
  return input.trim().replace(/[<>]/g, '');
}

// Sanitize email (lowercase, trim)
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Validate and sanitize phone number
export function sanitizePhone(phone: string | undefined | null): string | undefined {
  if (!phone) return undefined;
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned.length > 0 ? cleaned : undefined;
}

// Validate password strength
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  
  if (password.length > 128) {
    return { valid: false, message: 'Password must be less than 128 characters' };
  }
  
  // Optional: Add more strength requirements
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasLowerCase = /[a-z]/.test(password);
  // const hasNumber = /[0-9]/.test(password);
  // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return { valid: true };
}

// Zod schemas with custom error messages
export const emailSchema = z.string().email('Please enter a valid email address').transform(sanitizeEmail);

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters long')
  .max(128, 'Password must be less than 128 characters')
  .refine(
    (password) => validatePasswordStrength(password).valid,
    (password) => ({ message: validatePasswordStrength(password).message || 'Invalid password' })
  );

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters long')
  .max(100, 'Name must be less than 100 characters')
  .transform(sanitizeString)
  .refine((name) => name.length >= 2, 'Name cannot be empty after sanitization');

export const phoneSchema = z
  .string()
  .optional()
  .transform((val) => val ? sanitizePhone(val) : undefined);

export const addressSchema = z
  .string()
  .max(500, 'Address must be less than 500 characters')
  .transform(sanitizeString)
  .optional();

export const citySchema = z
  .string()
  .max(100, 'City must be less than 100 characters')
  .transform(sanitizeString)
  .optional();

export const stateSchema = z
  .string()
  .max(100, 'State/Emirate must be less than 100 characters')
  .transform(sanitizeString)
  .optional();

export const countrySchema = z
  .string()
  .max(100, 'Country must be less than 100 characters')
  .transform(sanitizeString)
  .optional();

export const poBoxSchema = z
  .string()
  .max(50, 'PO Box must be less than 50 characters')
  .transform(sanitizeString)
  .optional();

// Coupon code validation
export const couponCodeSchema = z
  .string()
  .min(3, 'Coupon code must be at least 3 characters')
  .max(50, 'Coupon code must be less than 50 characters')
  .transform((code) => code.toUpperCase().trim())
  .refine((code) => /^[A-Z0-9-_]+$/.test(code), 'Coupon code can only contain letters, numbers, hyphens, and underscores');

// Product name validation
export const productNameSchema = z
  .string()
  .min(2, 'Product name must be at least 2 characters')
  .max(200, 'Product name must be less than 200 characters')
  .transform(sanitizeString);

// Price validation
export const priceSchema = z
  .number()
  .min(0, 'Price cannot be negative')
  .max(1000000, 'Price cannot exceed 1,000,000 AED');

// Quantity validation
export const quantitySchema = z
  .number()
  .int('Quantity must be a whole number')
  .min(1, 'Quantity must be at least 1')
  .max(1000, 'Quantity cannot exceed 1000');

// Order total validation
export const orderTotalSchema = z
  .number()
  .min(0, 'Order total cannot be negative')
  .max(1000000, 'Order total cannot exceed 1,000,000 AED');



