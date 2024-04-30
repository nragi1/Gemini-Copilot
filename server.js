const express = require('express');
const { VertexAI } = require('@google-cloud/vertexai');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
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
  const streamResult = await generativeModel.startChat({ history }).sendMessageStream([{ text: message }]);
  const response = await streamResult.response;
  const modelResponse = response.candidates[0].content;

  // Send the response to the client
  res.json({ response: modelResponse.parts[0].text });
});

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});