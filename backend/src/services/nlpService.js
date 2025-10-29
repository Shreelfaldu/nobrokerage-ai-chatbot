const { OpenAI } = require('openai');
const { extractFiltersFromText } = require('../utils/filterExtractor');

// Azure OpenAI Configuration
const isAzureOpenAI = process.env.AZURE_OPENAI_ENDPOINT ? true : false;

const openaiConfig = isAzureOpenAI ? {
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
  defaultQuery: { 'api-version': '2024-08-01-preview' },
  defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY }
} : {
  apiKey: process.env.OPENAI_API_KEY
};

const openai = process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY 
  ? new OpenAI(openaiConfig) 
  : null;

/**
 * Extract filters using Azure OpenAI or fallback to regex
 */
async function extractFilters(text) {
  try {
    // Try Azure OpenAI first if configured
    if (openai) {
      console.log('Using Azure OpenAI for filter extraction');
      const filters = await extractFiltersWithAI(text);
      return filters;
    }
    
    // Fallback to regex
    console.log('Using regex filter extraction');
    return extractFiltersFromText(text);
    
  } catch (error) {
    console.error('NLP extraction error:', error.message);
    // Always fallback to regex on error
    return extractFiltersFromText(text);
  }
}

/**
 * Extract filters using Azure OpenAI GPT
 */
async function extractFiltersWithAI(text) {
  try {
    const systemPrompt = `You are a real estate search filter extractor. Extract these filters from user queries:
- city: City name (Mumbai, Pune, etc.)
- bhk: BHK type (1BHK, 2BHK, 3BHK, 4BHK)
- minBudget: Minimum budget in rupees
- maxBudget: Maximum budget in rupees
- minArea: Minimum carpet area in sq ft
- maxArea: Maximum carpet area in sq ft
- status: READY_TO_MOVE or UNDER_CONSTRUCTION
- locality: Area/locality name

Return ONLY a JSON object with these exact keys. Use null for missing values.`;

    const response = await openai.chat.completions.create({
      model: isAzureOpenAI ? process.env.AZURE_OPENAI_DEPLOYMENT : 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    return {
      city: parsed.city || null,
      bhk: parsed.bhk || null,
      minBudget: parsed.minBudget || null,
      maxBudget: parsed.maxBudget || null,
      minArea: parsed.minArea || null,
      maxArea: parsed.maxArea || null,
      status: parsed.status || null,
      locality: parsed.locality || null,
      projectName: parsed.projectName || null,
      nearMetro: parsed.nearMetro || false,
      amenities: parsed.amenities || []
    };

  } catch (error) {
    console.error('Azure OpenAI extraction failed:', error.message);
    throw error;
  }
}

module.exports = {
  extractFilters
};
