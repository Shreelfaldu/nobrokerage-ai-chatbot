import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import '../styles/InputBox.css';

function InputBox({ onSend, disabled }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="input-container">
      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-wrapper">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message NoBrokerage AI..."
            disabled={disabled}
            rows="1"
            className="message-input"
          />
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="send-button"
            aria-label="Send message"
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>
      <div className="input-footer">
        <p>NoBrokerage AI can make mistakes. Verify property details.</p>
      </div>
    </div>
  );
}

export default InputBox;
