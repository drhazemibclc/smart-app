# Quick Authentication Setup for Postman

## Problem
Tests are failing with 401 Unauthorized because tRPC endpoints require authentication.

## Solution (3 Steps)

### Step 1: Create Test User

```bash
# Option A: Use admin script
npm run db:admin

# Option B: Manual SQL
psql your_database -c "
INSERT INTO \"User\" (id, email, name, \"emailVerified\", role, \"isAdmin\", \"createdAt\", \"updatedAt\")
VALUES (
  'test-admin-123',
  'test@example.com',
  'Test Admin',
  true,
  'ADMIN',
  true,
  NOW(),
  NOW()
);

INSERT INTO \"Account\" (id, \"userId\", \"accountId\", \"providerId\", password, \"createdAt\", \"updatedAt\")
VALUES (
  'test-account-123',
  'test-admin-123',
  'test@example.com',
  'credential',
  '\$2a\$10\$YourHashedPasswordHere',  -- Use bcrypt to hash 'password123'
  NOW(),
  NOW()
);
"
```

### Step 2: Login in Postman

1. Open Postman Desktop
2. Import collection: `.postman/collections/pediatric-clinic-medical.json`
3. Import environment: `.postman/environments/local.json`
4. Select "Local Development" environment (top-right dropdown)
5. Open "Authentication → Login" request
6. Update body with your credentials:
   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```
7. Click "Send"
8. Check "Tests" tab - should show "✓ Auth token saved"

### Step 3: Run Tests

Now all requests will automatically include the session cookie.

Click "Run" on the collection to run all tests.

## Verification

Check if auth is working:

```javascript
// In Postman Console (View → Show Postman Console)
console.log(pm.environment.get("authToken"));
// Should show a long token string
```

## For Newman CLI

### Option 1: Manual Token

1. Login via curl:
   ```bash
   curl -c cookies.txt -X POST http://localhost:3000/api/auth/sign-in/email \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

2. Extract token from `cookies.txt`

3. Update `.postman/environments/local.json`:
   ```json
   {
     "key": "authToken",
     "value": "your_token_here"
   }
   ```

4. Run tests:
   ```bash
   npm run test:postman
   ```

### Option 2: Automated Script

Create `.postman/scripts/login.sh`:

```bash
#!/bin/bash

# Login and extract token
RESPONSE=$(curl -s -c /tmp/cookies.txt -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

# Extract session token
TOKEN=$(grep 'auth.session_token' /tmp/cookies.txt | awk '{print $7}')

if [ -n "$TOKEN" ]; then
  # Update environment file
  jq --arg token "$TOKEN" '.values |= map(if .key == "authToken" then .value = $token else . end)' \
    .postman/environments/local.json > /tmp/env.json
  mv /tmp/env.json .postman/environments/local.json
  echo "✓ Auth token updated"
else
  echo "✗ Login failed"
  exit 1
fi
```

Make executable and run:
```bash
chmod +x .postman/scripts/login.sh
./.postman/scripts/login.sh
npm run test:postman
```

## Troubleshooting

### "No session cookie found"

**Check cookie settings:**
- Postman → Settings → General → Cookies → Enable

**Check cookie domain:**
- Cookies must match domain (localhost)

**Check response:**
- Look at login response headers for `Set-Cookie`

### "401 Unauthorized" on all requests

**Session expired:**
- Re-run login request
- Check session expiry (7 days default)

**Cookie not being sent:**
- Check pre-request script is active
- Verify `authToken` is set: `pm.environment.get("authToken")`

### "404 Not Found"

**Wrong endpoint:**
- Check procedure name (e.g., `medical.createMedicalRecord` not `medical.createRecord`)
- Verify router exists in `src/server/api/routers/index.ts`

## Quick Test

Run this in Postman Console to verify auth:

```javascript
pm.sendRequest({
    url: pm.environment.get("baseUrl") + "/api/auth/get-session",
    method: "GET"
}, function(err, response) {
    console.log("Session:", response.json());
});
```

Should return your user session, not null.

## Next Steps

1. ✅ Create test user
2. ✅ Login in Postman
3. ✅ Verify token is saved
4. ✅ Run collection
5. 📖 Read full guide: `docs/POSTMAN_AUTH_GUIDE.md`

---

**Still having issues?** Check the full authentication guide: `docs/POSTMAN_AUTH_GUIDE.md`
