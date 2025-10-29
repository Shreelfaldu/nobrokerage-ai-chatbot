const { Configuration, OpenAI } = require('openai');
const { extractFiltersFromText } = require('../utils/filterExtractor');

// Initialize OpenAI (or use fallback to regex)
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Extract filters from natural language query
 * Uses OpenAI if available, falls back to regex
 */
async function extractFilters(userQuery) {
  try {
    // If OpenAI is configured, use it for better understanding
    if (openai) {
      return await extractFiltersWithAI(userQuery);
    }
    
    // Fallback to regex-based extraction
    return extractFiltersFromText(userQuery);
    
  } catch (error) {
    console.error('NLP extraction error:', error);
    // Fallback to regex on error
    return extractFiltersFromText(userQuery);
  }
}

/**
 * Use OpenAI to extract structured filters
 */
async function extractFiltersWithAI(userQuery) {
  const prompt = `
You are a property search filter extraction system. Extract the following filters from the user query.
Return ONLY valid JSON with these exact fields:

{
  "city": "Mumbai" or "Pune" or null,
  "bhk": "1BHK" or "2BHK" or "3BHK" or "4BHK" or null,
  "minBudget": number in rupees or null,
  "maxBudget": number in rupees or null,
  "status": "READY_TO_MOVE" or "UNDER_CONSTRUCTION" or null,
  "locality": string or null,
  "projectName": string or null
}

Important:
- Convert "Cr" to multiply by 10000000
- Convert "Lakh" to multiply by 100000
- "under X Cr" means maxBudget = X
- Cities: Only Mumbai or Pune
- Status: "ready to move" = READY_TO_MOVE, "under construction" = UNDER_CONSTRUCTION

User Query: "${userQuery}"

Return only the JSON object, no explanation.
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a JSON filter extraction system.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    max_tokens: 200
  });

  const content = completion.choices[0].message.content.trim();
  
  // Parse JSON response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const filters = JSON.parse(jsonMatch[0]);
    return filters;
  }

  // Fallback to regex if AI fails
  return extractFiltersFromText(userQuery);
}

module.exports = {
  extractFilters
};
