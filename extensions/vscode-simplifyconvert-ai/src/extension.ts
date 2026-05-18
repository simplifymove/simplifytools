import * as vscode from 'vscode';
import { ApiClient } from './api/client';
import { ChatPanel } from './webview/chatPanel';
import {
  getOrCreateMachineId,
  formatErrorMessage,
  isBlockedFileName,
  maskApiKey,
  isValidApiKeyFormat,
} from './utils/helpers';

let chatPanel: ChatPanel | null = null;
let apiClient: ApiClient | null = null;
let chatWebviewProvider: ChatWebviewProvider | null = null;

/**
 * WebviewViewProvider for chat sidebar
 */
class ChatWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'simplifyconvertAI.chatView';

  constructor(private context: vscode.ExtensionContext) {}

  async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    const mediaPath = vscode.Uri.joinPath(this.context.extensionUri, 'media');
    
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [mediaPath],
    };

    // Create chat panel if not exists
    if (!chatPanel) {
      chatPanel = new ChatPanel(apiClient);
    }

    // Pass extensionUri to ChatPanel
    chatPanel.setWebview(webviewView.webview, this.context.extensionUri);

    // ChatPanel will handle setting webviewView.webview.html
    webviewView.webview.html = chatPanel.getWebviewContent();
  }

  private getWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SimplifyConvert AI Chat</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            display: flex;
            flex-direction: column;
            height: 100vh;
            padding: 10px;
        }

        #chatContainer {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 10px;
            padding: 10px 0;
        }

        .message {
            margin-bottom: 12px;
            padding: 10px;
            border-radius: 4px;
            line-height: 1.5;
            word-wrap: break-word;
        }

        .message.user {
            background: var(--vscode-inputOption-activeBackground);
            margin-left: 20px;
            border-left: 3px solid var(--vscode-inputOption-activeBorder);
        }

        .message.assistant {
            background: var(--vscode-editor-lineHighlightBackground);
            margin-right: 20px;
            border-left: 3px solid var(--vscode-focusBorder);
        }

        .message code {
            background: var(--vscode-editor-background);
            padding: 2px 4px;
            border-radius: 2px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 12px;
        }

        .message pre {
            background: var(--vscode-editor-background);
            padding: 8px;
            border-radius: 4px;
            overflow-x: auto;
            margin: 8px 0;
        }

        .message pre code {
            background: none;
            padding: 0;
        }

        .loading {
            text-align: center;
            color: var(--vscode-descriptionForeground);
            padding: 10px;
            font-style: italic;
        }

        #inputContainer {
            display: flex;
            gap: 8px;
        }

        #prompt {
            flex: 1;
            padding: 8px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-family: var(--vscode-font-family);
            resize: vertical;
            min-height: 60px;
            max-height: 120px;
        }

        #sendBtn, #clearBtn {
            padding: 8px 12px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            white-space: nowrap;
            font-size: 12px;
        }

        #sendBtn:hover {
            background: var(--vscode-button-hoverBackground);
        }

        #sendBtn:disabled {
            background: var(--vscode-disabledForeground);
            cursor: not-allowed;
            opacity: 0.5;
        }

        #clearBtn {
            background: transparent;
            border: 1px solid var(--vscode-button-border);
            color: var(--vscode-button-foreground);
        }

        .buttonGroup {
            display: flex;
            gap: 4px;
            flex-direction: column;
        }

        .creditInfo {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            padding: 6px;
            background: var(--vscode-editor-lineHighlightBackground);
            border-radius: 3px;
            border-left: 2px solid var(--vscode-focusBorder);
            margin-bottom: 10px;
        }

        .error {
            color: #f48771;
        }
    </style>
</head>
<body>
    <div id="chatContainer"></div>
    <div id="creditInfo" class="creditInfo" style="display:none;"></div>
    <div id="inputContainer">
        <textarea id="prompt" placeholder="Ask SimplifyConvert AI... (Ctrl+Enter to send)"></textarea>
        <div class="buttonGroup">
            <button id="sendBtn" title="Send (Ctrl+Enter)">Send</button>
            <button id="clearBtn" title="Clear chat">Clear</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const chatContainer = document.getElementById('chatContainer');
        const promptInput = document.getElementById('prompt');
        const sendBtn = document.getElementById('sendBtn');
        const clearBtn = document.getElementById('clearBtn');
        const creditInfo = document.getElementById('creditInfo');

        sendBtn.addEventListener('click', () => {
            const text = promptInput.value.trim();
            if (text && !sendBtn.disabled) {
                vscode.postMessage({
                    command: 'sendMessage',
                    text: text
                });
                promptInput.value = '';
                promptInput.focus();
            }
        });

        clearBtn.addEventListener('click', () => {
            if (confirm('Clear chat history?')) {
                vscode.postMessage({
                    command: 'clearChat'
                });
            }
        });

        promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                sendBtn.click();
            }
        });

        window.addEventListener('message', (event) => {
            const message = event.data;

            if (message.command === 'updateChat') {
                chatContainer.innerHTML = '';

                if (message.messages.length === 0) {
                    chatContainer.innerHTML = '<div style="text-align: center; color: var(--vscode-descriptionForeground); margin-top: 20px;">No messages yet. Start a conversation!</div>';
                } else {
                    message.messages.forEach((msg) => {
                        const div = document.createElement('div');
                        div.className = \`message \${msg.type}\`;
                        
                        // Simple markdown rendering
                        let html = msg.content
                            .replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;');
                        
                        // Code blocks
                        html = html.replace(/\`\`\`([^\\n]*)\n([\s\S]*?)\`\`\`/g, '<pre><code class="language-$1">$2</code></pre>');
                        // Inline code
                        html = html.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
                        // Line breaks
                        html = html.replace(/\\n/g, '<br>');
                        
                        div.innerHTML = html;
                        chatContainer.appendChild(div);
                    });
                }

                if (message.isLoading) {
                    const div = document.createElement('div');
                    div.className = 'loading';
                    div.textContent = '⏳ Generating response...';
                    chatContainer.appendChild(div);
                }

                if (message.lastResponse && message.lastResponse.creditsRemaining !== undefined) {
                    creditInfo.style.display = 'block';
                    creditInfo.innerHTML = \`📊 Credits: <strong>\${message.lastResponse.creditsRemaining}</strong> remaining | Model: \${message.lastResponse.model || 'Qwen 2.5 Coder'}\`;
                }

                chatContainer.scrollTop = chatContainer.scrollHeight;
            }

            if (message.command === 'setLoading') {
                sendBtn.disabled = message.isLoading;
            }
        });

        // Initial focus
        setTimeout(() => promptInput.focus(), 100);
    </script>
</body>
</html>`;
  }
}

/**
 * Main extension activation
 */
export async function activate(context: vscode.ExtensionContext) {
  console.log('SimplifyConvert AI Code Assistant activating...');

  // Get or create machine ID
  const machineId = await getOrCreateMachineId(context.globalState);
  console.log('Machine ID:', maskApiKey(machineId));

  // Register commands
  registerCommands(context, machineId);

  // Register webview provider for sidebar
  chatWebviewProvider = new ChatWebviewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ChatWebviewProvider.viewType,
      chatWebviewProvider
    )
  );

  console.log('SimplifyConvert AI Code Assistant activated successfully!');
}

/**
 * Register all extension commands
 */
function registerCommands(context: vscode.ExtensionContext, machineId: string) {
  // Set API Key
  context.subscriptions.push(
    vscode.commands.registerCommand('simplifyconvertAI.setApiKey', async () => {
      const apiKey = await vscode.window.showInputBox({
        prompt: 'Enter your SimplifyConvert API key',
        password: true,
        ignoreFocusOut: true,
      });

      if (!apiKey) {
        return;
      }

      if (!isValidApiKeyFormat(apiKey)) {
        vscode.window.showErrorMessage(
          'Invalid API key format. API key should start with "sca_live_"'
        );
        return;
      }

      // Store securely in SecretStorage
      await context.secrets.store('simplifyconvertAI.apiKey', apiKey);
      vscode.window.showInformationMessage('API key saved securely!');

      // Reinitialize API client
      initializeApiClient(context, machineId);
    })
  );

  // Clear API Key
  context.subscriptions.push(
    vscode.commands.registerCommand('simplifyconvertAI.clearApiKey', async () => {
      const confirm = await vscode.window.showWarningMessage(
        'Are you sure you want to clear your API key?',
        'Yes',
        'No'
      );

      if (confirm === 'Yes') {
        await context.secrets.delete('simplifyconvertAI.apiKey');
        vscode.window.showInformationMessage('API key cleared.');
        apiClient = null;
      }
    })
  );

  // Open Chat
  context.subscriptions.push(
    vscode.commands.registerCommand('simplifyconvertAI.openChat', async () => {
      if (!apiClient) {
        const response = await vscode.window.showWarningMessage(
          'API key not configured. Set it now?',
          'Yes',
          'No'
        );
        if (response === 'Yes') {
          vscode.commands.executeCommand('simplifyconvertAI.setApiKey');
        }
        return;
      }

      await vscode.commands.executeCommand('simplifyconvertAI.chatView.focus');
    })
  );

  // Explain Selection
  context.subscriptions.push(
    vscode.commands.registerCommand('simplifyconvertAI.explainSelection', async () => {
      await executeSelectionCommand(context, machineId, 'explain', 'Explain this code');
    })
  );

  // Fix Selection
  context.subscriptions.push(
    vscode.commands.registerCommand('simplifyconvertAI.fixSelection', async () => {
      await executeSelectionCommand(context, machineId, 'fix', 'Fix issues in this code');
    })
  );

  // Optimize Selection
  context.subscriptions.push(
    vscode.commands.registerCommand('simplifyconvertAI.optimizeSelection', async () => {
      await executeSelectionCommand(
        context,
        machineId,
        'optimize',
        'Optimize this code for performance'
      );
    })
  );

  // Generate Comments
  context.subscriptions.push(
    vscode.commands.registerCommand('simplifyconvertAI.generateComments', async () => {
      await executeSelectionCommand(
        context,
        machineId,
        'comments',
        'Generate clear comments for this code'
      );
    })
  );

  // Debug Error
  context.subscriptions.push(
    vscode.commands.registerCommand('simplifyconvertAI.debugError', async () => {
      if (!apiClient) {
        vscode.window.showErrorMessage('API key not configured. Set it first.');
        return;
      }

      const error = await vscode.window.showInputBox({
        prompt: 'Paste your error message or build error',
        placeHolder: 'Error message...',
        ignoreFocusOut: true,
      });

      if (!error) {
        return;
      }

      if (!chatPanel) {
        vscode.window.showErrorMessage('Chat panel not available.');
        return;
      }

      chatPanel.addMessageFromCommand(
        'Help me debug this error:',
        'debug',
        error
      );

      await vscode.commands.executeCommand('simplifyconvertAI.chatView.focus');
    })
  );
}

/**
 * Execute selection-based commands
 */
async function executeSelectionCommand(
  context: vscode.ExtensionContext,
  machineId: string,
  taskType: 'explain' | 'fix' | 'optimize' | 'comments' | 'debug',
  prompt: string
) {
  if (!apiClient) {
    const response = await vscode.window.showWarningMessage(
      'API key not configured. Set it now?',
      'Yes',
      'No'
    );
    if (response === 'Yes') {
      vscode.commands.executeCommand('simplifyconvertAI.setApiKey');
    }
    return;
  }

  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showErrorMessage('No active editor');
    return;
  }

  const fileName = editor.document.fileName;

  // Check if file is .env (blocked for security)
  if (isBlockedFileName(fileName)) {
    vscode.window.showErrorMessage(
      'For security, SimplifyConvert AI does not send .env files.'
    );
    return;
  }

  const selection = editor.selection;
  const selectedCode = editor.document.getText(selection);

  if (!selectedCode) {
    vscode.window.showWarningMessage('Please select some code first.');
    return;
  }

  // Warn if selection is large
  if (selectedCode.length > 10000) {
    const response = await vscode.window.showWarningMessage(
      `Selected code is large (${selectedCode.length} chars). This may use more credits. Continue?`,
      'Yes',
      'No'
    );
    if (response !== 'Yes') {
      return;
    }
  }

  if (!chatPanel) {
    vscode.window.showErrorMessage('Chat panel not available.');
    return;
  }

  chatPanel.addMessageFromCommand(prompt, taskType, selectedCode);

  await vscode.commands.executeCommand('simplifyconvertAI.chatView.focus');
}

/**
 * Initialize API client
 */
async function initializeApiClient(context: vscode.ExtensionContext, machineId: string) {
  try {
    const apiKey = await context.secrets.get('simplifyconvertAI.apiKey');

    if (!apiKey) {
      console.log('No API key configured');
      return;
    }

    const config = vscode.workspace.getConfiguration('simplifyconvertAI');
    const baseUrl = config.get<string>('apiBaseUrl') || 'https://simplifyconvert.com';

    apiClient = new ApiClient(baseUrl, apiKey, machineId);
    console.log('API client initialized');
  } catch (error) {
    console.error('Failed to initialize API client:', error);
  }
}

export function deactivate() {
  console.log('SimplifyConvert AI Code Assistant deactivated');
}
