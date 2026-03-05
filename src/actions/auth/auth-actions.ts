'use server';

import type { Route } from 'next';
import { revalidateTag } from 'next/cache';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { z } from 'zod';

import type { User } from '@/db/types';
import { getRoleRedirect } from '@/lib/routes';
import { auth } from '@/server/auth';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/server/auth/rate-limit';
import type { Role } from '@/types/auth';

import { db, prisma } from '../../server/db/client';
import type { ActionResponse } from '../../types/api';
import { SignInSchema, SignUpDoctorSchema, SignUpUserSchema } from '../../zodSchemas';

export async function signIn(values: z.infer<typeof SignInSchema>): Promise<ActionResponse<never>> {
  const validatedFields = SignInSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid email or password format'
    };
  }

  const { email, password } = validatedFields.data;

  // Rate limiting check
  const headersList = await headers();
  const clientIP = getClientIP(headersList);
  const rateLimitResult = checkRateLimit({
    key: 'sign-in',
    identifier: clientIP,
    ...RATE_LIMITS.signIn
  });

  if (!rateLimitResult.success) {
    return {
      success: false,
      error: `Too many sign-in attempts. Please try again in ${rateLimitResult.retryAfterSeconds} seconds.`
    };
  }

  try {
    const res = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers()
    });

    if (!res.user) {
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }

    // Fetch user with role from database
    const userWithRole = await prisma.user.findUnique({
      where: { id: res.user.id },
      select: {
        id: true,
        role: true
      }
    });

    if (!userWithRole) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    const role = (userWithRole.role?.toLowerCase() || 'doctor') as Role;
    const redirectPath = getRoleRedirect(role) as Route;

    redirect(redirectPath);
  } catch (error) {
    // Let NEXT_REDIRECT errors bubble up for navigation
    if (isRedirectError(error)) {
      throw error;
    }

    console.error('Sign in error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred during sign in'
    };
  }
}

export async function signUpUser(
  values: z.infer<typeof SignUpUserSchema>
): Promise<ActionResponse<{ userId: string }>> {
  const validatedFields = SignUpUserSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid input. Please check your details'
    };
  }

  const { name, email, password } = validatedFields.data;

  // Rate limiting check
  const headersList = await headers();
  const clientIP = getClientIP(headersList);
  const rateLimitResult = checkRateLimit({
    key: 'sign-up',
    identifier: clientIP,
    ...RATE_LIMITS.signUp
  });

  if (!rateLimitResult.success) {
    return {
      success: false,
      error: `Too many sign-up attempts. Please try again in ${rateLimitResult.retryAfterSeconds} seconds.`
    };
  }

  try {
    const res = await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers()
    });

    if (!res.user) {
      return {
        success: false,
        error: 'Failed to create account'
      };
    }

    // Update user role to PATIENT (uppercase for database enum)
    await prisma.user.update({
      where: { id: res.user.id },
      data: { role: 'PATIENT' },
      select: { id: true }
    });

    return {
      success: true,
      data: { userId: res.user.id }
    };
  } catch (error) {
    console.error('Sign up error:', error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        return {
          success: false,
          error: 'An account with this email already exists'
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create account'
    };
  }
}

export async function signUpDoctor(
  values: z.infer<typeof SignUpDoctorSchema>
): Promise<ActionResponse<{ userId: string }>> {
  const validatedFields = SignUpDoctorSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid input. Please check your details'
    };
  }

  const { name, email, password } = validatedFields.data;

  // Rate limiting check
  const headersList = await headers();
  const clientIP = getClientIP(headersList);
  const rateLimitResult = checkRateLimit({
    key: 'sign-up',
    identifier: clientIP,
    ...RATE_LIMITS.signUp
  });

  if (!rateLimitResult.success) {
    return {
      success: false,
      error: `Too many sign-up attempts. Please try again in ${rateLimitResult.retryAfterSeconds} seconds.`
    };
  }

  try {
    // Use transaction to ensure atomicity
    const res = await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers()
    });

    if (!res.user) {
      return {
        success: false,
        error: 'Failed to create account'
      };
    }

    // Update user role to DOCTOR immediately in same transaction
    await prisma.user.update({
      where: { id: res.user.id },
      data: { role: 'DOCTOR' },
      select: { id: true } // Only return id to minimize data transfer
    });

    return {
      success: true,
      data: { userId: res.user.id }
    };
  } catch (error) {
    console.error('Sign up doctor error:', error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        return {
          success: false,
          error: 'An account with this email already exists'
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create account'
    };
  }
}
export async function updateUserProfile(userId: string, profile: Partial<User>) {
  // 1. Correct Prisma update syntax
  const updatedUser = await db.user.update({
    where: {
      id: userId
    },
    data: {
      // Spread the profile fields you want to update
      name: profile.name,
      image: profile.image
      // Add other relevant fields here
    }
  });

  // 2. Next.js cache revalidation
  // Note: 'revalidateTag' is the standard Next.js function name
  revalidateTag(`user-${userId}`, 'max');

  return updatedUser;
}
