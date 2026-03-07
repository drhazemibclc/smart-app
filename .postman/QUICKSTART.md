# Postman Testing - Quick Start Guide

Get up and running with Postman testing in 5 minutes.

## Prerequisites Check

```bash
# 1. Check Node.js version (need 18+)
node --version

# 2. Check if app runs
npm run dev
# Visit http://localhost:3000 - should load

# 3. Check database
npm run db:push
npm run db:seed
```

## Step 1: Install Newman (CLI Runner)

```bash
npm install -g newman newman-reporter-htmlextra
```

## Step 2: Generate Collection

```bash
npm run generate:postman
```

This creates `.postman/collections/pediatric-clinic-medical.json`

## Step 3: Run Your First Test

### Option A: Using Newman CLI (Recommended for CI/CD)

```bash
# Make sure your dev server is running in another terminal
npm run dev

# In a new terminal, run tests
npm run test:postman
```

### Option B: Using Postman Desktop (Recommended for Development)

1. **Download Postman:**
   - Visit https://www.postman.com/downloads/
   - Install for your OS

2. **Import Collection:**
   - Open Postman
   - Click "Import" button (top left)
   - Drag and drop `.postman/collections/pediatric-clinic-medical.json`
   - Click "Import"

3. **Import Environment:**
   - Click "Environments" in left sidebar
   - Click "Import"
   - Select `.postman/environments/local.json`
   - Click "Import"

4. **Select Environment:**
   - Top-right dropdown → Select "Local Development"

5. **Run Tests:**
   - Click on "Pediatric Clinic API - Medical Records" collection
   - Click "Run" button (top right)
   - Click "Run Pediatric Clinic API"
   - Watch tests execute!

## Step 4: View Results

### CLI Results
```bash
# Run with HTML report
npm run test:postman:report

# Open the report
open test-reports/postman-report.html
# or on Linux: xdg-open test-reports/postman-report.html
```

### Postman Desktop Results
- Results appear in the runner window
- Green = passed, Red = failed
- C
4. Fix Issues
If tests fail:
- Check the error message
- Review the request/response in Postman
- Fix your code
- Re-run tests

## Example Test Run

```bash
$ npm run test:postman

newman

Pediatric Clinic API - Medical Records

→ Create Test Patient
  POST http://localhost:3000/api/trpc/patient.create [200 OK, 1.2KB, 145ms]
  ✓  Patient created successfully

→ Create Medical Record
  POST http://localhost:3000/api/trpc/medical.createRecord [200 OK, 2.1KB, 89ms]
  ✓  Medical record created successfully
  ✓  Vital signs are recorded correctly

→ List Medical Records
  GET http://localhost:3000/api/trpc/medical.listRecords [200 OK, 3.5KB, 67ms]
  ✓  List records returns successfully
  ✓  Pagination works correctly

┌─────────────────────────┬────────────┬────────────┐
│                         │   executed │     failed │
├─────────────────────────┼────────────┼────────────┤
│              iterations │          1 │          0 │
├─────────────────────────┼────────────┼────────────┤
│                requests │          3 │          0 │
├─────────────────────────┼────────────┼────────────┤
│            test-scripts │          6 │          0 │
├─────────────────────────┼────────────┼────────────┤
│      prerequest-scripts │          3 │          0 │
├─────────────────────────┼────────────┼────────────┤
│              assertions │          5 │          0 │
├─────────────────────────┴────────────┴────────────┤
│ total run duration: 1.2s                          │
├───────────────────────────────────────────────────┤
│ total data received: 6.8KB (approx)               │
├───────────────────────────────────────────────────┤
│ average response time: 100ms [min: 67ms, max: 145ms] │
└───────────────────────────────────────────────────┘
```

## Troubleshooting

### "Collection not found"
```bash
npm run generate:postman
```

### "Connection refused"
Make sure dev server is running:
```bash
npm run dev
```

### "Database error"
Reset and seed database:
```bash
npm run db:reset
npm run db:seed
```

### "Newman not found"
Install Newman globally:
```bash
npm install -g newman newman-reporter-htmlextra
```

### Tests fail with authentication errors
Check if you have a valid user account. Create one:
```bash
npm run db:admin
```

## Next Steps

1. ✅ Run your first test
2. 📖 Read full guide: [docs/POSTMAN_TESTING_GUIDE.md](../docs/POSTMAN_TESTING_GUIDE.md)
3. 🔧 Customize tests in `.postman/tests/`
4. 🚀 Set up CI/CD integration
5. 📊 Create Postman monitors

## Need Help?

- Full documentation: `docs/POSTMAN_TESTING_GUIDE.md`
- Postman docs: https://learning.postman.com/
- Newman docs: https://github.com/postmanlabs/newman
- Open an issue in the repository

---

Happy Testing! 🚀
