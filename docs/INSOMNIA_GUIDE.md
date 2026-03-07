# Insomnia Testing Guide

Complete guide for testing your Pediatric Clinic API using Insomnia.

## Why Insomnia?

- ✅ Free and open-source
- ✅ Better UI/UX than Postman
- ✅ Native GraphQL and gRPC support
- ✅ Built-in environment management
- ✅ Automatic cookie handling
- ✅ Git sync for teams
- ✅ Plugin system

## Installation

### Desktop App

```bash
# macOS (Homebrew)
brew install --cask insomnia

# Linux (Snap)
sudo snap install insomnia

# Or download from: https://insomnia.rest/download
```

### CLI (Inso)

```bash
# For automated testing
npm install -g insomnia-inso
```

## Quick Start

### 1. Generate Collection

```bash
# Add script to package.json first
npm run generate:insomnia
```

### 2. Import to Insomnia

1. Open Insomnia
2. Click **"Create"** → **"Import From"** → **"File"**
3. Select `.insomnia/collection.json`
4. Collection will appear in sidebar

### 3. Setup Authentication

**Create test user:**
```bash
npm run db:admin
```

**Login in Insomnia:**
1. Open **"Authentication"** folder
2. Click **"Login"** request
3. Update body with your credentials:
   ```json
   {
     "email": "your_email@example.com",
     "password": "your_password"
   }
   ```
4. Click **"Send"**
5. Check response - should be 200 OK
6. Cookies are automatically saved!

### 4. Run Requests

Click any request and hit **"Send"**. Cookies are automatically included.

## Environment Setup

Insomni
apiUrl }}/patient.list
```

## Authentication

### Automatic Cookie Handling

Insomnia automatically:
- Saves cookies from responses
- Sends cookies with subsequent requests
- Manages cookie expiration

No manual setup needed! Just login once.

### Manual Cookie Management

If needed, view/edit cookies:

1. Click **"Cookies"** (top right)
2. View all cookies for domain
3. Add/edit/delete manually

### Session Persistence

Sessions persist across Insomnia restarts. To clear:

1. Click **"Cookies"**
2. Delete `auth.session_token` cookie
3. Or logout via **"Logout"** request

## Testing Workflow

### 1. Health Check

```
GET {{ _.baseUrl }}/api/health
```

Should return 200 OK.

### 2. Login

```
POST {{ _.baseUrl }}/api/auth/sign-in/email
Body: { "email": "...", "password": "..." }
```

Cookie is automatically saved.

### 3. Create Patient

```
POST {{ _.apiUrl }}/patient.create
Body: { "firstName": "John", ... }
```

Response includes patient ID.

### 4. Save Patient ID

Right-click response → **"Copy Response Body"**

Then:
1. Click environment dropdown
2. Edit environment
3. Set `patientId` to the ID from response

Or use Insomnia's response chaining (see below).

### 5. Create Medical Record

```
POST {{ _.apiUrl }}/medical.createMedicalRecord
Body: { "patientId": "{{ _.patientId }}", ... }
```

Uses the saved patient ID.

## Advanced Features

### Response Chaining

Extract values from previous responses:

```json
{
  "patientId": "{% response 'body', 'req_patient_create', 'b64::JC5yZXN1bHQuZGF0YS5pZA==::46b', 'never', 60 %}"
}
```

To set up:
1. Type `{{` in request body
2. Select **"Response"** → **"Body Attribute"**
3. Choose the request and JSON path
4. Value is automatically extracted!

### Request Chaining

Run multiple requests in sequence:

1. Install **"Request Chaining"** plugin
2. Create a chain in **"Design"** tab
3. Requests run automatically in order

### Code Generation

Generate code for any request:

1. Click request
2. Click **"Generate Code"** (top right)
3. Choose language (curl, Node.js, Python, etc.)
4. Copy code

Example curl:
```bash
curl -X POST http://localhost:3000/api/trpc/patient.create \
  -H "Content-Type: application/json" \
  -H "Cookie: auth.session_token=..." \
  -d '{"firstName":"John","lastName":"Doe",...}'
```

### GraphQL Support

If you add GraphQL to your API:

1. Create new request
2. Select **"GraphQL"** type
3. Insomnia auto-fetches schema
4. Get autocomplete and validation!

### Plugins

Extend Insomnia with plugins:

1. **Preferences** → **"Plugins"**
2. Search and install:
   - `insomnia-plugin-response-validator` - Validate responses
   - `insomnia-plugin-faker` - Generate fake data
   - `insomnia-plugin-timestamp` - Add timestamps

## CLI Testing (Inso)

### Run Tests from CLI

```bash
# Install inso
npm install -g insomnia-inso

# Export collection
inso export spec .insomnia/collection.json > collection.yaml

# Run all requests
inso run test collection.yaml --env "Local Development"

# Run specific folder
inso run test collection.yaml --env "Local Development" --testNamePattern "Patients"
```

### CI/CD Integration

```yaml
# .github/workflows/insomnia-tests.yml
name: Insomnia API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          npm ci
          npm install -g insomnia-inso

      - name: Start app
        run: npm run dev &

      - name: Wait for app
        run: npx wait-on http://localhost:3000

      - name: Run tests
        run: inso run test .insomnia/collection.json --env "CI"
```

## Comparison: Insomnia vs Postman

| Feature                   | Insomnia             | Postman               |
| ------------------------- | -------------------- | --------------------- |
| **Price**                 | Free & Open Source   | Free tier limited     |
| **UI/UX**                 | Modern, clean        | Feature-rich, complex |
| **Cookie Handling**       | Automatic            | Manual setup needed   |
| **GraphQL**               | Native support       | Plugin needed         |
| **Environment Variables** | Simple `{{ _.var }}` | `{{var}}`             |
| **Response Chaining**     | Built-in             | Requires scripts      |
| **Git Sync**              | Built-in             | Paid feature          |
| **CLI**                   | Inso (free)          | Newman (free)         |
| **Plugins**               | Growing ecosystem    | Large ecosystem       |
| **Learning Curve**        | Easy                 | Moderate              |

## Tips & Tricks

### 1. Organize with Folders

Create folder structure:
```
Pediatric Clinic API/
├── Authentication/
├── Patients/
│   ├── CRUD Operations/
│   └── Search & Filter/
├── Medical Records/
├── Appointments/
└── Admin/
```

### 2. Use Request Groups

Group related requests:
- Right-click folder → **"New Request Group"**
- Add description
- Set common headers/auth

### 3. Keyboard Shortcuts

- `Ctrl/Cmd + N` - New request
- `Ctrl/Cmd + Enter` - Send request
- `Ctrl/Cmd + E` - Switch environment
- `Ctrl/Cmd + K` - Quick switcher
- `Ctrl/Cmd + /` - Toggle sidebar

### 4. Request History

View all past requests:
- Click **"Debug"** tab (bottom)
- See timeline of all requests
- Click to re-run

### 5. Export/Import

Share with team:
- Right-click workspace → **"Export"**
- Choose format (JSON, YAML)
- Commit to Git
- Team imports the file

### 6. Dark Mode

**Preferences** → **"Themes"** → Choose theme

### 7. Proxy Settings

For debugging:
- **Preferences** → **"Proxy"**
- Enable proxy
- Use with tools like Charles or Fiddler

## Troubleshooting

### Issue: 401 Unauthorized

**Solution:**
1. Run login request first
2. Check cookies: Click **"Cookies"** → Verify `auth.session_token` exists
3. Check session expiry (7 days)
4. Re-login if expired

### Issue: Cookies not saved

**Solution:**
1. Check response has `Set-Cookie` header
2. Verify domain matches (localhost)
3. Check cookie settings: **Preferences** → **"General"** → Enable cookies
4. Try clearing all cookies and re-login

### Issue: Environment variables not working

**Solution:**
1. Check environment is selected (top-left dropdown)
2. Verify variable name: `{{ _.variableName }}` (note the underscore!)
3. Check variable is defined in environment
4. Try `{{ _.baseUrl }}` to test

### Issue: Request fails with CORS error

**Solution:**
1. CORS doesn't apply to Insomnia (it's not a browser)
2. If you see CORS errors, it's likely a different issue
3. Check server is running: `npm run dev`
4. Verify URL is correct

### Issue: Can't import collection

**Solution:**
1. Verify JSON is valid: `cat .insomnia/collection.json | jq`
2. Try importing as "File" not "URL"
3. Check Insomnia version (need v2023.5+)
4. Regenerate: `npm run generate:insomnia`

## Best Practices

### 1. Use Workspaces

Separate workspaces for:
- Development
- Staging
- Production
- Testing

### 2. Document Requests

Add descriptions:
- Right-click request → **"Edit"**
- Add description with:
  - What it does
  - Required parameters
  - Expected response
  - Example usage

### 3. Use Pre-request Scripts

Run code before request:
```javascript
// Generate timestamp
const timestamp = Date.now();
insomnia.environment.set('timestamp', timestamp);

// Generate random data
const randomEmail = `test${timestamp}@example.com`;
insomnia.environment.set('testEmail', randomEmail);
```

### 4. Version Control

Commit to Git:
```bash
git add .insomnia/
git commit -m "Add Insomnia collection"
```

Team members can import and stay in sync.

### 5. Use Tags

Tag requests for organization:
- `#auth` - Authentication
- `#crud` - CRUD operations
- `#admin` - Admin only
- `#test` - Test requests

## Migration from Postman

### Export from Postman

1. Open Postman
2. Select collection
3. Click **"..."** → **"Export"**
4. Choose **"Collection v2.1"**
5. Save file

### Import to Insomnia

1. Open Insomnia
2. Click **"Create"** → **"Import From"** → **"File"**
3. Select exported Postman collection
4. Insomnia converts automatically!

### Differences to Note

- Environment variables: `{{var}}` → `{{ _.var }}`
- Pre-request scripts: Different API
- Tests: Use plugins or Inso
- Cookies: Automatic in Insomnia

## Resources

- [Insomnia Docs](https://docs.insomnia.rest/)
- [Inso CLI Docs](https://docs.insomnia.rest/inso-cli/introduction)
- [Plugin Hub](https://insomnia.rest/plugins)
- [GitHub](https://github.com/Kong/insomnia)

## Next Steps

1. ✅ Install Insomnia
2. ✅ Generate and import collection
3. ✅ Login and test authentication
4. ✅ Run a few requests
5. ✅ Set up environment variables
6. ✅ Explore advanced features
7. ✅ Share with team

---

**Need help?** Check the [Insomnia documentation](https://docs.insomnia.rest/) or open an issue.
