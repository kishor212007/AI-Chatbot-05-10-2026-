import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import ChatInput from './components/ChatInput';
import { sendChatMessage, checkServerHealth } from './services/chatService';
import './styles/Chatbot.css';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState({
    status: 'online',
    llmConfigured: true,
  });

  // Check server connection on mount and every 30 seconds
  useEffect(() => {
    let isMounted = true;
    const verifyHealth = async () => {
      try {
        const health = await checkServerHealth();
        if (isMounted) {
          if (health.status === 'ok') {
            setServerStatus({
              status: 'online',
              llm: health.llm,
              llmConfigured: Boolean(health.llmConfigured),
            });
          } else {
            setServerStatus({
              status: 'offline',
              llm: null,
              llmConfigured: false,
            });
          }
        }
      } catch {
        if (isMounted) {
          setServerStatus({ status: 'offline', llmConfigured: false });
        }
      }
    };

    verifyHealth();
    const interval = setInterval(verifyHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  /**
   * Send a message to the AI
   */
  const handleSendMessage = useCallback(async (textToSend) => {
    const trimmed = (textToSend || '').trim();
    if (!trimmed || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMessage = {
      id: userMessageId,
      role: 'user',
      text: trimmed,
      timestamp,
    };

    // Prepare current history to send for context memory
    // Converts state messages to lightweight { role, text } objects for the LLM
    const contextHistory = messages
      .filter((m) => !m.isError)
      .map((m) => ({
        role: m.role,
        text: m.text,
      }));

    // Update messages with user's question and clear input
    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send question and context history to the backend REST API
      const result = await sendChatMessage(trimmed, contextHistory);

      const aiMessageId = `ai-${Date.now()}`;
      const aiTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newAiMessage = {
        id: aiMessageId,
        role: 'model',
        text: result.answer,
        timestamp: aiTimestamp,
      };

      setMessages((prev) => [...prev, newAiMessage]);
      setServerStatus((prev) => ({ ...prev, status: 'online', llmConfigured: true }));
    } catch (err) {
      console.error('Error generating AI response:', err);

      const errorMessageId = `err-${Date.now()}`;
      const isMissingKey = err.code === 'MISSING_API_KEY' || err.code === 'NO_LLM_AVAILABLE';

      const errorText = isMissingKey
        ? `⚠️ **No Active LLM Available**\n\nYou can use the AI chatbot **100% locally with Zero API Keys**:\n\n1. **Option 1 (Recommended - 100% Free & Local)**:\n   - Run your local Ollama:\n   \`\`\`bash\n   ollama run llama3.2:1b\n   \`\`\`\n2. **Option 2 (Cloud LLM)**:\n   - Set your free Google Gemini API key in \`.env\`:\n   \`\`\`env\n   LLM_API_KEY=your_key_here\n   \`\`\`\n   - Get one free at [Google AI Studio](https://aistudio.google.com/).`
        : `⚠️ **Error communicating with AI service:**\n\n${err.message || 'Something went wrong while processing your request. Please try again.'}`;

      const errorMsgObj = {
        id: errorMessageId,
        role: 'model',
        text: errorText,
        isError: true,
        retryPrompt: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, errorMsgObj]);

      if (isMissingKey) {
        setServerStatus((prev) => ({ ...prev, llmConfigured: false }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  /**
   * Clear the current conversation from the screen
   */
  const handleClearChat = useCallback(() => {
    if (messages.length === 0) return;
    setMessages([]);
  }, [messages]);

  /**
   * Retry a prompt that failed
   */
  const handleRetry = useCallback((retryPrompt) => {
    if (!retryPrompt) return;
    // Remove last error message and retry
    setMessages((prev) => prev.filter((m) => !m.isError));
    handleSendMessage(retryPrompt);
  }, [handleSendMessage]);

  return (
    <div className="chat-app-root">
      <div className="chat-app-container">
        {/* Header */}
        <Header
          onClearChat={handleClearChat}
          messageCount={messages.length}
          serverStatus={serverStatus}
        />

        {/* Chat Area */}
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          onSelectSuggestion={handleSendMessage}
          onRetry={handleRetry}
        />

        {/* Input Area */}
        <ChatInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
