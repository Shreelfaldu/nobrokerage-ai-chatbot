/**
 * Validate chat request
 */
function validateChatRequest(req, res, next) {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
        code: 'MISSING_MESSAGE'
      });
    }
    
    if (typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message must be a string',
        code: 'INVALID_MESSAGE_TYPE'
      });
    }
    
    if (message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message cannot be empty',
        code: 'EMPTY_MESSAGE'
      });
    }
    
    if (message.length > 500) {
      return res.status(400).json({
        error: 'Message is too long (max 500 characters)',
        code: 'MESSAGE_TOO_LONG'
      });
    }
    
    next();
  }
  
  module.exports = {
    validateChatRequest
  };
  