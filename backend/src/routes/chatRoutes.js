const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { validateChatRequest } = require('../middleware/validator');

// POST /api/chat - main chat endpoint
router.post('/', validateChatRequest, chatController.handleChatQuery);

// POST /api/chat/clear-context - clear context for specific chat
router.post('/clear-context', chatController.clearContext);

module.exports = router;
