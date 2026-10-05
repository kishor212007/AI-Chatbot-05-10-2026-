import React from 'react';
import { Bot, Trash2, Sparkles, Cpu, HardDrive } from 'lucide-react';

export default function Header({ onClearChat, messageCount, serverStatus }) {
  const isLocal = Boolean(serverStatus.llm?.isLocal);
  const modelName = serverStatus.llm?.model || 'Real LLM';

  return (
    <header className="chat-header">
      <div className="header-left">
        <div className="logo-badge">
          <Bot className="logo-icon" size={24} />
          <span className="pulse-indicator"></span>
        </div>
        <div className="header-titles">
          <div className="title-row">
            <h1 className="app-title">AI Chatbot</h1>
            <span className={`llm-pill ${isLocal ? 'local-pill' : ''}`}>
              {isLocal ? (
                <>
                  <HardDrive size={12} className="sparkle-icon" />
                  Local LLM ({modelName})
                </>
              ) : (
                <>
                  <Sparkles size={12} className="sparkle-icon" />
                  Real LLM
                </>
              )}
            </span>
          </div>
          <p className="app-subtitle">
            {isLocal
              ? 'Running 100% locally on your PC via Ollama • No API Key needed'
              : 'Intelligent AI assistant powered by modern language models'}
          </p>
        </div>
      </div>

      <div className="header-right">
        {/* Status Indicator */}
        <div className={`status-badge status-${serverStatus.status}`}>
          {serverStatus.status === 'online' && (
            <>
              <span className="status-dot"></span>
              <span className="status-text">
                {isLocal ? 'Offline Mode Active' : serverStatus.llmConfigured ? 'Ready' : 'API Key Needed'}
              </span>
            </>
          )}
          {serverStatus.status === 'down' || serverStatus.status === 'offline' ? (
            <>
              <span className="status-dot offline"></span>
              <span className="status-text">Server Offline</span>
            </>
          ) : null}
        </div>

        {/* Clear Chat Button */}
        {messageCount > 0 && (
          <button
            type="button"
            className="clear-chat-btn"
            onClick={onClearChat}
            title="Clear the current conversation"
            aria-label="Clear chat conversation"
          >
            <Trash2 size={16} />
            <span>Clear Chat</span>
          </button>
        )}
      </div>
    </header>
  );
}
