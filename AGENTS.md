<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md - Smart App Developer Guide

## Project Overview

- **Framework**: Next.js 16 (canary) with App Router
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS v4
- **Linting/Formatting**: Biome
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Better Auth
- **API**: tRPC
- **State**: React Query + Zustand
- **Testing**: Vitest

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run Biome linter
npm run check        # Biome check with auto-fix
npm run format       # Biome formatter

# Database
npm run db:generate # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:push      # Push schema
npm run db:seed      # Seed database

# Testing
npx vitest run                       # Run tests once
npx vitest run src/utils/some.test.ts  # Run single test
npx vitest run --reporter=verbose src/utils/some.test.ts  # Verbose
```

## Code Style

- **Line width**: 120 characters
- **Indentation**: 2 spaces
- **Quotes**: Single quotes in JS/TS
- **Semicolons**: Always required
- **Trailing commas**: None

### File Organization
```
src/
├── actions/     # Server actions
├── app/        # Next.js App Router
├── components/ # React components (ui/, patients/, etc.)
├── config/     # Configuration
├── hooks/      # Custom React hooks
├── lib/        # Libraries
├── logger/     # Logging
├── server/     # Server-side (DB, auth)
├── trpc/       # tRPC setup
└── utils/      # Utilities
```

### Import Order (Biome)
1. URL imports, 2. Node.js built-ins, 3. pnpm packages, 4. Package with protocol, 5. Regular packages, 6. Alias (`@repo/**`), 7. Path imports (`@/*`)

### Naming
- **Components**: PascalCase (`PatientTable.tsx`)
- **Hooks**: camelCase with `use` prefix (`usePatient.ts`)
- **Utils**: camelCase (`formatDate.ts`)
- **Constants**: SCREAMING_SNAKE_CASE

### TypeScript
- Strict mode enabled - avoid `any`
- Prefer type inference
- Use interfaces for object shapes, types for unions/primitives

### Server Actions
```typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function createPatientAction(input: unknown) {
  // 1. Auth
  const session = await getSession();
  if (!session?.user) throw new Error('Unauthorized');

  // 2. Validate with Zod
  const validated = CreatePatientSchema.parse(input);

  // 3. Delegate to service
  const result = await patientService.create(validated);

  // 4. Revalidate
  revalidatePath('/dashboard/patients');
  return { success: true, data: result };
}
```

### Client Components
```typescript
'use client';

import { useState } from 'react';

export default function PatientForm({ onSubmit }: PatientFormProps) {
  const [loading, setLoading] = useState(false);
  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

### Error Handling
- Use Zod for validation
- Throw `new Error('message')` for runtime errors
- Return `{ success: boolean; data?: T; error?: string }` pattern in actions

### Database
- Prisma for ORM, schemas in `prisma/schema.prisma`
- Service layer: actions call services, services handle DB

### UI Components
- Use shadcn/ui from `src/components/ui/`
- Use `cn()` utility for className merging
- Use CVA for component variants

### Testing
- Test files: `*.test.ts` or `*.spec.ts`
- Use `@testing-library/react` + `jsdom`
- Place tests adjacent to source files or in `__tests__/`

### Key Patterns
1. **Path Aliases**: Use `@/*` for `src/*`
2. **Server-Client Boundary**: Mark client components with `'use client'`
3. **Env Vars**: Use `@t3-oss/env-nextjs` for type-safe envs
4. **Logging**: Use `src/logger/` for server-side logging
5. **Caching**: Use `revalidatePath` and `revalidateTag`

## Project Structure Details

- **app/**: Next.js App Router pages and layouts
- **actions/**: Server actions for data mutations
- **components/ui/**: shadcn/ui component library
- **components/patients/**: Patient-related feature components
- **server/db/**: Database utilities, services, and Prisma client
- **server/auth/**: Better Auth configuration and role management
- **server/redis/**: Redis client, caching, and queue management
- **trpc/**: tRPC client configuration
- **generated/**: Auto-generated Prisma and Zod schemas

### Common Tasks
- Adding a new page: Create in `app/` with layout.tsx if needed
- Adding a new API endpoint: Use server actions in `actions/`
- Adding UI components: Use shadcn/ui, place in `components/ui/`
- Database changes: Modify `prisma/schema.prisma`, then run migrations
- Form validation: Use Zod schemas from generated types
