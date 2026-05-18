# AI Code Assistant MVP - Quick Reference

## 📦 Complete File Manifest

### Backend Modules (10 files in `lib/`)

**AI & Credit Management**
- `lib/ai/ollama.ts` - Ollama API integration
- `lib/ai/credit-calculator.ts` - Credit tier calculation

**API Key Management**
- `lib/api-keys/generate.ts` - Key generation and hashing
- `lib/api-keys/validate.ts` - Key and subscription validation

**Billing**
- `lib/billing/razorpay.ts` - Razorpay order and webhook handling

**Device & Security**
- `lib/device/device-lock.ts` - Device authorization
- `lib/security/rate-limit.ts` - Rate limiting (30 req/min)

**Email & Memory (MVP Placeholders)**
- `lib/email/send-reminder.ts` - Subscription reminder structure
- `lib/memory/memory-service.ts` - Project memory structure

**Authentication**
- `lib/auth/config.ts` - NextAuth.js configuration

### API Routes (7 endpoints in `app/api/`)

**Payments**
```
POST /api/payments/create-order
POST /api/payments/webhook
```

**User Management**
```
GET /api/user/ai-subscription
POST /api/user/api-key/regenerate
POST /api/user/device/reset
```

**AI Generation**
```
POST /api/ai/generate (Main AI endpoint)
GET /api/ai/models
```

### Frontend Pages (4 public in `app/ai-code-assistant/`)

```
/ai-code-assistant           → Landing page
/ai-code-assistant/pricing   → Pricing & checkout
/ai-code-assistant/docs      → API documentation
/dashboard/ai-code-assistant → User dashboard
```

### Database (`prisma/schema.prisma`)

8 models added:
```
✓ AiSubscription      - User subscription tracking
✓ ApiKey             - API key storage with device lock
✓ Payment            - Razorpay payment records
✓ UsageLog           - API call logging
✓ DeviceResetLog     - Authorization audit
✓ EmailReminderLog   - Reminder tracking
✓ ProjectMemory      - Future: Project context
✓ MemoryEvent        - Future: Memory events
```

### Documentation

- `AI_CODE_ASSISTANT_DOCUMENTATION.md` - Complete implementation guide
- `AI_CODE_ASSISTANT_IMPLEMENTATION_SUMMARY.md` - Detailed spec compliance

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd i:\Raghava\Copilot-works\simplifyconvertapp
npm install bcrypt @types/bcrypt
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Add these key variables:
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:7b
```

### 3. Start Ollama Locally
```bash
ollama pull qwen2.5-coder:7b
ollama run qwen2.5-coder:7b
```

### 4. Initialize Database
```bash
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```

### 6. Test Endpoints

**Create Payment Order**
```bash
curl -X POST http://localhost:3000/api/payments/create-order \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json"
```

**Generate Code**
```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Authorization: Bearer sca_YOUR_API_KEY" \
  -H "X-Machine-Id: device-uuid" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Generate a React button component",
    "machineId": "device-uuid",
    "taskType": "generate"
  }'
```

---

## 📊 Credit System Quick Reference (Production Hardened)

| Prompt Size | Credits | Examples | Status |
|---|---|---|---|
| 0 - 8,000 chars | 1 credit | Small snippets, bug fixes | ✅ Accepted |
| 8,001 - 20,000 chars | 2 credits | Medium functions, components | ✅ Accepted |
| 20,001 - 40,000 chars | 4 credits | Full systems, large refactors | ✅ Accepted |
| 40,001+ chars | — | Ultra-large requests | ❌ Rejected |

**Monthly Allocation**: 100 credits per subscription

**Notes**: 
- Prompts > 40,000 chars are automatically rejected with HTTP 413
- Credits only deducted for successful requests (not rejected ones)

---

## 🔒 Security Checklist (Updated)

- ✅ API keys hashed with SHA-256 (fast, cryptographic)
- ✅ API key format: `sca_live_` + 48 hex characters (57 total)
- ✅ Device lock on first request (configurable per key)
- ✅ Rate limiting: 30 req/min per key
- ✅ Secret detection: 12+ pattern types (API keys, tokens, credentials)
- ✅ Concurrency control: Max 2 concurrent Ollama requests
- ✅ Request timeouts: 30s for generation, 5s for health checks
- ✅ Razorpay webhook signature verification
- ✅ NextAuth.js session management
- ✅ Device reset audit logging
- ✅ Monthly reset limiting (3 resets/month)
- ✅ Privacy-first logging (no prompt/response text stored)

---

## 🛠️ API Error Codes (Production Hardened)

| Code | HTTP | Meaning | Action |
|---|---|---|---|
| MISSING_API_KEY | 401 | No Authorization header | Include `Authorization: Bearer <key>` |
| INVALID_API_KEY | 401 | Key doesn't exist or is invalid | Regenerate key in dashboard |
| DEVICE_NOT_AUTHORIZED | 403 | Device not linked to key | Reset device lock in dashboard |
| SECRET_DETECTED | 403 | Sensitive data detected | Remove API keys/credentials from prompt |
| INSUFFICIENT_CREDITS | 402 | Not enough credits for request | Upgrade plan or wait for monthly reset |
| RATE_LIMITED | 429 | Exceeded 30 req/min limit | Wait 1 minute before retrying |
| PROMPT_TOO_LARGE | 413 | Prompt > 40,000 characters | Split prompt into smaller requests |
| SERVER_BUSY | 503 | Ollama at capacity | Retry in a few seconds |
| OLLAMA_ERROR | 503 | AI generation failed | Check Ollama is running, retry |
| INTERNAL_ERROR | 500 | Unexpected server error | Contact support with error details |

---

## 📱 User Flow

### First-Time User
1. Visit `/ai-code-assistant`
2. Click "Get Started" → Sign in with Google
3. Go to `/ai-code-assistant/pricing`
4. Select plan → Razorpay checkout
5. Payment success → Auto-redirect to `/dashboard/ai-code-assistant`
6. Copy API key (shown once)
7. Use API key in POST /api/ai/generate

### Existing User
1. Visit `/dashboard/ai-code-assistant`
2. See subscription status, credits remaining
3. View API keys (masked for security)
4. Regenerate key if needed
5. Reset device lock if using new computer

---

## 🔧 Troubleshooting

**Ollama not responding**
```bash
# Check if running
ollama list

# Verify base URL in .env
OLLAMA_BASE_URL=http://localhost:11434

# Restart if needed
# Kill and restart ollama service
```

**Payment webhook failing**
```bash
# Check Razorpay webhook URL
# Verify webhook secret matches RAZORPAY_WEBHOOK_SECRET
# Check logs for signature verification errors
```

**API key not working**
```bash
# Verify subscription is active (not expired)
# Check device lock matches machineId in request
# Ensure key hasn't been deactivated
```

---

## 🏥 Health Check (NEW - Production Hardening)

**Monitor infrastructure health before making requests**

```bash
curl http://localhost:3000/api/health
```

**Response** (HTTP 200 or 503):
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "database": {
    "healthy": true,
    "responseTimeMs": 12
  },
  "ollama": {
    "healthy": true,
    "responseTimeMs": 45
  },
  "razorpay": {
    "healthy": true,
    "configured": true
  },
  "readyForRequests": true
}
```

---

## 🔐 Security Features (NEW - Production Hardening)

- ✅ **Secret Detection**: Automatic blocking of API keys, credentials, and tokens in prompts
- ✅ **SHA-256 Hashing**: Fast, cryptographic API key verification (vs bcrypt)
- ✅ **Concurrency Control**: Max 2 concurrent Ollama requests to prevent overload
- ✅ **Request Timeouts**: 30-second timeout for generation, 5-second for health checks
- ✅ **Privacy-First Logging**: UsageLog stores only metadata (characters, credits, error codes)
- ✅ **Device Lock**: Per-API-key device authorization with configurable limit (default 1 device)
- ✅ **Rate Limiting**: 30 requests/minute with burst window protection

---

## 📚 Additional Resources

- **Full Documentation**: `AI_CODE_ASSISTANT_DOCUMENTATION.md`
- **Implementation Details**: `AI_CODE_ASSISTANT_IMPLEMENTATION_SUMMARY.md`
- **API Docs Page**: `/ai-code-assistant/docs`
- **Razorpay Docs**: https://razorpay.com/docs/api
- **Ollama Docs**: https://github.com/ollama/ollama/blob/main/docs/api.md
- **NextAuth.js**: https://next-auth.js.org

---

## ✨ Build & Deployment

**Build Status**: ✅ PASSING
```bash
npm run build
# Output: "Build completed successfully"
```

**Deployment Ready**: Yes
- ✅ All TypeScript types valid
- ✅ No build errors
- ✅ No ESLint warnings
- ✅ Database schema ready
- ⏳ Pending: Production config

---

## 🎯 Next Steps

1. **Set up production credentials**
   - Get Razorpay live keys
   - Configure webhook endpoint
   - Set up PostgreSQL database

2. **Deploy to production**
   - Vercel: `npm run build && npm run start`
   - Docker: Create Dockerfile
   - Traditional: Configure Node.js server

3. **Monitor & optimize**
   - Set up error logging
   - Monitor API usage
   - Track payment success rate

4. **Plan Phase 2**
   - Memory system enhancement
   - Email reminder integration
   - VS Code extension

---

**Last Updated**: Current session
**Status**: Production-Ready
**Version**: 1.0.0 MVP
