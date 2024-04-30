let convHistory = [];

function storeHistory(history) {
  sessionStorage.setItem('convHistory', JSON.stringify(history));
  console.log('History is set to ' + JSON.stringify(history));
}

function getHistory(callback) {
  const storedHistory = sessionStorage.getItem('convHistory');
  callback(storedHistory ? JSON.parse(storedHistory) : []);
}

function createLoadingMessage() {
  const chatbotContainer = document.getElementById('chatbot-container');
  if (chatbotContainer) {
    const loadingMessage = document.createElement('p');
    loadingMessage.innerHTML = '<strong>Copilot:</strong> ';

    const loadingImageUrl = chatbotContainer.dataset.loadingImageUrl;

    const loadingImage = document.createElement('img');
    loadingImage.src = loadingImageUrl;
    loadingImage.alt = 'Loading...';
    loadingImage.classList.add('w-7', 'h-5', 'inline');

    loadingMessage.appendChild(loadingImage);
    return loadingMessage;
  } else {
    // If chatbotContainer is not available yet, retry after a short delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(createLoadingMessage());
      }, 100);
    });
  }
}

async function sendMessage(message, fromContext = false) {
  // Display the user's message in the chat interface
  const chatHistory = document.getElementById('chat-history');
  chatHistory.innerHTML = `<p><strong>User:</strong> ${message}</p>`;

  // Loading message
  const loadingMessage = await createLoadingMessage();
  chatHistory.appendChild(loadingMessage);

  // Disable the send button
  const sendButton = document.getElementById('send-button');
  sendButton.disabled = true;
  
  // Send the user's message to the server
  const response = await fetch('http://localhost:3000/api/send-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: message, history: convHistory }),
  });

  const data = await response.json();
  const modelResponse = data.response;
  convHistory = data.history;

  // Store history
  storeHistory(convHistory);

  // Remove the loading message
  chatHistory.removeChild(loadingMessage);

  // Display the conversation history in the chat interface
  // chatHistory.innerHTML = convHistory.map(entry => {
    // const role = entry.role;
    // const text = entry.parts[0].text;
    // return `<p><strong>${role === 'user' ? 'User' : 'Copilot'}:</strong> ${text}</p>`;
  // }).join('');

  // Display the model's response in the chat interface
  chatHistory.innerHTML = `<p><strong>User:</strong> ${message}</p><p><strong>Copilot:</strong> ${modelResponse}</p>`;

  // Enable the send button
  sendButton.disabled = false;

  if (!fromContext) {
    const userInput = document.getElementById('user-input');
    userInput.focus();
  } else {
    window.postMessage({ action: "responseReceived" }, "*");
  }
}

// Expose the sendMessage function to the window object
window.sendMessage = sendMessage;

window.addEventListener("message", (event) => {
  if (event.data.action === "sendMessage") {
    sendMessage(event.data.message, event.data.fromContext);
  }
});

const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
let isSending = false;

sendButton.addEventListener('click', async () => {
  if (!isSending) {
    isSending = true;
    const message = userInput.value;
    userInput.value = '';
    await sendMessage(message);
    isSending = false;
  }
});
userInput.addEventListener('keypress', async (event) => {
  if (event.key === 'Enter' && !isSending) {
    isSending = true;
    const message = userInput.value;
    userInput.value = '';
    await sendMessage(message);
    isSending = false;
  }
});
