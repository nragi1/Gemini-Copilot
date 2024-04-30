const express = require('express');
const { VertexAI } = require('@google-cloud/vertexai');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({ project: 'ai-hackathon-419617', location: 'europe-west2' });
const model = 'gemini-1.5-pro-preview-0409';

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    'maxOutputTokens': 1000,
    'temperature': 1,
    'topP': 0.95,
  },
  safetySettings: [
    { 'category': 'HARM_CATEGORY_HATE_SPEECH', 'threshold': 'BLOCK_MEDIUM_AND_ABOVE' },
    { 'category': 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold': 'BLOCK_MEDIUM_AND_ABOVE' },
    { 'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold': 'BLOCK_MEDIUM_AND_ABOVE' },
    { 'category': 'HARM_CATEGORY_HARASSMENT', 'threshold': 'BLOCK_MEDIUM_AND_ABOVE' }
  ],
});

// API endpoint for sending messages
app.options('/api/send-message', cors());
app.post('/api/send-message', cors(), async (req, res) => {
  const { message, history } = req.body;
  console.log('Received history:', history);
  
  let chat;
  if (history.length === 0) {
    // If there is no conversation history, start a new chat
    chat = generativeModel.startChat();
  } else {
    // If there is conversation history, continue the existing chat
    chat = generativeModel.startChat({ history });
  }

  // Send the user's message and wait for the response
  const result = await chat.sendMessage(message);
  const response = await result.response;
  const modelResponse = response.candidates[0].content.parts[0].text;

  // Add the user's message and the model's response to the conversation history
  const updatedHistory = [
    ...history,
    {
      role: 'user',
      parts: [{ text: message }],
    },
    {
      role: 'model',
      parts: [{ text: modelResponse }],
    },
  ];


  // Send the response to the client
  res.json({ response: modelResponse, history: updatedHistory });
});

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});