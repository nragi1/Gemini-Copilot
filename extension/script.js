let convHistory = [];

function storeHistory(history) {
  chrome.storage.session.set({ convHistory: history }, function() {
    console.log('History is set to ' + history);
  });
}

function getHistory(callback) {
  chrome.storage.session.get('convHistory', function(data) {
    callback(data.convHistory || []);
  });
}

async function sendMessage(message) {
  // Display the user's message in the chat interface
  const chatHistory = document.getElementById('chat-history');
  chatHistory.innerHTML += `<p><strong>User:</strong> ${message}</p>`;

  // Loading message
  const loadingMessage = document.createElement('p');
  loadingMessage.innerHTML = '<strong>Copilot:</strong> <img src="loading.gif" alt="Loading..." class="w-8 h-8 inline" />';
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
    body: JSON.stringify({ message: message, history: conversationHistory }),
  });

  const data = await response.json();
  const modelResponse = data.response;

  // Add response to conversation history
  convHistory.push({ author: 'Copilot', content: modelResponse });

  // Store history
  storeHistory(convHistory);

  // Remove the loading message
  chatHistory.removeChild(loadingMessage);

  // Display the conversation history in the chat interface change later
  chatHistory.innerHTML = recenthistory.map(entry => `<p><strong>${entry.author}:</strong> ${entry.content}</p>`).join('');

  // Enable the send button
  sendButton.disabled = false;
}

function startChat() {
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
}

// Close the chatbot
document.getElementById('close-button').addEventListener('click', function() {
  document.getElementById('chatbot-container').style.display = 'none';
});

// Dragging the Copilot
const chatbotContainer = document.getElementById('chatbot-container');
const chatbotHeader = document.getElementById('chatbot-header');
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

chatbotHeader.addEventListener('mousedown', function(event) {
  isDragging = true;
  offsetX = event.clientX - chatbotContainer.offsetLeft;
  offsetY = event.clientY - chatbotContainer.offsetTop;
});

document.addEventListener('mousemove', function(event) {
  if (!isDragging) return;

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const chatbotWidth = chatbotContainer.offsetWidth;
  const chatbotHeight = chatbotContainer.offsetHeight;

  let left = event.clientX - offsetX;
  let top = event.clientY - offsetY;

  // Restrict movement within the window
  if (left < 0) {
    left = 0;
  } else if (left + chatbotWidth > windowWidth) {
    left = windowWidth - chatbotWidth;
  }

  if (top < 0) {
    top = 0;
  } else if (top + chatbotHeight > windowHeight) {
    top = windowHeight - chatbotHeight;
  }

  chatbotContainer.style.left = left + 'px';
  chatbotContainer.style.top = top + 'px';
});

document.addEventListener('mouseup', function() {
  isDragging = false;
});

startChat();