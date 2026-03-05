// import { sendEmail } from '@better-auth/dash';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { APIError, betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { admin, customSession } from 'better-auth/plugins';
import 'dotenv/config';

import { env } from '../../env/server';
import { generateId } from '../../lib/id';
import prisma from '../db/client';
import { ac, roles } from './roles';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      console.log('Password reset email would be sent to:', user.email, url);
    }
  },
  experimental: { joins: true },
  baseURL: process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL,
  advanced: {
    database: {
      generateId: () => generateId(),
      defaultFindManyLimit: 100
    },
    useSecureCookies: false,
    cookiePrefix: 'auth',
    crossSubDomainCookies: {
      enabled: true,
      domain: 'localhost'
    }
  },
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'error' : 'info',
    disabled: false
  },
  user: {
    additionalFields: {
      pushNotificationsEnabled: {
        input: false,
        required: true,
        type: 'boolean',
        defaultValue: true
      },
      emailNotificationsEnabled: {
        input: false,
        required: true,
        type: 'boolean',
        defaultValue: true
      },
      role: {
        type: ['ADMIN', 'DOCTOR', 'STAFF', 'PATIENT'],
        required: false,
        defaultValue: 'DOCTOR',
        input: false
      },
      clinicId: {
        type: 'string',
        required: false,
        input: false
      },
      phone: {
        type: 'string',
        required: false,
        input: true
      },
      isAdmin: {
        type: 'boolean',
        required: false,
        defaultValue: false,
        input: false
      }
    },
    deleteUser: {
      enabled: true,
      beforeDelete: async user => {
        const fullUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, isAdmin: true }
        });

        if (fullUser?.role?.toLowerCase() === 'admin' || fullUser?.isAdmin) {
          throw new APIError('BAD_REQUEST', {
            message: "Admin accounts can't be deleted"
          });
        }
      }
    },
    changeEmail: {
      enabled: true
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    storeSessionInDatabase: true,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60
    }
  },
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: 'database',
    modelName: 'rateLimit',
    customRules: {
      '/get-session': {
        window: 60,
        max: 60
      },
      '/login/email': {
        window: 300,
        max: 5
      },
      '/sign-up/email': {
        window: 300,
        max: 5
      },
      '/forget-password': {
        window: 300,
        max: 3
      },
      '/reset-password': {
        window: 300,
        max: 5
      }
    }
  },
  databaseHooks: {
    user: {
      create: {
        before: async user => {
          const email = user.email?.trim().toLowerCase();
          if (!(email && EMAIL_REGEX.test(email))) {
            throw new APIError('BAD_REQUEST', {
              message: 'Invalid email format'
            });
          }
          return {
            data: {
              ...user,
              email,
              name: user.name?.trim() || 'Unnamed User',
              role: 'PATIENT',
              isAdmin: false
            }
          };
        }
      }
    }
  },
  plugins: [
    // twoFactor(),
    admin({
      ac,
      roles
    }),
    // Temporarily disable custom session to isolate the issue
    customSession(async ({ user, session }) => {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          role: true,
          clinicMembers: {
            select: {
              userId: true,
              role: true,
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });

      const primaryClinic = dbUser?.clinicMembers?.length ? dbUser.clinicMembers[0] : null;

      return {
        ...session,
        user: {
          ...user,
          role: dbUser?.role ?? 'PATIENT',
          clinic: primaryClinic
            ? {
                id: primaryClinic.userId,
                name: primaryClinic.user.name
              }
            : undefined
        }
      };
    }),
    nextCookies()
  ]
});

export type Session = typeof auth.$Infer.Session;
export type User = Session['user'] & { role: string };
export type Role = keyof typeof roles;
