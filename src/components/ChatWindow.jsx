import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Sparkles, User, Copy, Check, Archive, RefreshCw } from 'lucide-react';
import ModelSelector from './ModelSelector';

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const language = className ? className.replace('language-', '') : 'text';
  const codeContent = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ margin: '12px 0', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
      <div className="code-header">
        <span>{language}</span>
        <button className="copy-code-btn" onClick={handleCopy}>
          {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>
      <pre style={{ margin: 0 }}>
        <code>{codeContent}</code>
      </pre>
    </div>
  );
}

export default function ChatWindow({
  activeConversation,
  messages,
  streamingMessage,
  isStreaming,
  onSendMessage,
  onModelChange
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, isStreaming]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="chat-main">
      <header className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
            {activeConversation ? activeConversation.title : 'AI Chat Assistant'}
          </h2>
        </div>
        {activeConversation && (
          <ModelSelector
            currentModel={activeConversation.model}
            onSelectModel={(newModel) => onModelChange(activeConversation.id, newModel)}
          />
        )}
      </header>

      <div className="chat-messages">
        {(!messages || messages.length === 0) && !isStreaming && (
          <div style={{ textAlign: 'center', margin: 'auto', maxWidth: '460px', color: 'var(--text-secondary)' }}>
            <div className="brand-icon" style={{ width: '56px', height: '56px', margin: '0 auto 16px auto', borderRadius: 'var(--radius-lg)' }}>
              <Sparkles size={30} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              How can I help you today?
            </h3>
            <p style={{ fontSize: '0.92rem', lineHeight: '1.5' }}>
              Ask me to generate code, draft documentation, explain concepts, or assist with your full-stack project!
            </p>
          </div>
        )}

        {messages && messages.map((msg) => {
          const isUser = msg.sender === 'USER';
          return (
            <div key={msg.id || Math.random()} className={`message-bubble-wrapper ${isUser ? 'user' : 'ai'}`}>
              <div className={`msg-avatar ${isUser ? 'user' : 'ai'}`}>
                {isUser ? <User size={18} /> : <Sparkles size={18} />}
              </div>
              <div className="message-bubble">
                {isUser ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        return !inline ? (
                          <CodeBlock className={className}>{children}</CodeBlock>
                        ) : (
                          <code className={className} {...props}>{children}</code>
                        );
                      }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          );
        })}

        {isStreaming && (
          <div className="message-bubble-wrapper ai">
            <div className="msg-avatar ai">
              <Sparkles size={18} />
            </div>
            <div className="message-bubble">
              {streamingMessage ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      return !inline ? (
                        <CodeBlock className={className}>{children}</CodeBlock>
                      ) : (
                        <code className={className} {...props}>{children}</code>
                      );
                    }
                  }}
                >
                  {streamingMessage}
                </ReactMarkdown>
              ) : (
                <div className="typing-dots">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form className="chat-input-box" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Type a message... (Shift+Enter for newline)"
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            rows={1}
          />
         <button
  type="button"
  className="send-btn"
  disabled={!input.trim() || isStreaming}
  onClick={handleSubmit}
>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
