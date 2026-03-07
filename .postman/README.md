# Postman Testing Setup

This directory contains Postman collections, environments, and test scripts for API testing.

## Directory Structure

```
.postman/
├── collections/          # Postman collections (auto-generated)
├── environments/         # Environment configurations
│   ├── local.json       # Local development
│   ├── ci.json          # CI/CD environment
│   └── staging.json     # Staging environment (create if needed)
├── tests/               # Test scripts
│   └── medical-records.test.js
└── README.md           # This file
```

## Quick Start

### 1. Generate Collection
```bash
npm run generate:postman
```

### 2. Import to Postman
- Open Postman Desktop
- Click "Import"
- Select `.postman/collections/pediatric-clinic-medical.json`
- Import environment from `.postman/environments/local.json`

### 3. Run Tests

**In Postman Desktop:**
- Select "Local Development" environment
- Right-click collection → "Run collection"

**Using Newman CLI:**
```bash
npm run test:postman
```

## Available Scripts

```bash
# Generate Postman collection
npm run generate:postman

# Run all tests
npm run test:postman

# Run with HTML report
npm run test:postman:report

# Run specific folder
npm run test:postman:medical
```

## Environment Variables

### Local Development
- `baseUrl`: http://localhost:3000
- `apiUrl`: http://localhost:3000/api/trpc
- `authToken`: (set after login)

### Required Setup
1. Start your dev server: `npm run dev`
2. Ensure database is running
3. Run migrations: `npm run db:push`
4. Seed data: `npm run db:seed`

## Writing Tests

Test files in `tests/` directory are used as pre-request scripts in the collection.

Example test structure:
```javascript
pm.test("Test name", function() {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    pm.expect(response).to.have.property("result");
});
```

## Authentication

The collection includes authentication setup:
1. Login request sets `authToken` in environment
2. All subsequent requests use this token
3. Token is auto-refreshed if expired

## Test Data

Test data is generated dynamically using timestamps to ensure uniqueness:
- Patient names: `TestPatient{timestamp}`
- Emails: `test{timestamp}@example.com`
- Phone numbers: Random 10-digit numbers

## Cleanup

Tests automatically cleanup created data after completion. To manually cleanup:
```bash
# Reset database
npm run db:reset
npm run db:seed
```

## Troubleshooting

### Tests Failing
1. Check if dev server is running: `curl http://localhost:3000/api/health`
2. Verify database connection
3. Check environment is selected in Postman
4. Review test output for specific errors

### Authentication Issues
1. Ensure you have a valid user account
2. Check token in environment variables
3. Verify token hasn't expired
4. Try re-running login request

### Collection Not Found
1. Run `npm run generate:postman` to regenerate
2. Check `.postman/collections/` directory exists
3. Verify file permissions

## CI/CD Integration

Tests run automatically in CI/CD pipelines. See `.github/workflows/postman-tests.yml` for configuration.

## Documentation

Full documentation: [docs/POSTMAN_TESTING_GUIDE.md](../docs/POSTMAN_TESTING_GUIDE.md)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review test output logs
3. Check Postman console for detailed errors
4. Open an issue in the repository
