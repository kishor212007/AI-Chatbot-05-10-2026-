import React, { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import EmptyState from './EmptyState';
import { Bot, ArrowDown } from 'lucide-react';

export default function ChatArea({ 
  messages, 
  isLoading, 
  onSelectSuggestion, 
  onRetry 
}) {
  const scrollEndRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Auto-scroll to bottom on new messages or loading state change
  useEffect(() => {
    if (scrollEndRef.current) {
      scrollEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Track scroll position to show "scroll to bottom" button if scrolled up
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isUp);
  };

  const scrollToBottom = () => {
    if (scrollEndRef.current) {
      scrollEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main 
      className="chat-area" 
      ref={containerRef} 
      onScroll={handleScroll}
      id="chat-scroll-area"
    >
      <div className="chat-messages-wrapper">
        {messages.length === 0 ? (
          <EmptyState onSelectSuggestion={onSelectSuggestion} />
        ) : (
          messages.map((msg, index) => (
            <ChatMessage 
              key={msg.id || index} 
              message={msg} 
              onRetry={onRetry} 
            />
          ))
        )}

        {/* Loading State: AI is thinking... */}
        {isLoading && (
          <div className="chat-message-row ai-row thinking-row">
            <div className="message-container">
              <div className="avatar-box ai-avatar thinking-avatar">
                <Bot size={18} />
              </div>
              <div className="message-bubble ai-bubble thinking-bubble">
                <div className="thinking-content">
                  <span className="thinking-text">AI is thinking</span>
                  <div className="typing-dots">
                    <span className="dot dot-1"></span>
                    <span className="dot dot-2"></span>
                    <span className="dot dot-3"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={scrollEndRef} className="scroll-anchor" />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          className="scroll-bottom-btn"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
          title="Scroll to latest message"
        >
          <ArrowDown size={18} />
        </button>
      )}
    </main>
  );
}
