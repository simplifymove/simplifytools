import * as vscode from 'vscode';
import { ApiClient, GenerateResponse } from '../api/client';
import { formatErrorMessage } from '../utils/helpers';

interface ChatMessage {
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * Webview Chat Panel for SimplifyConvert AI
 */
export class ChatPanel {
  public static readonly viewType = 'simplifyconvertAI.chatView';
  private webview: vscode.Webview | null = null;
  private chatMessages: ChatMessage[] = [];
  private isLoading = false;
  private extensionUri: vscode.Uri | null = null;

  constructor(
    private apiClient: ApiClient | null,
    private onAddMessage?: (message: ChatMessage) => void
  ) {
    if (this.apiClient) {
      console.log('ApiClient initialized');
    }
  }

  setWebview(webview: vscode.Webview, extensionUri: vscode.Uri): void {
    this.webview = webview;
    this.extensionUri = extensionUri;
    this.setupWebviewMessageListener();
    this.renderChat();
  }

  private setupWebviewMessageListener(): void {
    if (!this.webview) return;

    this.webview.onDidReceiveMessage(async (message) => {
      if (message.command === 'sendMessage') {
        await this.handleUserMessage(message.text);
      } else if (message.command === 'clearChat') {
        this.chatMessages = [];
        this.renderChat();
      }
    });
  }

  private async handleUserMessage(userMessage: string): Promise<void> {
    if (!userMessage.trim()) return;

    // Add user message to history
    const userMsg: ChatMessage = {
      type: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };
    this.chatMessages.push(userMsg);
    this.onAddMessage?.(userMsg);
    this.renderChat();

    // Check if API client is initialized
    if (!this.apiClient) {
      console.log('API key missing');
      const errorMsg: ChatMessage = {
        type: 'assistant',
        content: '❌ Please set your API key first using SimplifyConvert AI: Set API Key.',
        timestamp: Date.now(),
      };
      this.chatMessages.push(errorMsg);
      this.onAddMessage?.(errorMsg);
      this.renderChat();
      return;
    }

    // Set loading state
    this.isLoading = true;
    this.renderLoadingState();

    try {
      console.log('Calling generate endpoint');
      // Call API
      const response = await this.apiClient.generate({
        prompt: userMessage,
        taskType: 'chat',
      });

      this.isLoading = false;

      // Add assistant response
      if (response.success && response.response) {
        const assistantMsg: ChatMessage = {
          type: 'assistant',
          content: response.response,
          timestamp: Date.now(),
        };
        this.chatMessages.push(assistantMsg);
        this.onAddMessage?.(assistantMsg);
      } else {
        const errorMsg: ChatMessage = {
          type: 'assistant',
          content: `❌ Error: ${formatErrorMessage(response.errorCode || '', response.error || '')}`,
          timestamp: Date.now(),
        };
        this.chatMessages.push(errorMsg);
        this.onAddMessage?.(errorMsg);
      }

      this.renderChat(response);
    } catch (error) {
      this.isLoading = false;
      console.error('Error calling generate endpoint:', error);
      const errorMsg: ChatMessage = {
        type: 'assistant',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: Date.now(),
      };
      this.chatMessages.push(errorMsg);
      this.onAddMessage?.(errorMsg);
      this.renderChat();
    }
  }

  private renderLoadingState(): void {
    if (!this.webview) return;

    this.webview.postMessage({
      command: 'setLoading',
      isLoading: true,
    });
  }

  private renderChat(lastResponse?: GenerateResponse): void {
    if (!this.webview) return;

    const html = this.getWebviewContent();
    this.webview.html = html;

    // Send data to webview
    this.webview.postMessage({
      command: 'updateChat',
      messages: this.chatMessages,
      isLoading: this.isLoading,
      lastResponse: lastResponse
        ? {
            creditsCharged: lastResponse.creditsCharged,
            creditsRemaining: lastResponse.creditsRemaining,
            model: lastResponse.model,
          }
        : undefined,
    });
  }

  addMessageFromCommand(
    prompt: string,
    taskType: 'explain' | 'fix' | 'optimize' | 'comments' | 'debug',
    selectedCode?: string
  ): void {
    const fullPrompt = selectedCode
      ? `${prompt}\n\n\`\`\`\n${selectedCode}\n\`\`\``
      : prompt;

    const userMsg: ChatMessage = {
      type: 'user',
      content: fullPrompt,
      timestamp: Date.now(),
    };

    this.chatMessages.push(userMsg);
    this.onAddMessage?.(userMsg);
    this.isLoading = true;
    this.renderChat();

    // Check if API client is initialized
    if (!this.apiClient) {
      console.log('API key missing');
      const errorMsg: ChatMessage = {
        type: 'assistant',
        content: '❌ Please set your API key first using SimplifyConvert AI: Set API Key.',
        timestamp: Date.now(),
      };
      this.chatMessages.push(errorMsg);
      this.onAddMessage?.(errorMsg);
      this.isLoading = false;
      this.renderChat();
      return;
    }

    console.log('Calling generate endpoint');
    // Trigger API call
    this.apiClient.generate({
      prompt: fullPrompt,
      taskType: taskType,
    }).then((response) => {
      this.isLoading = false;

      if (response.success && response.response) {
        const assistantMsg: ChatMessage = {
          type: 'assistant',
          content: response.response,
          timestamp: Date.now(),
        };
        this.chatMessages.push(assistantMsg);
        this.onAddMessage?.(assistantMsg);
      } else {
        const errorMsg: ChatMessage = {
          type: 'assistant',
          content: `❌ Error: ${formatErrorMessage(response.errorCode || '', response.error || '')}`,
          timestamp: Date.now(),
        };
        this.chatMessages.push(errorMsg);
        this.onAddMessage?.(errorMsg);
      }

      this.renderChat(response);
    }).catch((error) => {
      this.isLoading = false;
      console.error('Error calling generate endpoint:', error);
      const errorMsg: ChatMessage = {
        type: 'assistant',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: Date.now(),
      };
      this.chatMessages.push(errorMsg);
      this.onAddMessage?.(errorMsg);
      this.renderChat();
    });
  }

  getWebviewContent(): string {
    if (!this.webview || !this.extensionUri) {
      return '<html><body>Error: Webview not properly initialized</body></html>';
    }

    // Generate a nonce for CSP
    const nonce = this.getNonce();

    // Get the URI for the script
    const scriptUri = this.webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'chat.js')
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
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
        }

        .message.user {
            background: var(--vscode-inputOption-activeBackground);
            margin-left: 20px;
            text-align: right;
        }

        .message.assistant {
            background: var(--vscode-editor-lineHighlightBackground);
            margin-right: 20px;
        }

        .message code {
            background: var(--vscode-editor-background);
            padding: 2px 4px;
            border-radius: 2px;
            font-family: var(--vscode-editor-font-family);
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
        }

        .buttonGroup {
            display: flex;
            gap: 8px;
        }

        .creditInfo {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
            padding: 4px;
            background: var(--vscode-editor-lineHighlightBackground);
            border-radius: 2px;
        }

        .error {
            color: var(--vscode-testing-messageForeground);
            background: var(--vscode-testing-message-error-decorationBackground);
        }
    </style>
</head>
<body>
    <div id="chatContainer"></div>
    <div id="creditInfo" class="creditInfo"></div>
    <div id="inputContainer">
        <textarea id="prompt" placeholder="Ask SimplifyConvert AI..."></textarea>
        <div style="display: flex; gap: 4px; flex-direction: column;">
            <button id="sendBtn">Send</button>
            <button id="clearBtn">Clear</button>
        </div>
    </div>

    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  private getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}
