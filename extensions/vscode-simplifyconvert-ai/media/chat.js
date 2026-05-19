console.log('SimplifyConvert webview loaded');

const vscode = acquireVsCodeApi();

const chatContainer = document.getElementById('chatContainer');
const promptInput = document.getElementById('prompt');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const cancelBtn = document.getElementById('cancelBtn');
const creditInfo = document.getElementById('creditInfo');
const modelNameDisplay = document.getElementById('modelName');
const creditsDisplay = document.getElementById('creditsDisplay');

function formatMessageContent(content) {
    const div = document.createElement('div');
    div.textContent = content;
    let html = div.innerHTML;
    const lines = html.split('\n');
    html = lines.join('<br>');
    return html;
}

sendBtn.addEventListener('click', function() {
    const text = promptInput.value.trim();
    if (text) {
        console.log('Send clicked');
        vscode.postMessage({
            command: 'sendMessage',
            text: text
        });
        promptInput.value = '';
        promptInput.focus();
    }
});

cancelBtn.addEventListener('click', function() {
    console.log('Cancel clicked');
    vscode.postMessage({
        command: 'cancelRequest'
    });
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
            loadingDiv.innerHTML = '<span class="loadingSpinner"></span>Generating response...';
            chatContainer.appendChild(loadingDiv);
            cancelBtn.classList.add('visible');
            sendBtn.disabled = true;
        } else {
            cancelBtn.classList.remove('visible');
            sendBtn.disabled = false;
        }

        if (message.lastResponse) {
            const model = message.lastResponse.model || 'Qwen 2.5 Coder';
            const credits = message.lastResponse.creditsRemaining;
            
            modelNameDisplay.textContent = model;
            
            if (credits !== undefined && credits !== null) {
                creditsDisplay.textContent = `💳 ${credits} credits remaining`;
            }
        }

        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    if (message.command === 'setLoading') {
        sendBtn.disabled = message.isLoading;
    }
});

promptInput.focus();
