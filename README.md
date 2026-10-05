# AI LLM Chatbot Application

A fully functional, modern ChatGPT-like AI chatbot web application built with **React.js**, **Node.js**, **Express.js**, and connected to a **real Large Language Model (LLM)** API (Google Gemini / OpenAI).

---

## 🌟 Key Features

1. **100% Local LLM (Zero API Keys Required)**:
   - Built-in automatic detection for **Ollama** running locally on your computer (`http://127.0.0.1:11434`).
   - Automatically utilizes your local model (such as `llama3.2:1b` or any installed Ollama model).
   - **Completely free, 100% offline, with zero external API calls and zero API keys needed!**

2. **Cloud LLM Support (Optional)**:
   - Supports **Google Gemini** (Gemini 2.5 Flash / 2.0 Flash / 1.5 Flash) via official `@google/genai` SDK.
   - Supports **OpenAI / OpenAI-compatible** endpoints (Groq, OpenRouter, DeepSeek).
   - Safe API key management via backend `.env` (`LLM_API_KEY`), never exposed to the frontend.

2. **Conversation Context (Multi-Turn Chat)**:
   - Maintains memory of the current chat session in the frontend.
   - Accurately resolves follow-up questions and pronouns (e.g. asking *"What is Python?"* followed by *"Why is it popular?"* understands "it" refers to Python).

3. **ChatGPT-like User Interface**:
   - **Header**: Application title (`AI Chatbot`), Real LLM badge, live server status indicator, and **Clear Chat** button.
   - **Welcome Hero / Empty State**: Helpful starter prompts (*"What is Python?"*, *"Explain HTML"*, *"Write a C program"*, *"What is Artificial Intelligence?"*, *"Help me learn English"*, *"What is a database?"*).
   - **Chat Area**: Distinct user and AI bubbles, timestamps, and smooth auto-scrolling to the latest message.
   - **Markdown & Code Formatting**: Full Markdown support (tables, lists, blockquotes) and syntax-highlighted code blocks with a one-click **Copy Code** button.
   - **Loading State**: Animated *"AI is thinking..."* with pulsing dots.
   - **Input Box**: Auto-expanding textarea with <kbd>Enter</kbd> to send and <kbd>Shift</kbd> + <kbd>Enter</kbd> for new lines.
   - **Error Handling**: Friendly error displays and clear instructions if the API key is not configured.

4. **Database (PostgreSQL)**:
   - Includes optional PostgreSQL chat logging via `pg`.
   - If PostgreSQL is not configured, the app runs safely and smoothly in memory-only mode without crashing.

---

## 📁 Project Structure

```
kishor/
├── .env                        # Environment variables (API Key, Port)
├── package.json                # Root package with scripts to run full-stack app
├── backend/
│   ├── .env                    # Backend environment file
│   ├── server.js               # Express application entry point
│   ├── controllers/
│   │   └── chatController.js   # Input validation, orchestration, error handling
│   ├── routes/
│   │   └── chatRoutes.js       # REST API endpoints (POST /api/chat, GET /api/health)
│   ├── services/
│   │   ├── llmService.js       # Real LLM API caller (Gemini & OpenAI)
│   │   └── dbService.js        # Optional PostgreSQL message logging
│   └── package.json
└── frontend/
    ├── index.html              # HTML shell with Google Fonts
    ├── vite.config.js          # Vite configuration with proxy to port 5000
    ├── src/
    │   ├── main.jsx            # React root mount
    │   ├── App.jsx             # Main chat application state & context
    │   ├── index.css           # Global typography and scrollbar styles
    │   ├── styles/
    │   │   └── Chatbot.css     # Glassmorphic dark ChatGPT theme
    │   ├── services/
    │   │   └── chatService.js  # REST API fetch calls to /api/chat
    │   └── components/
    │       ├── Header.jsx      # Title, LLM status, Clear Chat
    │       ├── ChatArea.jsx    # Messages container & auto-scroll
    │       ├── ChatMessage.jsx # Message bubbles, Markdown, Code blocks
    │       ├── ChatInput.jsx   # Auto-resize input & send trigger
    │       └── EmptyState.jsx  # Hero welcome & suggestion cards
    └── package.json
```

---

## 🚀 Quick Start Guide

### 1. Configure Your LLM API Key
Open `.env` (in the project root or in `backend/.env`) and add your API key:

```env
PORT=5000
LLM_API_KEY=your_actual_api_key_here
```

> **Where to get a key:**
> - **Google Gemini (Recommended & Free)**: Get a free key in 30 seconds at [Google AI Studio](https://aistudio.google.com/).
> - **OpenAI**: Get a key at [platform.openai.com](https://platform.openai.com/).

### 2. Run Both Frontend and Backend

From the project root:

```bash
npm run dev
```

This starts:
- **Backend server**: `http://localhost:5000`
- **Frontend web app**: `http://localhost:5173`

Or run them individually in separate terminals:
- **Backend**: `npm run backend` (or `cd backend && npm run dev`)
- **Frontend**: `npm run frontend` (or `cd frontend && npm run dev`)

### 3. Open in Browser
Visit **`http://localhost:5173`** in your browser. Type any question or click a suggestion to start chatting with the AI!

---

## 📡 REST API Documentation

### `POST /api/chat`
Sends a user message and conversation context to the LLM.

**Request Body:**
```json
{
  "message": "What is Python?",
  "history": [
    { "role": "user", "text": "Hello" },
    { "role": "model", "text": "Hello! How can I assist you today?" }
  ]
}
```

**Response:**
```json
{
  "answer": "Python is a high-level, interpreted programming language known for its simplicity and readability..."
}
```

### `GET /api/health`
Checks server and LLM configuration health.

**Response:**
```json
{
  "status": "ok",
  "message": "AI Chatbot API Server is running.",
  "llmConfigured": true
}
```
