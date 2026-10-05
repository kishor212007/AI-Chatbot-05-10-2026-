import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Copy, Check, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Custom Code Block with language tag and copy button
 */
function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-lang">{language || 'code'}</span>
        <button
          type="button"
          className="code-copy-btn"
          onClick={handleCopy}
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} className="copied-icon" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="code-pre">
        <code>{value}</code>
      </pre>
    </div>
  );
}

export default function ChatMessage({ message, onRetry }) {
  const [messageCopied, setMessageCopied] = useState(false);
  const isUser = message.role === 'user';
  const isError = Boolean(message.isError);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setMessageCopied(true);
      setTimeout(() => setMessageCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  return (
    <div className={`chat-message-row ${isUser ? 'user-row' : 'ai-row'} ${isError ? 'error-row' : ''}`}>
      <div className="message-container">
        {/* Avatar */}
        <div className={`avatar-box ${isUser ? 'user-avatar' : 'ai-avatar'} ${isError ? 'error-avatar' : ''}`}>
          {isUser ? (
            <User size={18} />
          ) : isError ? (
            <AlertCircle size={18} />
          ) : (
            <Bot size={18} />
          )}
        </div>

        {/* Bubble */}
        <div className={`message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'} ${isError ? 'error-bubble' : ''}`}>
          <div className="message-meta">
            <span className="author-name">{isUser ? 'You' : 'AI Chatbot'}</span>
            <span className="timestamp">{message.timestamp || 'Just now'}</span>
          </div>

          <div className="message-content">
            {isUser ? (
              <p className="user-text">{message.text}</p>
            ) : isError ? (
              <div className="error-content">
                <p className="error-title">Unable to generate response</p>
                <div className="error-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.text}
                  </ReactMarkdown>
                </div>
                {onRetry && (
                  <button
                    type="button"
                    className="retry-btn"
                    onClick={() => onRetry(message.retryPrompt)}
                  >
                    <RefreshCw size={14} />
                    <span>Try again</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="markdown-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeText = String(children).replace(/\n$/, '');

                      if (!inline && (match || codeText.includes('\n'))) {
                        return (
                          <CodeBlock
                            language={match ? match[1] : ''}
                            value={codeText}
                          />
                        );
                      }

                      return (
                        <code className="inline-code" {...props}>
                          {children}
                        </code>
                      );
                    },
                    a({ node, children, href, ...props }) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="chat-link"
                          {...props}
                        >
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Action footer */}
          {!isUser && !isError && (
            <div className="message-actions">
              <button
                type="button"
                className="action-btn"
                onClick={handleCopyMessage}
                title="Copy entire response"
              >
                {messageCopied ? (
                  <>
                    <Check size={14} className="copied-icon" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
