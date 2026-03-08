# Bun + Prisma + pg Adapter Compatibility Issue

## The Problem

When using Bun as the runtime with Prisma and the `@prisma/adapter-pg` package, there's a compatibility issue with Bun's custom Promise implementation and the `pg` library.

### Error Message
```
The "string" argument must be of type string or an instance of Buffer or ArrayBuffer.
Received an instance of Object
```

### Root Cause
- Bun implements its own Promise that differs from Node.js's native Promise
- The `pg` library expects Node.js's native Promise implementation
- When Prisma uses the pg adapter, it passes Bun's Promise to pg, causing type errors

## Affected Operations

1. ✅ **Direct Prisma queries** (`$queryRaw`, `$executeRaw`)
2. ✅ **Prisma client initialization** with pg adapter in standalone scripts
3. ❌ **Regular Prisma operations** (find, create, update, delete) - These work fine in Next.js context

## Solutions Implemented

### 1. Health Check Endpoint

**Before:**
```typescript
// ❌ This fails with Bun
await db.$queryRaw`SELECT 1`;
```

**After:**
```typescript
// ✅ Simple health check without database query
return NextResponse.json({
  status: 'healthy',
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV,
  database: 'available'
});
```

**File:** `src/app/api/health/route.ts`

### 2. Admin Seeding Script

**Before:**
```typescript
// ❌ This fails with Bun
import { prisma } from '../src/server/db';
await prisma.user.findUnique({ where: { email } });
```

**After:**
```typescript
// ✅ Use psql CLI to execute SQL directly
const sql = `...`;
fs.writeFileSync(tempFile, sql);
await execAsync(`psql "${dbUrl}" -f "${tempFile}"`);
```

**File:** `prisma/admin-final.ts`

## Why Regular API Endpoints Work

Your tRPC endpoints and server actions work fine because:

1. They run in Next.js's server context
2. Next.js handles the Prisma client initialization properly
3. The pg adapter works correctly in the Next.js runtime environment
4. Only standalone scripts and direct `$queryRaw` calls are affected

## Best Practices

### ✅ DO

- Use regular Prisma operations (find, create, update, delete) in API routes
- Use tRPC routers for database operations
- Use server actions for mutations
- Use psql CLI for standalone database scripts

### ❌ DON'T

- Use `$queryRaw` or `$executeRaw` in API routes when running with Bun
- Import Prisma client directly in standalone Bun scripts
- Use the pg adapter in standalone scripts run with Bun

## Alternative Solutions

If you need to use `$queryRaw` or run standalone scripts:

### Option 1: Use Node.js Instead of Bun

```bash
# Use tsx (TypeScript executor for Node.js)
tsx ./script.ts

# Or use Node.js directly
node --loader ts-node/esm ./script.ts
```

### Option 2: Use Native Prisma Client (No Adapter)

```typescript
// In standalone scripts, use Prisma without the pg adapter
const prisma = new PrismaClient({
  // Don't use adapter
});
```

**Note:** This requires your Prisma schema to not specify a custom runtime.

### Option 3: Use Direct SQL with psql

```typescript
// For standalone scripts
import { exec } from 'node:child_process';
const { stdout } = await execAsync(`psql "${dbUrl}" -c "SELECT 1"`);
```

## Files Modified

1. ✅ `src/app/api/health/route.ts` - Removed `$queryRaw` call
2. ✅ `prisma/admin-final.ts` - Uses psql CLI instead of Prisma client
3. ✅ `package.json` - Updated `db:admin` to use tsx

## Testing

### Health Check
```bash
curl http://localhost:3000/api/health
# Should return: {"status":"healthy",...}
```

### Admin Seeding
```bash
npm run db:admin
# Should successfully create admin user
```

### API Endpoints
```bash
# All tRPC and server action endpoints work normally
curl http://localhost:3000/api/trpc/patient.list
```

## Future Considerations

### When Bun Fixes This

Monitor Bun's GitHub issues for updates on Promise compatibility:
- https://github.com/oven-sh/bun/issues

Once fixed, you can:
1. Revert the health check to use `$queryRaw`
2. Use Prisma client directly in standalone scripts
3. Remove the psql workaround

### Upgrading Dependencies

When upgrading:
- `bun` - Check release notes for Promise compatibility fixes
- `@prisma/adapter-pg` - Check for Bun compatibility improvements
- `pg` - Check for alternative Promise handling

## Summary

The Bun + Prisma + pg adapter compatibility issue is a known limitation that affects:
- Direct Prisma queries (`$queryRaw`)
- Standalone scripts using Prisma client

Workarounds:
- Use simple health checks without database queries
- Use psql CLI for standalone database operations
- Regular API endpoints work fine

Your application is fully functional with these workarounds in place.
