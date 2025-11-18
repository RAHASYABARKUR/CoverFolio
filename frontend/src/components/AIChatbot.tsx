import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/resume/chat/', {
        message: inputMessage,
        conversation_history: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Function to format markdown text
  const formatMarkdown = (text: string) => {
    // Convert **bold** to <strong>
    let formatted = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em>
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Convert ### headers to bold
    formatted = formatted.replace(/###\s*(.+?)(\n|$)/g, '<strong style="display: block; margin: 8px 0; font-size: 1.1em;">$1</strong>');
    
    // Convert bullet points (*, -, +) to proper list items
    formatted = formatted.replace(/^[\*\-\+]\s+(.+)$/gm, '<li style="margin-left: 20px;">$1</li>');
    
    return formatted;
  };

  return (
    <>
      <style>{`
        .chat-button-wrapper:hover .chat-tooltip {
          opacity: 1 !important;
        }
        
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .ai-chat-button {
          background: linear-gradient(
            45deg,
            #667eea,
            #764ba2,
            #f093fb,
            #4facfe,
            #667eea
          );
          background-size: 300% 300%;
          animation: gradientShift 4s ease infinite;
        }
        
        .ai-chat-button:hover {
          animation: gradientShift 2s ease infinite;
        }
        
        /* Markdown formatting styles */
        .message-content strong {
          font-weight: 600;
          color: inherit;
        }
        
        .message-content em {
          font-style: italic;
        }
        
        .message-content li {
          list-style-type: disc;
          margin-left: 20px;
          margin-bottom: 4px;
        }
      `}</style>
      
      {/* Chat Button */}
      {!isOpen && (
        <div style={styles.chatButtonWrapper} className="chat-button-wrapper">
          <button
            onClick={() => setIsOpen(true)}
            style={styles.chatButton}
            className="ai-chat-button"
            aria-label="Open AI Assistant"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
          >
            <svg
              width="50"
              height="50"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={styles.aiIcon}
            >
              {/* Robot head */}
              <path
                d="M12 2L10.5 3.5M12 2L13.5 3.5M12 2V1"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <rect
                x="6"
                y="6"
                width="12"
                height="11"
                rx="2"
                fill="white"
                opacity="0.9"
              />
              {/* Eyes */}
              <circle cx="9.5" cy="10" r="1.5" fill="#667eea" />
              <circle cx="14.5" cy="10" r="1.5" fill="#667eea" />
              {/* Sparkle effect */}
              <path
                d="M19 8L20 9L19 10L18 9L19 8Z"
                fill="white"
                opacity="0.8"
              />
              <path
                d="M20 13L21 14L20 15L19 14L20 13Z"
                fill="white"
                opacity="0.6"
              />
              {/* Smile */}
              <path
                d="M9 14C9.5 14.5 10.5 15 12 15C13.5 15 14.5 14.5 15 14"
                stroke="#667eea"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              {/* Arms */}
              <rect x="4" y="10" width="2" height="4" rx="1" fill="white" opacity="0.8" />
              <rect x="18" y="10" width="2" height="4" rx="1" fill="white" opacity="0.8" />
            </svg>
          </button>
          <div style={styles.tooltip} className="chat-tooltip">AI Assistant</div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={styles.chatWindow}>
          {/* Header */}
          <div style={styles.chatHeader}>
            <div>
              <h3 style={styles.chatTitle}>AI Assistant</h3>
              <p style={styles.chatSubtitle}>Ask me anything about your resume or portfolio</p>
            </div>
            <button onClick={() => setIsOpen(false)} style={styles.closeButton}>
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={styles.messagesContainer}>
            {messages.length === 0 && (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>🤖</span>
                <p style={styles.emptyText}>
                  Hi! I'm your AI assistant. I can help you with:
                </p>
                <ul style={styles.suggestionsList}>
                  <li>Summarizing sections of your resume</li>
                  <li>Refining your cover letter</li>
                  <li>Improving your portfolio content</li>
                  <li>Answering career-related questions</li>
                </ul>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  ...styles.message,
                  ...(message.role === 'user' ? styles.userMessage : styles.assistantMessage),
                }}
              >
                <div 
                  style={styles.messageContent}
                  className="message-content"
                  dangerouslySetInnerHTML={{ 
                    __html: message.role === 'assistant' 
                      ? formatMarkdown(message.content).replace(/\n/g, '<br />')
                      : message.content.replace(/\n/g, '<br />') 
                  }}
                />
                <div style={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ ...styles.message, ...styles.assistantMessage }}>
                <div style={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={styles.inputContainer}>
            {messages.length > 0 && (
              <button onClick={clearChat} style={styles.clearButton} title="Clear chat">
                🗑️
              </button>
            )}
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              style={styles.input}
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              style={{
                ...styles.sendButton,
                ...((!inputMessage.trim() || isLoading) && styles.sendButtonDisabled),
              }}
              disabled={!inputMessage.trim() || isLoading}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  chatButtonWrapper: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 1000,
  },
  chatButton: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  aiIcon: {
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
  },
  tooltip: {
    position: 'absolute',
    bottom: '90px',
    right: '0',
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.2s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  chatIcon: {
    fontSize: '28px',
  },
  chatWindow: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '500px',
    height: '700px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    overflow: 'hidden',
  },
  chatHeader: {
    backgroundColor: '#667eea',
    color: 'white',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chatTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
  },
  chatSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    opacity: 0.9,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0',
    lineHeight: '1',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#6b7280',
  },
  emptyIcon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '14px',
    marginBottom: '12px',
  },
  suggestionsList: {
    textAlign: 'left',
    fontSize: '13px',
    lineHeight: '1.8',
    color: '#4b5563',
  },
  message: {
    maxWidth: '80%',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#667eea',
    color: 'white',
    borderBottomRightRadius: '4px',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
    borderBottomLeftRadius: '4px',
  },
  messageContent: {
    marginBottom: '4px',
  },
  messageTime: {
    fontSize: '11px',
    opacity: 0.7,
    textAlign: 'right',
  },
  typingIndicator: {
    display: 'flex',
    gap: '4px',
  },
  inputContainer: {
    padding: '16px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
  },
  clearButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px',
  },
  input: {
    flex: 1,
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    resize: 'none',
    fontFamily: 'inherit',
    maxHeight: '100px',
  },
  sendButton: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
    cursor: 'not-allowed',
  },
};

export default AIChatbot;
