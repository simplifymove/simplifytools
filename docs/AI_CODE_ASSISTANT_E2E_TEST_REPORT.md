# AI Code Assistant - E2E Integration Test Report

**Test Date**: January 15, 2025  
**Status**: 🔄 IN PROGRESS  
**Environment**: Local (http://localhost:3000)

---

## 📋 Test Checklist

### Phase 1: Backend Infrastructure ✅
- [x] npm run build - **PASSED**
- [x] Prisma schema valid - **PASSED**
- [x] Database schema exists - **PASSED**
- [x] API routes present - **PASSED**
- [ ] Ollama running - **PENDING**
- [ ] Health endpoint responds - **PENDING**

### Phase 2: Test User Creation
- [ ] Create test user script works - **PENDING**
- [ ] User created in database - **PENDING**
- [ ] Subscription created (active) - **PENDING**
- [ ] API key generated - **PENDING**
- [ ] API key stored securely (hashed) - **PENDING**

### Phase 3: API Endpoint Testing
- [ ] GET /api/health - **PENDING**
- [ ] GET /api/ai/models - **PENDING**
- [ ] GET /api/user/ai-subscription - **PENDING**
- [ ] POST /api/ai/generate (success) - **PENDING**
- [ ] POST /api/ai/generate (invalid key) - **PENDING**
- [ ] POST /api/ai/generate (missing machineId) - **PENDING**
- [ ] POST /api/ai/generate (prompt too large) - **PENDING**
- [ ] POST /api/ai/generate (secret detected) - **PENDING**
- [ ] POST /api/ai/generate (expired subscription) - **PENDING**
- [ ] POST /api/ai/generate (insufficient credits) - **PENDING**
- [ ] POST /api/ai/generate (device mismatch) - **PENDING**

### Phase 4: VS Code Extension Testing
- [ ] Extension installs (npm install) - **PENDING**
- [ ] Extension compiles (npm run compile) - **PENDING**
- [ ] Extension loads in dev host (F5) - **PENDING**
- [ ] Set API key command works - **PENDING**
- [ ] API key stored securely - **PENDING**
- [ ] Chat panel opens - **PENDING**
- [ ] Chat sends message - **PENDING**
- [ ] Chat receives response - **PENDING**
- [ ] Explain Selection works - **PENDING**
- [ ] Fix Selection works - **PENDING**
- [ ] Optimize Selection works - **PENDING**
- [ ] Generate Comments works - **PENDING**
- [ ] Debug Error works - **PENDING**
- [ ] .env file blocking works - **PENDING**
- [ ] Large selection warning works - **PENDING**
- [ ] Settings apply correctly - **PENDING**
- [ ] Machine ID persists - **PENDING**

### Phase 5: Security & Privacy
- [ ] API key never logged in plaintext - **PENDING**
- [ ] Machine ID generated and persisted - **PENDING**
- [ ] Device lock works - **PENDING**
- [ ] Device reset flow works - **PENDING**
- [ ] Secret detection prevents requests - **PENDING**
- [ ] UsageLog doesn't store prompt/code - **PENDING**
- [ ] UsageLog only stores metadata - **PENDING**

### Phase 6: Payment & Credits
- [ ] Credits deducted on successful request - **PENDING**
- [ ] Credits display in extension - **PENDING**
- [ ] Credits prevent request when exhausted - **PENDING**
- [ ] Subscription status checked - **PENDING**

### Phase 7: Error Handling
- [ ] INVALID_API_KEY returns 401 - **PENDING**
- [ ] MISSING_API_KEY returns 401 - **PENDING**
- [ ] MISSING_PARAMS returns 400 - **PENDING**
- [ ] PROMPT_TOO_LARGE returns 413 - **PENDING**
- [ ] SECRET_DETECTED returns 403 - **PENDING**
- [ ] DEVICE_NOT_AUTHORIZED returns 403 - **PENDING**
- [ ] INSUFFICIENT_CREDITS returns 402 - **PENDING**
- [ ] RATE_LIMITED returns 429 - **PENDING**
- [ ] SERVER_BUSY returns 503 - **PENDING**
- [ ] OLLAMA_ERROR returns 503 - **PENDING**

---

## 🔧 Test Commands & Expected Responses

### 1. Create Test User
```bash
# Only in development
NODE_ENV=development npx ts-node scripts/create-ai-test-user.ts

# Expected output:
# ✅ User created
# 📋 AI Subscription: active, 1000 credits
# 🔑 API Key: sca_live_...
```

### 2. Health Check
```bash
curl -X GET http://localhost:3000/api/health

# Expected response (200):
{
  "status": "ok",
  "database": "connected",
  "ollama": "connected" (or "offline")
}
```

### 3. Get Models
```bash
curl -X GET http://localhost:3000/api/ai/models

# Expected response (200):
{
  "models": [
    {
      "name": "qwen2.5-coder:7b",
      "size": "7b",
      "context_window": 8192
    }
  ]
}
```

### 4. Get User Subscription
```bash
curl -X GET http://localhost:3000/api/user/ai-subscription \
  -H "Authorization: Bearer <test_api_key>"

# Expected response (200):
{
  "status": "active",
  "creditsRemaining": 1000,
  "creditsUsed": 0,
  "expiresAt": "2025-02-15T..."
}
```

### 5. Generate - Success
```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Authorization: Bearer <test_api_key>" \
  -H "X-Machine-Id: test-machine-001" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "explain this code: const x = 5;",
    "machineId": "test-machine-001",
    "taskType": "chat",
    "stream": false
  }'

# Expected response (200):
{
  "success": true,
  "response": "This code...",
  "creditsCharged": 1,
  "creditsRemaining": 999,
  "model": "Qwen 2.5 Coder",
  "latencyMs": 1234
}
```

### 6. Generate - Invalid API Key
```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Authorization: Bearer invalid_key_12345" \
  -H "X-Machine-Id: test-machine-001" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "test",
    "machineId": "test-machine-001"
  }'

# Expected response (401):
{
  "success": false,
  "error": "Invalid API key",
  "errorCode": "INVALID_API_KEY"
}
```

### 7. Generate - Missing Machine ID
```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Authorization: Bearer <test_api_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "test"
  }'

# Expected response (400):
{
  "success": false,
  "error": "prompt and machineId are required",
  "errorCode": "MISSING_PARAMS"
}
```

### 8. Generate - Prompt Too Large
```bash
# Create a prompt larger than 40,000 characters
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Authorization: Bearer <test_api_key>" \
  -H "X-Machine-Id: test-machine-001" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "'$(printf 'a%.0s' {1..50000})'",
    "machineId": "test-machine-001"
  }'

# Expected response (413):
{
  "success": false,
  "error": "Prompt is too large. Maximum size: 40000 characters",
  "errorCode": "PROMPT_TOO_LARGE"
}
```

### 9. Generate - Secret Detected
```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Authorization: Bearer <test_api_key>" \
  -H "X-Machine-Id: test-machine-001" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Here is my API key: sk-1234567890abcdef",
    "machineId": "test-machine-001"
  }'

# Expected response (403):
{
  "success": false,
  "error": "Sensitive credentials detected",
  "errorCode": "SECRET_DETECTED"
}
```

### 10. Generate - Insufficient Credits
```bash
# Make requests until credits are exhausted (or manually set creditsRemaining to 0)
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Authorization: Bearer <test_api_key>" \
  -H "X-Machine-Id: test-machine-001" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "test",
    "machineId": "test-machine-001"
  }'

# When credits = 0, expected response (402):
{
  "success": false,
  "error": "Insufficient credits",
  "errorCode": "INSUFFICIENT_CREDITS"
}
```

### 11. Generate - Device Mismatch
```bash
# Use a different machineId than what was bound to the key
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Authorization: Bearer <test_api_key>" \
  -H "X-Machine-Id: different-machine-002" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "test",
    "machineId": "different-machine-002"
  }'

# Expected response (403) after first binding:
{
  "success": false,
  "error": "This API key is locked to a different device",
  "errorCode": "DEVICE_NOT_AUTHORIZED"
}
```

---

## ✅ Expected Behavior

### API Key Lifecycle
1. ✅ User creates via test script
2. ✅ Key generated: `sca_live_<48-hex-chars>`
3. ✅ Key hashed with SHA-256 (not bcrypt)
4. ✅ First request binds to machineId
5. ✅ Subsequent requests from same machine work
6. ✅ Requests from different machine blocked (DEVICE_NOT_AUTHORIZED)
7. ✅ Dashboard reset device removes the lock

### Credits System
1. ✅ User has 1000 credits at start
2. ✅ Prompt < 100 chars = 1 credit
3. ✅ Prompt 100-1000 chars = 2 credits
4. ✅ Prompt > 1000 chars = 4 credits
5. ✅ Each successful request decrements credits
6. ✅ creditsRemaining returned in response
7. ✅ When credits = 0, requests blocked (INSUFFICIENT_CREDITS)

### Privacy & Logging
1. ✅ UsageLog does NOT store prompt
2. ✅ UsageLog does NOT store code
3. ✅ UsageLog does NOT store response
4. ✅ UsageLog stores ONLY:
   - userId
   - apiKeyId
   - model name
   - taskType
   - inputCharacters (count, not content)
   - creditsCharged
   - status (success/failed/rejected)
   - errorCode
   - errorMessage
   - latencyMs
   - timestamp (createdAt)

### Security
1. ✅ API key never logged in plaintext
2. ✅ API key compared via SHA-256 hash
3. ✅ Machine ID generated on first request
4. ✅ Machine ID persists in globalState
5. ✅ Secret scanning prevents credential leaks
6. ✅ .env files blocked in extension
7. ✅ Large selections warn user

---

## 🧪 Test Execution Steps

### Prerequisites
```bash
# Terminal 1: Start backend
cd i:\Raghava\Copilot-works\simplifyconvertapp
npm run dev

# Terminal 2: Start Ollama (if available)
ollama serve
# Or pull model if missing:
ollama pull qwen2.5-coder:7b

# Terminal 3: Create test user
cd i:\Raghava\Copilot-works\simplifyconvertapp
NODE_ENV=development npx ts-node scripts/create-ai-test-user.ts
# Copy the API key that's printed
```

### Test Phase 1: Backend Health
```bash
# Terminal 4: Run test requests
curl http://localhost:3000/api/health
curl http://localhost:3000/api/ai/models
```

### Test Phase 2: API Functionality
```bash
# Use the test API key from step above
export TEST_API_KEY="<paste_key_here>"
export TEST_MACHINE_ID="test-machine-001"

# Success case
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Authorization: Bearer $TEST_API_KEY" \
  -H "X-Machine-Id: $TEST_MACHINE_ID" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "hello", "machineId": "'$TEST_MACHINE_ID'"}'

# Error cases (see commands above)
```

### Test Phase 3: VS Code Extension
```bash
# In VS Code
cd extensions/vscode-simplifyconvert-ai
npm install
npm run compile

# Then:
# 1. Press F5 to launch Extension Development Host
# 2. In new VS Code window:
#    - Ctrl+Shift+P → SimplifyConvert AI: Set API Key
#    - Paste test API key
#    - Open chat sidebar (click SimplifyConvert icon)
#    - Send a message
#    - Select code and use "Explain Selection"
```

---

## 📊 Test Results

### Backend
| Test | Command | Expected | Actual | Status |
|------|---------|----------|--------|--------|
| Build | `npm run build` | Exit 0 | ✅ Pass | ✅ |
| Schema | `prisma validate` | Valid | ✅ Pass | ✅ |
| Health | `GET /api/health` | 200 OK | ⏳ Pending | ⏳ |
| Models | `GET /api/ai/models` | 200 models[] | ⏳ Pending | ⏳ |

### Test User
| Test | Command | Expected | Actual | Status |
|------|---------|----------|--------|--------|
| Create | `create-ai-test-user.ts` | User created | ⏳ Pending | ⏳ |
| API Key | Key generated | `sca_live_...` | ⏳ Pending | ⏳ |

### API Endpoints
| Test | Endpoint | Status Code | Expected | Actual | Pass |
|------|----------|------------|----------|--------|------|
| Success | POST /api/ai/generate | 200 | response+credits | ⏳ | ⏳ |
| Invalid Key | POST /api/ai/generate | 401 | INVALID_API_KEY | ⏳ | ⏳ |
| Missing Params | POST /api/ai/generate | 400 | MISSING_PARAMS | ⏳ | ⏳ |
| Prompt Too Large | POST /api/ai/generate | 413 | PROMPT_TOO_LARGE | ⏳ | ⏳ |
| Secret Detected | POST /api/ai/generate | 403 | SECRET_DETECTED | ⏳ | ⏳ |
| No Credits | POST /api/ai/generate | 402 | INSUFFICIENT_CREDITS | ⏳ | ⏳ |
| Device Mismatch | POST /api/ai/generate | 403 | DEVICE_NOT_AUTHORIZED | ⏳ | ⏳ |

### VS Code Extension
| Test | Action | Expected | Actual | Pass |
|------|--------|----------|--------|------|
| Install | `npm install` | Exit 0 | ⏳ | ⏳ |
| Compile | `npm run compile` | Exit 0 | ⏳ | ⏳ |
| Load | F5 launch | Extension loads | ⏳ | ⏳ |
| Set Key | Ctrl+Shift+P command | Key saved | ⏳ | ⏳ |
| Chat | Click sidebar + message | Response shown | ⏳ | ⏳ |
| Explain | Right-click → Explain | Explanation shown | ⏳ | ⏳ |
| Fix | Right-click → Fix | Fixes shown | ⏳ | ⏳ |
| .env Block | Explain in .env | Blocked message | ⏳ | ⏳ |

---

## 🐛 Issues Found

**None yet - testing in progress**

---

## 📝 Manual Steps Remaining

### Before Running Tests
- [ ] Ollama must be running (or properly configured to offline gracefully)
- [ ] Database must be accessible
- [ ] .env configured with DATABASE_URL and Ollama settings
- [ ] Backend must start successfully: `npm run dev`

### Testing Strategy
1. Start backend
2. Create test user (get API key)
3. Test each endpoint with curl
4. Document results
5. Test VS Code extension
6. Document any failures
7. Verify privacy (check UsageLog schema)

### If Ollama Unavailable
- The endpoint should gracefully fail with OLLAMA_ERROR
- Credits should NOT be deducted for failed requests
- UsageLog should record the failure

---

## 📞 Contact

For issues or questions:
- Check backend logs: `npm run dev` output
- Check extension logs: F5 dev host console
- Check database: Prisma Studio (`npx prisma studio`)

---

**Status**: 🔄 In Progress  
**Last Updated**: January 15, 2025  
**Next Step**: Start backend and run Phase 1 tests
