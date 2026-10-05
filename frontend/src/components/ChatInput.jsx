import React, { useRef, useEffect } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';

export default function ChatInput({ 
  inputMessage, 
  setInputMessage, 
  onSendMessage, 
  isLoading 
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea according to content height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollH, 180)}px`;
    }
  }, [inputMessage]);

  // Handle key combinations: Enter to send, Shift + Enter for newline
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    onSendMessage(inputMessage);
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <footer className="chat-input-container">
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <div className="input-box-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type any question here... (Enter to send, Shift + Enter for new line)"
            disabled={isLoading}
            aria-label="Ask a question"
          />

          <button
            type="submit"
            className="send-button"
            disabled={!inputMessage.trim() || isLoading}
            aria-label="Send message"
            title="Send message (Enter)"
          >
            <Send size={18} className="send-icon" />
          </button>
        </div>
      </form>

      <div className="input-footer-hints">
        <span className="hint-item">
          <kbd>Enter</kbd> to send
        </span>
        <span className="hint-divider">•</span>
        <span className="hint-item">
          <kbd>Shift</kbd> + <kbd>Enter</kbd> for new line
        </span>
        <span className="hint-divider">•</span>
        <span className="hint-item">Powered by LLM</span>
      </div>
    </footer>
  );
}
