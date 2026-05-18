# Local Testing Guide - SimplifyConvert AI Code Assistant

This guide helps you test the VS Code extension locally during development.

## 📋 Prerequisites

- Node.js 18+ and npm
- VS Code 1.90.0 or higher
- Git (optional)
- SimplifyConvert backend running locally (optional, for full testing)

## 🔧 Setup

### 1. Install Dependencies

```bash
cd extensions/vscode-simplifyconvert-ai
npm install
```

### 2. Compile TypeScript

```bash
npm run compile
```

Or watch for changes during development:

```bash
npm run watch
```

## 🚀 Running the Extension

### Option A: Using VS Code (Recommended)

1. Open the extension folder in VS Code:
   ```bash
   code extensions/vscode-simplifyconvert-ai
   ```

2. Press **F5** to launch the Extension Development Host

3. A new VS Code window will open with the extension enabled

4. You can set breakpoints in the code and debug

### Option B: Package VSIX and Install

```bash
npm run package
```

This creates `simplifyconvert-ai-code-assistant-0.0.1.vsix`

Then in VS Code:
- Open Command Palette (Ctrl+Shift+P)
- Run: `Extensions: Install from VSIX`
- Select the `.vsix` file

## 🔑 Configure API Key

### For Production Testing

1. Get API key from: https://simplifyconvert.com/dashboard/api-keys
2. In extension: Run `SimplifyConvert AI: Set API Key`
3. Paste your API key

### For Local Development

If running backend locally on `http://localhost:3000`:

1. Configure in VS Code Settings:
   ```json
   {
     "simplifyconvertAI.apiBaseUrl": "http://localhost:3000"
   }
   ```

2. Set a test API key:
   ```
   sca_live_0000000000000000000000000000000000000000000000
   ```
   (Dummy key format for testing)

## 🧪 Testing Scenarios

### Test 1: Chat Panel

1. Click SimplifyConvert icon in Activity Bar
2. Type: "Hello, what can you do?"
3. Press Ctrl+Enter to send
4. Should show response or error

### Test 2: Explain Selection

1. Open any code file
2. Select some code
3. Right-click → SimplifyConvert AI: Explain Selection
4. Chat panel opens with explanation

### Test 3: Fix Selection

1. Select buggy code
2. Right-click → SimplifyConvert AI: Fix Selection
3. Should show fix suggestions

### Test 4: Debug Error

1. Run: `SimplifyConvert AI: Debug Error`
2. Paste an error message
3. Should show debugging suggestions

### Test 5: Settings

1. Open Settings (File > Preferences > Settings)
2. Search: "simplifyconvertAI"
3. Try changing `apiBaseUrl` or `defaultModelLabel`
4. Changes should take effect immediately

### Test 6: Blocked Files

1. Create or open a `.env` file
2. Select some text
3. Right-click → Try to explain
4. Should show: "For security, SimplifyConvert AI does not send .env files."

### Test 7: Large Selection Warning

1. Select code > 10,000 characters
2. Right-click → Explain Selection
3. Should show warning dialog
4. Click "Yes" to continue or "No" to cancel

### Test 8: API Key Management

1. Run: `SimplifyConvert AI: Set API Key`
2. Enter dummy key: `sca_live_0000000000000000000000000000000000000000000000`
3. Should show: "API key saved securely!"
4. Run: `SimplifyConvert AI: Clear API Key`
5. Should ask for confirmation then clear

### Test 9: Invalid API Key Format

1. Run: `SimplifyConvert AI: Set API Key`
2. Enter invalid key: `my_old_api_key_123`
3. Should show: "Invalid API key format. API key should start with 'sca_live_'"

## 🔗 Testing with Local Backend

### Start Backend Server

```bash
cd i:\Raghava\Copilot-works\simplifyconvertapp
npm run dev
# Server runs on http://localhost:3000
```

### Configure Extension

In VS Code Settings:
```json
{
  "simplifyconvertAI.apiBaseUrl": "http://localhost:3000"
}
```

### Test Requests

You can test the backend directly with curl:

```bash
# Get health
curl http://localhost:3000/api/health

# Test API (with valid API key)
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Authorization: Bearer sca_live_0000000000000000000000000000000000000000000000" \
  -H "X-Machine-Id: test-machine-id" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello", "machineId": "test-machine-id", "taskType": "chat"}'
```

## 🐛 Debugging

### Enable Extension Logging

1. Open Developer Tools in Extension Host:
   - Press: Ctrl+Shift+D (Debug view)
   - Or: Run → View: Developer Tools
2. Check console for logs
3. Look for: "SimplifyConvert AI" messages

### Breakpoints

1. In the extended VS Code window (Extension Host):
   - Open any `.ts` file in `src/`
   - Click line number to set breakpoint
   - Trigger the action
   - Debugger will pause at breakpoint

### Local Storage / SecretStorage

VS Code extension storage is in:
- Windows: `%APPDATA%\Code\User\workspaceStorage`
- Mac: `~/Library/Application Support/Code/User/workspaceStorage`
- Linux: `~/.config/Code/User/workspaceStorage`

For testing: Clear storage to reset API key
- Close VS Code Extension Host window
- Delete the workspace storage folder
- Reopen with F5

## 📦 Packaging for Distribution

### Create VSIX Package

```bash
npm run package
```

Creates: `simplifyconvert-ai-code-assistant-0.0.1.vsix`

### Install Locally

```bash
code --install-extension simplifyconvert-ai-code-assistant-0.0.1.vsix
```

### Share with Others

Upload `.vsix` to:
- VS Code Marketplace
- GitHub Releases
- Direct download link

## ✅ Pre-Release Checklist

Before releasing, verify:

- [ ] `npm run compile` succeeds with no errors
- [ ] `npm run watch` works without warnings
- [ ] Extension activates correctly (F5)
- [ ] All 8 commands appear in Command Palette
- [ ] Right-click menu shows 5 options
- [ ] Chat panel renders correctly
- [ ] API key can be set/cleared
- [ ] Settings changes apply immediately
- [ ] .env files are blocked
- [ ] Machine ID persists across sessions
- [ ] Error messages are user-friendly
- [ ] Credits display correctly
- [ ] No console errors/warnings

## 🔄 Development Workflow

1. **Make changes** to source files in `src/`

2. **Compile** (if not using watch):
   ```bash
   npm run compile
   ```

3. **Reload extension** in VS Code:
   - In Extension Host window: Press Ctrl+R (or Cmd+R on Mac)
   - Or close and press F5 again

4. **Test changes**

5. **Check logs** in Developer Tools (Ctrl+Shift+D)

6. **Debug** with breakpoints as needed

## 📝 Common Issues

### "Cannot find module 'vscode'"
- Run: `npm install` in extension folder
- Ensure `@types/vscode` is in `package.json`

### Extension not loading
- Check for TypeScript compilation errors: `npm run compile`
- Check Developer Tools console for error messages
- Ensure `src/extension.ts` exports `activate` function

### Chat panel not showing
- Verify `ChatWebviewProvider` is registered in `activate()`
- Check that `contributes.views` is in `package.json`
- Look for errors in console

### API calls failing
- Verify `apiBaseUrl` setting is correct
- Check backend is running (health endpoint)
- Look for network errors in console
- Verify API key format: `sca_live_*`

### Settings not applying
- Reload extension: Ctrl+R in Extension Host
- Check setting names match exactly
- Ensure `contributes.configuration` in `package.json`

## 🆘 Getting Help

- Check the main [README.md](./README.md) for features and usage
- Look at `src/extension.ts` for command registration
- Check `src/api/client.ts` for API request structure
- Review `src/webview/chatPanel.ts` for UI logic

---

**Status**: Development Ready  
**Last Updated**: January 2024
