const nlpService = require('../services/nlpService');
const searchService = require('../services/searchService');
const summaryService = require('../services/summaryService');

// Store conversation context per chat session (in-memory)
// In production, use Redis or database for scalability
const conversationMemory = new Map();

/**
 * Main chat query handler
 * Handles natural language property search with contextual memory
 */
exports.handleChatQuery = async (req, res) => {
  try {
    const { message, chatId } = req.body;

    // Validate message
    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    // Validate or generate chat ID
    const validChatId = chatId || `chat_${Date.now()}`;
    
    console.log('\n===== NEW QUERY =====');
    console.log('Chat ID:', validChatId);
    console.log('User Message:', message);

    // Get or create conversation context for THIS specific chat
    let context = conversationMemory.get(validChatId);
    
    if (!context) {
      console.log('→ Creating new context for chat:', validChatId);
      context = {
        previousFilters: {},
        conversationHistory: [],
        lastQuery: '',
        lastResults: []
      };
    } else {
      console.log('→ Using existing context');
      console.log('Previous Filters:', context.previousFilters);
    }

    // Extract filters from current message using NLP
    const currentFilters = await nlpService.extractFilters(message);
    console.log('Current Filters Extracted:', currentFilters);

    // SMART MERGE: Maintain context intelligently
    const mergedFilters = smartMergeWithContext(
      currentFilters, 
      context.previousFilters, 
      message,
      context.lastQuery
    );
    console.log('Merged Filters (Final):', mergedFilters);

    // Search properties with merged filters
    const properties = await searchService.searchProperties(mergedFilters);
    console.log('Properties Found:', properties.length);

    // Generate GROUNDED summary (NO hallucinations - company requirement)
    const summary = await summaryService.generateSummary(
      mergedFilters, 
      properties
    );

    // Update conversation context
    context.previousFilters = mergedFilters;
    context.lastQuery = message;
    context.lastResults = properties.slice(0, 10);
    context.conversationHistory.push({
      userQuery: message,
      filters: mergedFilters,
      resultCount: properties.length,
      timestamp: new Date()
    });

    // Keep only last 10 exchanges to prevent memory bloat
    if (context.conversationHistory.length > 10) {
      context.conversationHistory = context.conversationHistory.slice(-10);
    }

    // Save updated context
    conversationMemory.set(validChatId, context);
    console.log('Context Updated and Saved');
    console.log('Total Chats in Memory:', conversationMemory.size);
    console.log('====================\n');

    // Send response
    res.json({
      summary,
      properties: properties.slice(0, 10), // Limit to 10 results as per guidelines
      filters: mergedFilters,
      totalResults: properties.length,
      contextApplied: isContextApplied(currentFilters, mergedFilters),
      // chatId: validChatId
    });

  } catch (error) {
    console.error('Chat controller error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

/**
 * SMART CONTEXT MERGING
 * Intelligently merges current filters with previous context
 * Handles follow-up queries and refinements
 */
function smartMergeWithContext(currentFilters, previousFilters, currentMessage, previousMessage) {
  const lowerMessage = currentMessage.toLowerCase();
  const hasContext = Object.keys(previousFilters).some(key => previousFilters[key]);

  // Keywords that indicate COMPLETELY NEW search (ignore previous context)
  const newSearchKeywords = [
    'show me properties in',
    'find properties in',
    'search in',
    'looking for properties in',
    'i want properties in',
    'search properties in'
  ];

  const isCompletelyNewSearch = newSearchKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  ) && (currentFilters.city || currentFilters.locality);

  if (isCompletelyNewSearch) {
    console.log('→ Completely new search detected, ignoring previous context');
    return currentFilters;
  }

  // If no previous context exists, use current filters
  if (!hasContext) {
    console.log('→ No previous context, using current filters');
    return currentFilters;
  }

  // Keywords that indicate REFINEMENT (keep context)
  const refinementIndicators = [
    'i want', 'what about', 'how about', 'show me', 
    'any', 'instead', 'change to', 'make it', 
    'also', 'but', 'try', 'give me', 'get me'
  ];

  // Keywords that are JUST specifying details (definitely refinement)
  const specificationKeywords = [
    'bhk', 'ready', 'under construction', 
    'under', 'below', 'budget', 'cheaper', 'expensive',
    'near', 'locality', 'area', 'crore', 'lakh',
    'cr', 'lakhs'
  ];

  const hasSpecificationKeyword = specificationKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );

  const hasRefinementIndicator = refinementIndicators.some(keyword => 
    lowerMessage.includes(keyword)
  );

  // SHORT queries are usually refinements (e.g., "2bhk", "ready to move", "under 80 lakhs")
  const isShortQuery = currentMessage.trim().split(' ').length <= 5;

  // If it's clearly a refinement
  const isRefinement = hasSpecificationKeyword || hasRefinementIndicator || isShortQuery;

  // If new location is specified and it's not a refinement, treat as new search
  if (!isRefinement && (currentFilters.city || currentFilters.locality)) {
    console.log('→ New location specified without refinement indicator, treating as new search');
    return currentFilters;
  }

  // MERGE LOGIC: Keep previous context and update with new filters
  console.log('→ Refinement detected, merging with context');
  const merged = { ...previousFilters };

  // Update each filter intelligently
  Object.keys(currentFilters).forEach(key => {
    const currentValue = currentFilters[key];
    
    if (currentValue !== null && currentValue !== undefined) {
      // Always update if current filter has a value
      merged[key] = currentValue;
      console.log(`  Updated ${key}: ${previousFilters[key]} → ${currentValue}`);
    }
    // If current filter is null/undefined, keep previous value (maintain context)
  });

  return merged;
}

/**
 * Check if context was applied to filters
 * Used to inform frontend about context usage
 */
function isContextApplied(currentFilters, mergedFilters) {
  const currentCount = Object.keys(currentFilters).filter(k => currentFilters[k]).length;
  const mergedCount = Object.keys(mergedFilters).filter(k => mergedFilters[k]).length;
  return mergedCount > currentCount;
}

/**
 * Clear conversation context
 * Used when starting a new chat or clearing history
 */
exports.clearContext = (req, res) => {
  const { chatId } = req.body;
  
  console.log('\n===== CLEARING CONTEXT =====');
  console.log('Chat ID:', chatId);
  
  if (chatId) {
    const existed = conversationMemory.has(chatId);
    conversationMemory.delete(chatId);
    console.log(`→ Context ${existed ? 'cleared' : 'not found'} for chat:`, chatId);
    console.log('Remaining chats in memory:', conversationMemory.size);
    console.log('============================\n');
    
    res.json({ 
      success: true,
      message: existed ? 'Context cleared for chat' : 'No context found for chat', 
      chatId 
    });
  } else {
    const count = conversationMemory.size;
    conversationMemory.clear();
    console.log(`→ All contexts cleared (${count} chats)`);
    console.log('============================\n');
    
    res.json({ 
      success: true,
      message: `All contexts cleared (${count} chats)`,
      clearedCount: count
    });
  }
};

/**
 * Get conversation stats (optional - for debugging)
 */
exports.getContextStats = (req, res) => {
  const stats = {
    totalChats: conversationMemory.size,
    chats: []
  };

  conversationMemory.forEach((context, chatId) => {
    stats.chats.push({
      chatId,
      messageCount: context.conversationHistory.length,
      lastQuery: context.lastQuery,
      lastResultCount: context.lastResults.length,
      filters: context.previousFilters
    });
  });

  res.json(stats);
};
