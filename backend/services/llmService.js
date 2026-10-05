import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are a comprehensive, world-class AI assistant similar to ChatGPT, equipped with broad and deep real-world knowledge.
Your mission is to answer ANY real-world question with accuracy, depth, clarity, and practical relevance.

Key Directives:
1. Universal Knowledge: Whether the user asks about real-world science, software engineering, business, finance, medicine, history, law, geography, daily life, culture, philosophy, mathematics, or education, provide a well-structured, insightful, and practical response.
2. Real-World Context: When explaining concepts, always connect them to real-world examples, practical applications, industry standards, or tangible analogies so the user immediately understands how it works in practice.
3. Step-by-Step Problem Solving: For tutorials, coding, math, or complex tasks, break the answer down into logical, easy-to-follow steps.
4. Conversation Continuity: Actively track pronouns (like "it", "they", "this", "that") and maintain context from previous turns to handle follow-up questions smoothly.
5. Markdown Formatting: Use clean Markdown formatting:
   - Descriptive headings (##, ###)
   - Bullet points and numbered lists
   - Bold text for key terms
   - Tables when comparing concepts
6. Code Quality: ALWAYS format code snippets in fenced code blocks with the exact language specified (e.g. \`\`\`c, \`\`\`python, \`\`\`javascript, \`\`\`html, \`\`\`sql) and include brief explanatory comments.
7. Multilingual & Tone: Answer naturally in the user's language (English, Tamil, etc.), maintaining a helpful, encouraging, and authoritative tone.`;

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

/**
 * Check if local Ollama server is running and get available models
 */
export async function getLocalOllamaModels() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const data = await response.json();
    return (data.models || []).map(m => m.name);
  } catch {
    return null;
  }
}

/**
 * Call local Ollama LLM (100% Free, Local & No API Key Required)
 */
async function callOllama(modelName, message, history) {
  const messages = [
    { role: 'system', content: SYSTEM_INSTRUCTION }
  ];

  if (Array.isArray(history)) {
    for (const item of history) {
      if (!item || !item.text) continue;
      const role = (item.role === 'assistant' || item.role === 'model' || item.role === 'ai') ? 'assistant' : 'user';
      messages.push({
        role: role,
        content: String(item.text)
      });
    }
  }

  messages.push({
    role: 'user',
    content: String(message)
  });

  const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      messages: messages,
      stream: false,
      options: {
        temperature: 0.7,
        num_ctx: 8192,
        top_p: 0.9,
      }
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const answer = data.message?.content;
  if (!answer) {
    throw new Error('Received empty response from local Ollama model.');
  }

  return answer;
}

/**
 * Format conversation history into standard Gemini contents array
 */
function formatGeminiContents(history, currentMessage) {
  const contents = [];

  if (Array.isArray(history)) {
    for (const item of history) {
      if (!item || !item.text) continue;
      const role = (item.role === 'assistant' || item.role === 'model' || item.role === 'ai') ? 'model' : 'user';
      contents.push({
        role: role,
        parts: [{ text: String(item.text) }]
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: String(currentMessage) }]
  });

  return contents;
}

/**
 * Call Google Gemini API using @google/genai SDK
 */
async function callGemini(apiKey, message, history) {
  const ai = new GoogleGenAI({ apiKey });
  const contents = formatGeminiContents(history, message);

  const preferredModel = process.env.LLM_MODEL || 'gemini-2.5-flash';
  const fallbackModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro'];
  const modelsToTry = [preferredModel, ...fallbackModels.filter(m => m !== preferredModel)];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini] Model ${model} failed: ${err.message}. Trying fallback...`);
      if (err.message && (err.message.includes('API_KEY_INVALID') || err.message.includes('API key not valid'))) {
        throw new Error('Invalid Gemini API key provided. Please check your LLM_API_KEY in the .env file.');
      }
    }
  }

  throw lastError || new Error('Failed to get a response from Gemini API.');
}

/**
 * Call OpenAI or OpenAI-compatible API
 */
async function callOpenAICompatible(apiKey, message, history) {
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';

  const messages = [
    { role: 'system', content: SYSTEM_INSTRUCTION }
  ];

  if (Array.isArray(history)) {
    for (const item of history) {
      if (!item || !item.text) continue;
      const role = (item.role === 'assistant' || item.role === 'model' || item.role === 'ai') ? 'assistant' : 'user';
      messages.push({
        role: role,
        content: String(item.text)
      });
    }
  }

  messages.push({
    role: 'user',
    content: String(message)
  });

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorDetail = errorBody;
    try {
      const parsed = JSON.parse(errorBody);
      errorDetail = parsed.error?.message || errorBody;
    } catch (_) {}
    throw new Error(`OpenAI API error (${response.status}): ${errorDetail}`);
  }

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content;
  if (!answer) {
    throw new Error('Received empty response from OpenAI-compatible API.');
  }

  return answer;
}

/**
 * Determine and return active LLM info (Local Ollama vs Cloud)
 */
export async function getActiveLLMInfo() {
  const apiKey = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  const hasCloudKey = Boolean(apiKey && apiKey.trim() && !apiKey.includes('your_'));

  const localModels = await getLocalOllamaModels();
  const hasLocal = localModels && localModels.length > 0;

  return {
    provider: hasCloudKey ? (apiKey.startsWith('sk-') ? 'openai' : 'gemini') : (hasLocal ? 'ollama' : 'none'),
    model: hasCloudKey ? (process.env.LLM_MODEL || (apiKey.startsWith('sk-') ? 'gpt-4o-mini' : 'gemini-2.5-flash')) : (hasLocal ? (process.env.OLLAMA_MODEL || localModels[0]) : 'none'),
    isLocal: !hasCloudKey && hasLocal,
    hasLocalOllama: hasLocal,
    hasCloudKey: hasCloudKey,
    localModels: localModels || [],
    ready: hasLocal || hasCloudKey,
  };
}

/**
 * Main service method to generate chat answer using available LLM (Local Ollama or Cloud)
 * @param {string} message - Current user message
 * @param {Array<{role: string, text: string}>} history - Previous conversation messages
 * @param {string} [preferredMode] - Optional 'cloud' or 'local'
 * @returns {Promise<string>} AI response text
 */
export async function generateChatResponse(message, history = [], preferredMode = null) {
  const apiKey = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  const hasCloudKey = Boolean(apiKey && apiKey.trim() && !apiKey.includes('your_'));

  const localModels = await getLocalOllamaModels();
  const hasLocal = localModels && localModels.length > 0;

  // If user prefers cloud or has key configured and didn't force local
  if ((preferredMode === 'cloud' && hasCloudKey) || (hasCloudKey && preferredMode !== 'local')) {
    const provider = (process.env.LLM_PROVIDER || '').toLowerCase();
    if (provider === 'openai' || (!provider && apiKey.startsWith('sk-'))) {
      return await callOpenAICompatible(apiKey, message, history);
    }
    return await callGemini(apiKey, message, history);
  }

  // Use Local Ollama (Zero API keys)
  if (hasLocal) {
    const selectedModel = process.env.OLLAMA_MODEL || localModels[0];
    console.log(`[LLM] Using Local Ollama model: ${selectedModel} (Real-World Engine Active)`);
    return await callOllama(selectedModel, message, history);
  }

  // Fallback to Cloud if key exists but local was absent
  if (hasCloudKey) {
    return await callGemini(apiKey, message, history);
  }

  throw new Error(
    'NO_LLM_AVAILABLE: Local Ollama is not running and no cloud API key is configured. Run Ollama locally ("ollama run llama3.2:1b") for 100% free local AI with 0 API keys, or add LLM_API_KEY in .env.'
  );
}
