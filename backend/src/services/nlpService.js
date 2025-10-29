const { OpenAI } = require('openai');
const { extractFiltersFromText } = require('../utils/filterExtractor');

// Azure OpenAI Configuration
const isAzureOpenAI = !!process.env.AZURE_OPENAI_ENDPOINT;

let openai = null;

if (isAzureOpenAI) {
  // Azure OpenAI configuration
  console.log('Configuring Azure OpenAI...');
  openai = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
    defaultQuery: { 'api-version': '2024-02-15-preview' },
    defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY }
  });
} else if (process.env.OPENAI_API_KEY) {
  // Regular OpenAI configuration
  console.log('Configuring OpenAI...');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} else {
  console.log('No OpenAI configured - using regex only');
}

/**
 * Extract filters using AI or fallback to regex
 */
async function extractFilters(text) {
  try {
    // Try AI if configured
    if (openai) {
      const aiType = isAzureOpenAI ? 'Azure OpenAI' : 'OpenAI';
      console.log(`Using ${aiType} for filter extraction`);
      const filters = await extractFiltersWithAI(text);
      return filters;
    }
    
    // Fallback to regex
    console.log('Using regex filter extraction (no AI configured)');
    return extractFiltersFromText(text);
    
  } catch (error) {
    console.error('AI extraction error:', error.message);
    console.log('Falling back to regex extraction');
    return extractFiltersFromText(text);
  }
}

/**
 * Extract filters using Azure OpenAI or OpenAI
 */
async function extractFiltersWithAI(text) {
  try {
    const systemPrompt = `You are a real estate search filter extractor. Extract these filters from user queries:
- city: City name (Mumbai, Pune, Bangalore, Delhi, etc.)
- bhk: BHK type (1BHK, 2BHK, 3BHK, 4BHK)
- minBudget: Minimum budget in rupees (convert lakhs/crores to rupees)
- maxBudget: Maximum budget in rupees (convert lakhs/crores to rupees)
- minArea: Minimum carpet area in sq ft
- maxArea: Maximum carpet area in sq ft
- status: READY_TO_MOVE or UNDER_CONSTRUCTION
- locality: Area/locality name

Return ONLY a valid JSON object with these exact keys. Use null for missing values.

Example user query: "3BHK flat in Pune under 2 crores"
Example response: {"city": "Pune", "bhk": "3BHK", "maxBudget": 20000000, "minBudget": null, "minArea": null, "maxArea": null, "status": null, "locality": null}`;

    const response = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    const content = response.choices[0].message.content.trim();
    console.log('AI Response:', content);
    
    // Parse JSON response
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
