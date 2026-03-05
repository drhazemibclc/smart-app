# Testing Guide

## Overview

This project uses Vitest with React Testing Library for unit and component testing.

## Running Tests

```bash
# Run all tests once
bunx vitest run

# Run specific test file
bunx vitest run src/utils/formatDate.test.ts

# Run with verbose output
bunx vitest run --reporter=verbose

# Run with coverage
bunx vitest run --coverage

# Watch mode (for development)
bunx vitest
```

## Test Structure

### File Organization

Place test files adjacent to source files:

```
src/
├── utils/
│   ├── formatDate.ts
│   └── formatDate.test.ts
├── components/
│   └── patients/
│       ├── PatientCard.tsx
│       └── PatientCard.test.tsx
```

### Naming Convention

- Test files: `*.test.ts` or `*.test.tsx`
- Use descriptive test names with `describe` and `it` blocks

## Test Patterns

### 1. Utility Function Tests

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from './formDate';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2026-03-05');
    expect(formatDate(date)).toBe('Mar 5, 2026');
  });

  it('handles invalid dates', () => {
    const result = formatDate('invalid-date-string');
    expect(result).toBe('Invalid date');
  });
});
```

### 2. React Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PatientCard } from './patient-card';

describe('PatientCard', () => {
  const mockPatient = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date(new Date().getFullYear() - 5, 0, 1),
    gender: 'MALE'
  };

  it('renders patient information', () => {
    render(<PatientCard patient={mockPatient} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### 3. Testing with User Interactions

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

describe('Button', () => {
  it('handles click events', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

## Testing Limitations

### Server Actions

Server actions that import database clients or auth cannot be unit tested in isolation due to:
- Environment variable access restrictions
- Database connection requirements
- Server-side only modules

**Solution**: Use integration tests or E2E tests for server actions.

```typescript
// Placeholder test for server actions
describe('createPatientAction', () => {
  it('placeholder test - server actions require integration testing', () => {
    expect(true).toBe(true);
  });
});
```

### Zod Schemas with Prisma Types

Schemas that import from `@/prisma/types` require generated Prisma files and complex dependency chains.

**Solution**: Test schemas through the actions/services that use them, or use integration tests.

## Configuration

### vitest.config.ts

```typescript
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
    setupFiles: ['./src/test/setup.ts']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/prisma/types': path.resolve(__dirname, './src/generated/prisma/browser.ts')
    }
  }
});
```

### Test Setup (src/test/setup.ts)

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NODE_ENV = 'test';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}));
```

## Best Practices

1. **Keep tests simple**: Test one thing at a time
2. **Use descriptive names**: Test names should explain what they test
3. **Avoid testing implementation details**: Test behavior, not internals
4. **Mock external dependencies**: Use `vi.mock()` for external modules
5. **Clean up after tests**: Use `afterEach` for cleanup
6. **Test edge cases**: Include tests for error conditions and edge cases
7. **Use `safeParse` for Zod**: Prefer `safeParse` over `parse` in tests to avoid throwing

## Common Testing Utilities

### React Testing Library

- `render()`: Render a component
- `screen`: Query rendered elements
- `fireEvent`: Trigger events (prefer `userEvent`)
- `userEvent`: Simulate user interactions (more realistic)
- `waitFor()`: Wait for async operations

### Vitest Matchers

- `expect(value).toBe(expected)`: Strict equality
- `expect(value).toEqual(expected)`: Deep equality
- `expect(value).toBeInTheDocument()`: Element exists in DOM
- `expect(fn).toHaveBeenCalled()`: Function was called
- `expect(fn).toThrow()`: Function throws error

## Example Test Suite

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders with default props', () => {
      render(<MyComponent />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with custom props', () => {
      render(<MyComponent label="Custom" />);
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('handles user clicks', async () => {
      const onClick = vi.fn();
      render(<MyComponent onClick={onClick} />);

      await userEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('handles missing data gracefully', () => {
      render(<MyComponent data={null} />);
      expect(screen.getByText('No data')).toBeInTheDocument();
    });
  });
});
```

## Troubleshooting

### Import Errors

If you see "Failed to resolve import" errors:
1. Check that path aliases are configured in `vitest.config.ts`
2. Ensure the file exists at the expected path
3. Consider mocking the problematic import

### Environment Variable Errors

If you see "Attempted to access a server-side environment variable on the client":
1. Add the env var to `src/test/setup.ts`
2. Consider mocking the module that accesses the env var
3. Use integration tests instead of unit tests

### Async Test Failures

If async tests fail or timeout:
1. Use `await` with `userEvent` methods
2. Use `waitFor()` for async state changes
3. Increase timeout if needed: `it('test', async () => {...}, 10000)`
