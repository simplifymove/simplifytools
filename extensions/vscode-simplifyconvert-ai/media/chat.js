console.log('SimplifyConvert webview loaded');

const vscode = acquireVsCodeApi();

const chatContainer = document.getElementById('chatContainer');
const promptInput = document.getElementById('prompt');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const creditInfo = document.getElementById('creditInfo');

function formatMessageContent(content) {
    const div = document.createElement('div');
    div.textContent = content;
    let html = div.innerHTML;
    // Split on newline and rejoin with <br>
    const lines = html.split('\n');
    html = lines.join('<br>');
    return html;
}

sendBtn.addEventListener('click', function() {
    const text = promptInput.value.trim();
    if (text) {
        console.log('Send clicked');
        console.log('Message posted to extension');
        vscode.postMessage({
            command: 'sendMessage',
            text: text
        });
        promptInput.value = '';
        promptInput.focus();
    }
});

clearBtn.addEventListener('click', function() {
    vscode.postMessage({
        command: 'clearChat'
    });
});

promptInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        sendBtn.click();
    }
});

window.addEventListener('message', function(event) {
    const message = event.data;

    if (message.command === 'updateChat') {
        chatContainer.innerHTML = '';

        message.messages.forEach(function(msg) {
            const div = document.createElement('div');
            div.className = 'message ' + msg.type;
            div.innerHTML = formatMessageContent(msg.content);
            chatContainer.appendChild(div);
        });

        if (message.isLoading) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading';
            loadingDiv.textContent = '⏳ Generating response...';
            chatContainer.appendChild(loadingDiv);
        }

        if (message.lastResponse) {
            const creditsText = '📊 Credits: ' +
                (message.lastResponse.creditsRemaining || '?') +
                ' remaining | Model: ' +
                (message.lastResponse.model || 'Qwen 2.5 Coder');
            creditInfo.textContent = creditsText;
        }

        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    if (message.command === 'setLoading') {
        sendBtn.disabled = message.isLoading;
    }
});

promptInput.focus();
