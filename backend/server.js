import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import chatRoutes from './routes/chatRoutes.js';
import './services/dbService.js'; // initialize optional DB connection

// Configure dotenv to look in current folder and parent folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow frontend development port and production
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '2mb' }));

// Mount Chat routes
app.use('/api', chatRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'AI Chatbot API Server',
    status: 'online',
    endpoints: {
      chat: 'POST /api/chat',
      health: 'GET /api/health'
    }
  });
});

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

// Start Express Server
app.listen(PORT, () => {
  const hasKey = Boolean(process.env.LLM_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
  console.log(`====================================================`);
  console.log(`🚀 AI Chatbot Backend Server running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`🔑 LLM API Key: ${hasKey ? 'Configured ✅' : 'Missing in .env ⚠️'}`);
  if (!hasKey) {
    console.log(`ℹ️  To enable real AI answers, set LLM_API_KEY in .env file.`);
    console.log(`   (Get a free Google Gemini key at https://aistudio.google.com/)`);
  }
  console.log(`====================================================`);
});
