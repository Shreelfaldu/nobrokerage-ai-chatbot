const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const chatRoutes = require('./routes/chatRoutes');
const errorHandler = require('./middleware/errorHandler');
const { loadData } = require('./utils/dataLoader');
const config = require('./config/config');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  config.frontendUrl,
  process.env.AZURE_FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || 
        (origin && origin.includes('.azurestaticapps.net'))) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now, restrict in production
    }
  },
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'NoBrokerage AI Chatbot API is running',
    version: '1.0.0',
    environment: config.nodeEnv
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/chat', chatRoutes);

// Error handler
app.use(errorHandler);

// Load CSV data on startup
console.log('Loading CSV data...');
loadData()
  .then((stats) => {
    console.log('✅ CSV data loaded successfully');
    console.log('Stats:', stats);
  })
  .catch((error) => {
    console.error('❌ Error loading CSV data:', error);
    console.error('Server will continue but searches may fail');
    // Don't exit, let server run for health checks
  });

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
});

module.exports = app;
