# Postman Authentication Guide

Complete guide for authenticating Postman requests with your Better Auth setup.

## Authentication Overview

Your app uses Better Auth with session-based authentication. Sessions are stored in cookies.

### Auth Endpoints

- **Sign Up**: `POST /api/auth/sign-up/email`
- **Sign In**: `POST /api/auth/sign-in/email`
- **Sign Out**: `POST /api/auth/sign-out`
- **Get Session**: `GET /api/auth/get-session`

## Method 1: Using Postman Desktop (Recommended)

### Step 1: Create Test User

First, create a test user account:

```bash
# Using your admin script
npm run db:admin

# Or manually in database
```

### Step 2: Login Request

1. Create a new request in Postman
2. Set method to `POST`
3. URL: `http://localhost:3000/api/auth/sign-in/email`
4. Headers:
   ```
   Content-Type: application/json
   ```
5. Body (raw JSON):
   ```json
   {
     "email": "admin@example.com",
     "password": "your_password"
   }
   ```

### Step 3: Capture Session Cookie

Add this to the **Tests** tab of your login request:

```javascript
pm.test("Login successful", function() {
    pm.response.to.have.status(200);
});

// Capture session cookie
const cookies = pm.cookies.all();
console.log("All cookies:", cookies);

// Better Auth uses 'auth.session_token' cookie
const sessionCookie = cookies.find(c =>
    c.name === 'auth.session_token' ||
    c.name.includes('session')
);

if (sessionCookie) {
    pm.environment.set("authToken", sessionCookie.value);
    pm.environment.set("sessionCookie", `${sessionCookie.name}=${sessionCookie.value}`);
    console.log("✓ Session saved:", sessionCookie.name);
} else {
    console.log("✗ No session cookie found");
    console.log("Available cookies:", cookies.map(c => c.name));
}
```

### Step 4: Use Session in Requests

**Option A: Collection Pre-request Script** (Automatic)

Add to your collection's Pre-request Script:

```javascript
// Auto-add session cookie to all requests
const sessionCookie = pm.environment.get("sessionCookie");
if (sessionCookie) {
    pm.request.headers.add({
        key: "Cookie",
        value: sessionCookie
    });
}
```

**Option B: Manual Cookie** (Per Request)

In each request, add to Headers:
```
Cookie: auth.session_token={{authToken}}
```

## Method 2: Using Newman CLI

Newman doesn't handle cookies automatically like browsers. You need to manually manage them.

### Step 1: Get Session Token

First, login and extract the session token:

```bash
# Login and save response
curl -c cookies.txt -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_password"}'

# View cookies
cat cookies.txt
```

### Step 2: Extract Token

Look for the `auth.session_token` cookie value in `cookies.txt`.

### Step 3: Set in Environment

Update `.postman/environments/local.json`:

```json
{
  "key": "authToken",
  "value": "your_session_token_here",
  "type": "secret"
}
```

### Step 4: Run Tests

```bash
newman run .postman/collections/pediatric-clinic-medical.json \
  -e .postman/environments/local.json
```

## Method 3: Programmatic Authentication

### Create Auth Helper Script

Create `.postman/scripts/auth-helper.js`:

```javascript
const axios = require('axios');
const fs = require('fs');

async function getAuthToken() {
    try {
        const response = await axios.post('http://localhost:3000/api/auth/sign-in/email', {
            email: 'admin@example.com',
            password: 'your_password'
        }, {
            withCredentials: true
        });

        // Extract session cookie
        const cookies = response.headers['set-cookie'];
        const sessionCookie = cookies?.find(c => c.includes('auth.session_token'));

        if (sessionCookie) {
            const token = sessionCookie.split(';')[0].split('=')

        }
    } catch (error) {
        console.error('✗ Auth failed:', error.message);
        throw error;
    }
}

getAuthToken();
```

Run before tests:

```bash
node .postman/scripts/auth-helper.js
npm run test:postman
```

## Troubleshooting

### Issue: 401 Unauthorized

**Cause**: No session cookie or expired session

**Solutions**:
1. Run login request first
2. Check if cookie was captured: `console.log(pm.environment.get("authToken"))`
3. Verify cookie name matches your Better Auth config
4. Check cookie expiration (7 days by default)

### Issue: Cookie Not Captured

**Cause**: Postman cookie settings

**Solutions**:
1. Enable cookies in Postman: Settings → General → Cookies
2. Check cookie domain matches (localhost)
3. Disable "Automatically follow redirects" if needed
4. Use Postman Interceptor for browser cookies

### Issue: CORS Errors

**Cause**: Cross-origin request blocking

**Solutions**:
1. Ensure `CORS_ORIGIN` includes your Postman origin
2. Add to `next.config.ts`:
   ```typescript
   async headers() {
     return [
       {
         source: '/api/:path*',
         headers: [
           { key: 'Access-Control-Allow-Credentials', value: 'true' },
           { key: 'Access-Control-Allow-Origin', value: 'http://localhost:3000' },
           { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
           { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Cookie' },
         ],
       },
,
  "value": "password123",
  "type": "secret"
}
```

Use in requests:
```json
{
  "email": "{{testEmail}}",
  "password": "{{testPassword}}"
}
```

### 2. Separate Test Accounts

Create dedicated test accounts:

```sql
-- Test admin
INSERT INTO "User" (id, email, name, role, "isAdmin")
VALUES ('test-admin-id', 'test-admin@example.com', 'Test Admin', 'ADMIN', true);

-- Test doctor
INSERT INTO "User" (id, email, name, role)
VALUES ('test-doctor-id', 'test-doctor@example.com', 'Test Doctor', 'DOCTOR');
```

### 3. Auto-Refresh Sessions

Add to collection pre-request:

```javascript
// Check if session is expired
const lastLogin = pm.environment.get("lastLoginTime");
const now = Date.now();
const sessionAge = now - (lastLogin || 0);
const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

if (!lastLogin || sessionAge > maxAge) {
    // Re-login
    pm.sendRequest({
        url: pm.environment.get("baseUrl") + "/api/auth/sign-in/email",
        method: "POST",
        header: {
            "Content-Type": "application/json"
        },
        body: {
            mode: "raw",
            raw: JSON.stringify({
                email: pm.environment.get("testEmail"),
                password: pm.environment.get("testPassword")
            })
        }
    }, function(err, response) {
        if (!err && response.code === 200) {
            const cookies = response.cookies.all();
            const sessionCookie = cookies.find(c => c.name.includes('session'));
            if (sessionCookie) {
                pm.environment.set("authToken", sessionCookie.value);
                pm.environment.set("lastLoginTime", Date.now());
            }
        }
    });
}
```

### 4. Cleanup After Tests

Add to collection post-request:

```javascript
// Logout after last test
if (pm.info.iteration === pm.info.iterationCount - 1) {
    pm.sendRequest({
        url: pm.environment.get("baseUrl") + "/api/auth/sign-out",
        method: "POST"
    }, function(err, response) {
        console.log("Logged out");
        pm.environment.unset("authToken");
        pm.environment.unset("sessionCookie");
    });
}
```

## Security Notes

### Development vs Production

**Development** (localhost):
- Cookies work with `useSecureCookies: false`
- CORS is relaxed
- Session tokens visible in console

**Production**:
- Must use HTTPS
- Set `useSecureCookies: true`
- Strict CORS policy
- Never log session tokens

### Protecting Credentials

1. **Never commit** `.env` files with real credentials
2. **Use secrets** in CI/CD (GitHub Secrets, etc.)
3. **Rotate tokens** regularly
4. **Limit test account** permissions

### Example .env.test

```bash
# Test credentials (safe to commit)
TEST_ADMIN_EMAIL=test-admin@example.com
TEST_ADMIN_PASSWORD=test-password-123

# Real credentials (NEVER commit)
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

## Quick Reference

### Login Request

```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' \
  -c cookies.txt
```

### Authenticated Request

```bash
curl -X GET http://localhost:3000/api/trpc/patient.list \
  -b cookies.txt
```

### Check Session

```bash
curl -X GET http://localhost:3000/api/auth/get-session \
  -b cookies.txt
```

### Logout

```bash
curl -X POST http://localhost:3000/api/auth/sign-out \
  -b cookies.txt
```

## Next Steps

1. ✅ Set up login request in Postman
2. ✅ Capture session cookie
3. ✅ Add pre-request script to collection
4. ✅ Test authenticated endpoint
5. ✅ Add auto-refresh logic
6. ✅ Create test accounts
7. ✅ Document for team

---

For more details, see:
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Postman Cookie Documentation](https://learning.postman.com/docs/sending-requests/cookies/)
- [Main Testing Guide](./POSTMAN_TESTING_GUIDE.md)
