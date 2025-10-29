require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    temperature: 0.7,
    maxTokens: 150
  },
  
  // Search Configuration
  search: {
    maxResults: 10,
    enableSemanticSearch: false
  },
  
  // Data Configuration
  data: {
    csvPath: process.env.CSV_PATH || '../../../data'
  }
};
