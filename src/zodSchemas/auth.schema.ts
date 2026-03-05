import { z } from 'zod';
// src/schemas/user.schema.ts
// ============================================================================
// ENUM
// ============================================================================
export const UserRoleSchema = z.enum(['USER', 'ADMIN', 'PROVIDER']);

// ============================================================================
// BASE USER SCHEMA
// ============================================================================
export const UserSchema = z.object({
  id: z.uuid({ message: 'Invalid UUID' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.email({ message: 'Please enter a valid email address' }),
  role: UserRoleSchema.default('USER'),
  emailVerified: z.boolean().default(false),
  image: z.url({ message: 'Please enter a valid URL for the image' }).nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// ============================================================================
// AUTH & FORM VALIDATION SCHEMAS
// ============================================================================

// Schema for user login.
export const SignInSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
  password: z.string().nonempty({ message: 'Password is required' })
});

// Schema for user registration.
export const SignUpUserSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
    email: z.email({ message: 'Please enter a valid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: z.string(),
    role: UserRoleSchema.optional()
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'] // Point the error to the confirmPassword field
  });

// Schema for user registration.
export const SignUpDoctorSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
    email: z.email({ message: 'Please enter a valid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: z.string(),
    role: UserRoleSchema.optional()
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'] // Point the error to the confirmPassword field
  });

// Schema for updating a user's profile.
// .partial() makes all fields optional.
export const UpdateUserProfileSchema = z
  .object({
    name: UserSchema.shape.name.optional(),
    email: UserSchema.shape.email.optional(),
    image: UserSchema.shape.image.optional()
  })
  .partial();

// ============================================================================
// INFERRED TYPESCRIPT TYPES
// ============================================================================

// The core User type, without any relations.
export type User = z.infer<typeof UserSchema>;

// The type for the login form/API input.
export type LoginInput = z.infer<typeof SignInSchema>;

// The type for the registration form/API input.
export type RegisterDoctorInput = z.infer<typeof SignUpDoctorSchema>;

// The type for the registration form/API input.
export type RegisterUserInput = z.infer<typeof SignUpUserSchema>;

// The type for updating a user profile.
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;

// ============================================================================
// FORGOT/RESET PASSWORD SCHEMAS
// ============================================================================

// Schema for forgot password form (email only)
export const ForgotPasswordSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' })
});

// Schema for reset password form
export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: z.string()
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

// Types for forgot/reset password
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export const userSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .regex(/^\p{L}+$/u, { message: 'Name must contain only letters.' }),

  email: z.string().regex(/^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, {
    message: 'Please enter a valid email address.'
  }),
  emailVerified: z.boolean(),
  image: z
    .string()
    .or(z.literal('').transform(() => undefined))
    .optional(),

  isAdminUser: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
  role: z.string().default('user'),
  clinicId: z.string().optional(),
  clinicName: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export const editableUserProfileSchema = z.object({
  name: userSchema.shape.name.optional(),
  email: userSchema.shape.email.optional()
});

export type UserType = z.infer<typeof userSchema>;
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const signupFormSchema = z.object({
  name: userSchema.shape.name,
  email: userSchema.shape.email,
  password: passwordSchema
});

export const newPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema
  })
  .refine(data => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match'
  });
export const signInFormSchema = signupFormSchema.omit({ name: true });

export const resetPasswordFormSchema = newPasswordSchema.safeExtend({
  token: z.string()
});

export const changePasswordFormSchema = newPasswordSchema.safeExtend({
  currentPassword: signupFormSchema.shape.password
});
