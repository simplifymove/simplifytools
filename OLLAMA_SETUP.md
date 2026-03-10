# Groq API Setup Guide

Your AI Write system is now configured to use **Groq** - free, fast, cloud-ready AI API.

## ⚡ 2-Minute Setup

### 1. Get Free API Key
**Go to: https://console.groq.com**

- Click "Sign up" (instant, no credit card needed)
- Verify email 
- Click "API Keys" in left menu
- Click "Create New Secret Key"
- Copy the key

### 2. Add to Your Project
Edit `.env.local` in your project folder:
```
GROQ_API_KEY=your_api_key_here_paste_it
```

### 3. Restart App
```bash
npm run dev
```

### 4. Test It!
- Go to http://localhost:3000
- Click "AI Write"
- Try any tool - it will now generate REAL content!

## ✅ Why Groq?

- **FREE**: 30 requests/min free tier (enough for development)
- **FAST**: 2-5 second responses (faster than OpenAI)
- **CLOUD-READY**: Works ✅ locally AND ✅ in cloud deployment
- **NO INSTALLATION**: Just get a key, done
- **NO CREDIT CARD**: Completely free account

## 📊 Free Tier Limits

- 30 requests per minute
- Up to 14,000 tokens per request
- No expiration
- Upgrade anytime if needed

## 🚀 Usage

The system will automatically use Groq once you add the API key. No code changes needed!

### Example
1. Go to AI Write → Paragraph Writer
2. Enter topic: "Why cats are awesome"
3. Click "Generate"
4. Get real AI-generated content in seconds!

## ☁️ Cloud Deployment

When you deploy to Vercel/cloud:
1. Add environment variable in your hosting provider
2. Set: `GROQ_API_KEY=your_key_here`
3. Deploy
4. **Works without any code changes** ✅

## 🔧 Troubleshooting

### "GROQ_API_KEY not configured"
- Make sure `.env.local` file exists
- Check you pasted the key correctly
- Restart the development server: `npm run dev`

### Still showing mock responses?
- Refresh the browser (Ctrl+F5)
- Check `.env.local` has actual key (not empty)
- Check for typos in the key

### Rate limit error?
- You've exceeded 30 requests/minute
- Wait a minute, then try again
- For production apps, upgrade Groq plan

## 📝 Current Status

- ✅ API Type: Groq (cloud-based)
- ✅ Model: Mixtral 8x7B (fast, high-quality)
- ✅ Cost: **FREE**
- ✅ Setup Time: ~2 minutes
- ✅ Works Everywhere: Local + Cloud ✅

## Next Steps

1. ✅ Go to https://console.groq.com
2. ✅ Sign up (instant)
3. ✅ Copy API key
4. ✅ Paste in `.env.local`
5. ✅ Run `npm run dev`
6. ✅ Test at http://localhost:3000/tools/ai-write

**Ready? Go get your free key at: https://console.groq.com** 🚀

