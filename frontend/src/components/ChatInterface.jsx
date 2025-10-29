import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import PropertyCard from './PropertyCard';
import InputBox from './InputBox';
import { sendChatMessage } from '../services/api';
import '../styles/ChatInterface.css';

function ChatInterface() {
  // State for current chat
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Hello! I\'m your NoBrokerage property assistant. I can help you find properties using natural language. Try asking me something like "3BHK flat in Pune under ₹1.2 Cr"',
      timestamp: new Date()
    }
  ]);
  
  // State for chat history
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setChatHistory(parsed);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }

    // Load current chat ID
    const savedChatId = localStorage.getItem('currentChatId');
    if (savedChatId) {
      setCurrentChatId(savedChatId);
      loadChat(savedChatId);
    } else {
      // Create initial chat with unique ID
      const initialChatId = `chat_${Date.now()}`;
      setCurrentChatId(initialChatId);
      saveCurrentChat(initialChatId, messages);
    }
  }, []);

  // Save current chat to localStorage whenever messages change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      saveCurrentChat(currentChatId, messages);
    }
  }, [messages, currentChatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save current chat to localStorage
  const saveCurrentChat = (chatId, chatMessages) => {
    const chatTitle = generateChatTitle(chatMessages);
    const chatData = {
      id: chatId,
      title: chatTitle,
      messages: chatMessages,
      lastUpdated: new Date().toISOString()
    };

    // Update or add chat to history
    const updatedHistory = [...chatHistory];
    const existingIndex = updatedHistory.findIndex(chat => chat.id === chatId);
    
    if (existingIndex >= 0) {
      updatedHistory[existingIndex] = chatData;
    } else {
      updatedHistory.unshift(chatData);
    }

    // Keep only last 20 chats
    const trimmedHistory = updatedHistory.slice(0, 20);
    
    setChatHistory(trimmedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(trimmedHistory));
    localStorage.setItem('currentChatId', chatId);
  };

  // Generate chat title from first user message
  const generateChatTitle = (chatMessages) => {
    const firstUserMessage = chatMessages.find(msg => msg.type === 'user');
    if (firstUserMessage) {
      const title = firstUserMessage.content;
      return title.length > 40 ? title.substring(0, 40) + '...' : title;
    }
    return 'New Chat';
  };

  // Load a specific chat
  const loadChat = (chatId) => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      const chat = history.find(c => c.id === chatId);
      if (chat) {
        // Convert timestamp strings back to Date objects
        const messagesWithDates = chat.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
        setCurrentChatId(chatId);
        localStorage.setItem('currentChatId', chatId);
        
        console.log('=== CHAT LOADED ===');
        console.log('Chat ID:', chatId);
        console.log('Messages:', messagesWithDates.length);
        console.log('===================');
      }
    }
  };

  // Clear backend context
  const clearBackendContext = async (chatId) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/chat/clear-context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chatId })
      });
      
      const data = await response.json();
      console.log('Backend context cleared:', data);
    } catch (error) {
      console.error('Failed to clear backend context:', error);
    }
  };

  // Create new chat
  const handleNewChat = () => {
    const newChatId = `chat_${Date.now()}`;
    const initialMessage = {
      type: 'bot',
      content: 'Hello! I\'m your NoBrokerage property assistant. I can help you find properties using natural language. Try asking me something like "3BHK flat in Pune under ₹1.2 Cr"',
      timestamp: new Date()
    };
    
    // Clear any pending requests
    setIsLoading(false);
    
    // Set new chat
    setCurrentChatId(newChatId);
    setMessages([initialMessage]);
    
    // Save new chat
    saveCurrentChat(newChatId, [initialMessage]);
    localStorage.setItem('currentChatId', newChatId);
    
    // Clear backend context for new chat
    clearBackendContext(newChatId);
    
    console.log('=== NEW CHAT CREATED ===');
    console.log('New Chat ID:', newChatId);
    console.log('========================');
  };

  // Delete a chat
  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));

    // If deleting current chat, create a new one
    if (chatId === currentChatId) {
      handleNewChat();
    }
    
    // Clear backend context for deleted chat
    clearBackendContext(chatId);
  };

  // Send message
  const handleSendMessage = async (userMessage) => {
    // Ensure we have a valid chat ID
    const activeChatId = currentChatId || `chat_${Date.now()}`;
    
    if (!currentChatId) {
      setCurrentChatId(activeChatId);
    }

    console.log('=== SENDING MESSAGE ===');
    console.log('Chat ID:', activeChatId);
    console.log('Message:', userMessage);
    console.log('======================');

    // Add user message
    const userMessageObj = {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessageObj]);
    setIsLoading(true);

    try {
      // Send with correct chat ID
      const response = await sendChatMessage(userMessage, activeChatId);
      
      console.log('Response received:', {
        filters: response.filters,
        totalResults: response.totalResults,
        contextApplied: response.contextApplied
      });
      
      // Add bot summary response
      const botMessageObj = {
        type: 'bot',
        content: response.summary,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessageObj]);

      // Add property cards if available
      if (response.properties && response.properties.length > 0) {
        const propertiesObj = {
          type: 'properties',
          properties: response.properties,
          totalResults: response.totalResults,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, propertiesObj]);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        type: 'bot',
        content: '❌ Sorry, I encountered an error. Please check if the backend server is running on port 5000.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all history
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      localStorage.removeItem('chatHistory');
      setChatHistory([]);
      handleNewChat();
    }
  };

  return (
    <div className="chat-interface">
      {/* Sidebar - ChatGPT Style */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>🏠 NoBrokerage</h2>
        </div>
        <div className="sidebar-content">
          <button className="new-chat-btn" onClick={handleNewChat}>
            + New Chat
          </button>
          
          <div className="chat-history">
            <div className="history-header">
              <p className="history-title">Recent Chats</p>
              {chatHistory.length > 0 && (
                <button 
                  className="clear-history-btn" 
                  onClick={handleClearHistory}
                  title="Clear all history"
                >
                  🗑️
                </button>
              )}
            </div>
            
            {chatHistory.length === 0 ? (
              <p className="no-history">No chat history yet</p>
            ) : (
              chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={`history-item ${chat.id === currentChatId ? 'active' : ''}`}
                  onClick={() => loadChat(chat.id)}
                >
                  <span className="chat-title">{chat.title}</span>
                  <button
                    className="delete-chat-btn"
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    title="Delete chat"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="sidebar-footer">
          <div className="chat-count">
            {chatHistory.length} {chatHistory.length === 1 ? 'chat' : 'chats'} saved
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Header */}
        <div className="chat-header">
          <h1>NoBrokerage AI Assistant</h1>
          <p>Find your perfect property with natural language</p>
          {currentChatId && (
            <div className="chat-id-corner">
              <span className="chat-id-icon">💬</span>
              <span className="chat-id-text">{currentChatId}</span>
            </div>
          )}
        </div>

        {/* Messages Container */}
        <div className="messages-container">
          <div className="messages-wrapper">
            {messages.map((message, index) => (
              <div key={index}>
                {message.type === 'properties' ? (
                  <div className="properties-section">
                    <div className="properties-header">
                      <h3>📍 Found {message.totalResults} Properties</h3>
                      <p>Showing top {Math.min(10, message.properties.length)} results</p>
                    </div>
                    <div className="properties-grid">
                      {message.properties.map((property, idx) => (
                        <PropertyCard key={idx} property={property} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <MessageBubble message={message} />
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="loading-message">
                <div className="bot-avatar-small">🤖</div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Box */}
        <InputBox onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}

export default ChatInterface;
