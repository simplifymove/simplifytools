# SimplifyConvert AI Code Assistant

A powerful VS Code extension that brings AI-powered code assistance directly into your editor. Explain, fix, optimize, and debug code with ease.

## ✨ Features

- **Chat Panel**: Sidebar chat interface for conversational AI assistance
- **Explain Code**: Understand what selected code does
- **Fix Issues**: Get suggestions to fix bugs in your code
- **Optimize**: Improve performance and readability
- **Generate Comments**: Auto-generate clear documentation
- **Debug Errors**: Paste terminal/build errors and get fix suggestions
- **Credits System**: Track API usage with credit balance display
- **Secure Storage**: API keys stored securely using VS Code SecretStorage
- **Multiple Languages**: Support for all major programming languages
- **Error Handling**: Friendly error messages for common issues

## 🚀 Quick Start

### 1. Install the Extension

- Download the `.vsix` file from releases
- Open VS Code
- Run: `Extensions: Install from VSIX` (Ctrl+Shift+X)
- Select the `.vsix` file

### 2. Get Your API Key

1. Visit [SimplifyConvert AI Code Assistant](https://simplifyconvert.com/ai-code-assistant)
2. Sign up or log in to your account
3. Go to your dashboard
4. Copy your API key

### 3. Configure API Key

1. Open VS Code Command Palette (Ctrl+Shift+P)
2. Run: `SimplifyConvert AI: Set API Key`
3. Paste your API key
4. API key is stored securely in VS Code SecretStorage

### 4. Start Using

- Click the SimplifyConvert icon in the Activity Bar (left sidebar)
- Type your question in the chat panel
- Or select code and right-click to use quick actions

## 📋 Commands

All commands available in VS Code Command Palette (Ctrl+Shift+P):

| Command | Description |
|---------|-------------|
| `SimplifyConvert AI: Open Chat` | Open the chat sidebar |
| `SimplifyConvert AI: Set API Key` | Configure your API key |
| `SimplifyConvert AI: Clear API Key` | Remove stored API key |
| `SimplifyConvert AI: Explain Selection` | Explain selected code |
| `SimplifyConvert AI: Fix Selection` | Get fix suggestions |
| `SimplifyConvert AI: Optimize Selection` | Improve code |
| `SimplifyConvert AI: Generate Comments` | Add documentation |
| `SimplifyConvert AI: Debug Error` | Debug error messages |

## 🖱️ Right-Click Context Menu

Select code and right-click to access:
- Explain Selection
- Fix Selection
- Optimize Selection
- Generate Comments
- Debug Error

## ⚙️ Settings

Configure in VS Code Settings (File > Preferences > Settings):

```json
{
  "simplifyconvertAI.apiBaseUrl": "https://simplifyconvert.com",
  "simplifyconvertAI.defaultModelLabel": "Qwen 2.5 Coder"
}
```

### apiBaseUrl
- **Default**: `https://simplifyconvert.com`
- **Local Dev**: `http://localhost:3000`
- Base URL for the SimplifyConvert API

### defaultModelLabel
- **Default**: `Qwen 2.5 Coder`
- Model name displayed in chat

## 🔐 Privacy & Security

- ✅ API key stored securely in VS Code SecretStorage
- ✅ Never auto-scans your entire project
- ✅ Only sends code you explicitly select or enter
- ✅ Blocks sending `.env` files for security
- ✅ Machine ID generated locally and stored for device binding
- ✅ No telemetry or tracking

## ❌ Blocked Files

For security reasons, the extension **will not send**:
- `.env` files
- `.env.local`
- `.env.production`
- `.env.development`

## 💳 Credits System

Each API call consumes credits based on prompt size:

| Prompt Size | Credits |
|------------|---------|
| 0 - 8,000 chars | 1 credit |
| 8,001 - 20,000 chars | 2 credits |
| 20,001 - 40,000 chars | 4 credits |
| 40,001+ chars | Rejected |

Credit balance displayed after each response.

## ⚠️ Error Messages

Common errors and solutions:

| Error | Solution |
|-------|----------|
| INVALID_API_KEY | Check your API key in settings |
| SUBSCRIPTION_EXPIRED | Renew your subscription at pricing page |
| CREDITS_EXHAUSTED | Upgrade your plan for more credits |
| DEVICE_MISMATCH | Reset device lock in your dashboard |
| PROMPT_TOO_LARGE | Split your request into smaller parts |
| SECRET_DETECTED | Remove API keys/credentials from prompt |
| SERVER_BUSY | Retry in a few seconds |
| RATE_LIMITED | Wait 1 minute before retrying |

## 🆘 Troubleshooting

### "API key not configured"
- Run: `SimplifyConvert AI: Set API Key`
- Ensure your API key starts with `sca_live_`

### "No response from server"
- Check your internet connection
- Verify `apiBaseUrl` setting is correct
- For local dev: ensure backend is running on `http://localhost:3000`

### "Chat panel not showing"
- Click the SimplifyConvert icon in the Activity Bar
- Or run: `SimplifyConvert AI: Open Chat`

### "Selected code not sending"
- Make sure code is actually selected
- Check if file is not blocked (`.env` files blocked)
- Verify file size is under 40,000 characters

## 🐛 Report Issues

Found a bug? Have a feature request?

- GitHub Issues: [SimplifyConvert/issues](https://github.com/SimplifyConvert/issues)
- Email: support@simplifyconvert.com

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with TypeScript and VS Code Extension API
- Uses SimplifyConvert AI backend
- Icons from VS Code theme

---

**Version**: 0.0.1  
**Status**: MVP - Early Release  
**Last Updated**: January 2024
