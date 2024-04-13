let chatbotContainer = null;
let isInjected = false;
let chatbotState = false;

function createChatbotContainer() {
  if (chatbotState) return;
  chatbotContainer = document.createElement('div');
  chatbotContainer.id = 'chatbot-container';
  chatbotContainer.classList.add('fixed', 'bottom-4', 'right-4');
  chatbotContainer.innerHTML = `
    <div id="chatbot-header" class="w-72 py-1 px-1 bg-gray-100 dark:bg-gray-800 rounded-t-xl shadow-xl border dark:border-gray-700 cursor-move flex items-center justify-between">
      <p class="text-gray-800 dark:text-gray-300 text-sm font-semibold">Chrome Copilot</p>
      <button id="close-button" class="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none">
        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div id="chatbot-body" class="w-72 py-1 px-1 bg-white dark:bg-gray-800 rounded-b-xl shadow-xl border dark:border-gray-700">
      <div id="chat-history" class="pb-1 overflow-y-auto text-gray-800 dark:text-white text-sm"></div>
      <div id="input-container" class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg border dark:border-gray-700 flex items-center">
        <input type="text" id="user-input" class="flex-grow bg-transparent text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none text-sm" placeholder="Ask a question" autocomplete="off">
        <button id="send-button" class="ml-2 px-2 py-1 rounded text-gray-500 hover:text-gray-400 focus:outline-none">
          <svg width="18" height="18" viewBox="0 -0.5 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M2.61258 9L0.05132 1.31623C-0.22718 0.48074 0.63218 -0.28074 1.42809 0.09626L20.4281 9.0963C21.1906 9.4575 21.1906 10.5425 20.4281 10.9037L1.42809 19.9037C0.63218 20.2807 -0.22718 19.5193 0.05132 18.6838L2.61258 11H8.9873C9.5396 11 9.9873 10.5523 9.9873 10C9.9873 9.4477 9.5396 9 8.9873 9H2.61258z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      <p class="text-blue-500 dark:text-blue-300 text-xs pt-1 ml-1">Powered by Gemini</p>
    </div>
  `;

  // z-index
  chatbotContainer.style.zIndex = '9999';

  // Fix pointer events
  chatbotContainer.style.pointerEvents = 'none';
  const chatbotHeader = chatbotContainer.querySelector('#chatbot-header');
  const inputContainer = chatbotContainer.querySelector('#input-container');
  chatbotHeader.style.pointerEvents = 'auto';
  inputContainer.style.pointerEvents = 'auto';

  // Inject
  document.body.appendChild(chatbotContainer);

  // Load the script.js file
  if (!isInjected) {
    const scriptElement = document.createElement('script');
    scriptElement.src = chrome.runtime.getURL('script.js');
    document.body.appendChild(scriptElement);
    isInjected = true;
  }

  // Load the styles.css file
  const styleElement = document.createElement('link');
  styleElement.rel = 'stylesheet';
  styleElement.type = 'text/css';
  styleElement.href = chrome.runtime.getURL('styles.css');
  document.head.appendChild(styleElement);

  chatbotState = true;

  // Initialise drag and drop
  chatbotHeader.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);

  // Close through close button
  document.getElementById('close-button').addEventListener('click', function() {
    removeChatbotContainer();
  });

  startChat();
} 

// Remove the chatbot container
function removeChatbotContainer() {
  if (chatbotContainer) {
    const chatbotHeader = document.getElementById('chatbot-header');
    chatbotHeader.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    chatbotContainer.remove();
    chatbotContainer = null;
    chatbotState = false;
  }
}

// Dragging the chatbot container
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

function handleMouseDown(event) {
  isDragging = true;
  offsetX = event.clientX - chatbotContainer.offsetLeft;
  offsetY = event.clientY - chatbotContainer.offsetTop;
}

function handleMouseMove(event) {
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
}

function handleMouseUp() {
  isDragging = false;
}

// Toggle the chatbot container
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'toggleChatbot') {
    if (chatbotContainer) {
      removeChatbotContainer();
    } else {
      createChatbotContainer();
    }
  }
});