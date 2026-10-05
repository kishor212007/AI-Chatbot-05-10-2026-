import { generateChatResponse, getActiveLLMInfo } from '../services/llmService.js';
import { logMessageIfAvailable } from '../services/dbService.js';

/**
 * Handle incoming chat message request
 * POST /api/chat
 * Body: { "message": "user question", "history": [...] }
 * Response: { "answer": "AI response" }
 */
export async function handleChatMessage(req, res) {
  try {
    const { message, history } = req.body;

    // Validate user message
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        error: 'A valid message string is required.'
      });
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length > 25000) {
      return res.status(400).json({
        error: 'Message is too long. Please limit your message to 25,000 characters.'
      });
    }

    // Context history
    const validHistory = Array.isArray(history)
      ? history.filter(item => item && typeof item.text === 'string' && item.role)
      : [];

    // Optional async logging to PostgreSQL
    logMessageIfAvailable('user', trimmedMessage).catch(() => {});

    // Generate answer using Local LLM (Ollama) or Cloud API
    const aiAnswer = await generateChatResponse(trimmedMessage, validHistory, req.body.mode);

    // Optional async logging to PostgreSQL
    logMessageIfAvailable('model', aiAnswer).catch(() => {});

    return res.status(200).json({
      answer: aiAnswer
    });
  } catch (error) {
    console.error('[ChatController Error]:', error.message || error);

    if (error.message && error.message.startsWith('NO_LLM_AVAILABLE')) {
      return res.status(503).json({
        error: 'No active AI engine found.',
        code: 'NO_LLM_AVAILABLE',
        instruction: 'Run your local Ollama ("ollama run llama3.2:1b") for 100% free local AI without API keys, or add LLM_API_KEY in the backend .env file.'
      });
    }

    return res.status(500).json({
      error: error.message || 'An error occurred while generating the AI response. Please try again.'
    });
  }
}

/**
 * Health check endpoint to verify backend status & active LLM model
 * GET /api/health
 */
export async function handleHealthCheck(req, res) {
  try {
    const info = await getActiveLLMInfo();
    return res.status(200).json({
      status: 'ok',
      message: 'AI Chatbot API Server is running.',
      llm: info,
      llmConfigured: info.ready
    });
  } catch (err) {
    return res.status(200).json({
      status: 'ok',
      message: 'AI Chatbot API Server is running.',
      llmConfigured: false
    });
  }
}
