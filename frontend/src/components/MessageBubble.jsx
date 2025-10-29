import React from 'react';
import '../styles/MessageBubble.css';

function MessageBubble({ message }) {
  const { type, content, timestamp } = message;
  
  return (
    <div className={`message-row ${type}`}>
      <div className="message-container">
        {type === 'bot' && (
          <div className="avatar bot-avatar">🤖</div>
        )}
        <div className={`message-bubble ${type}`}>
          <div className="message-content">
            {content}
          </div>
        </div>
        {type === 'user' && (
          <div className="avatar user-avatar">👤</div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
