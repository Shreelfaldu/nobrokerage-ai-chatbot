/**
 * Extract filters from natural language text using regex patterns
 * Handles: city, BHK, budget (min/max), status, locality, area (min/max), amenities
 */
function extractFiltersFromText(text) {
  const filters = {
    city: null,
    bhk: null,
    minBudget: null,
    maxBudget: null,
    minArea: null,
    maxArea: null,
    status: null,
    locality: null,
    projectName: null,
    nearMetro: false,
    amenities: []
  };

  const lowerText = text.toLowerCase();

  // Extract city
  const cities = ['pune', 'mumbai', 'bangalore', 'delhi', 'hyderabad', 'chennai'];
  for (const city of cities) {
    if (lowerText.includes(city)) {
      filters.city = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  // Extract BHK
  const bhkMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*bhk/i);
  if (bhkMatch) {
    filters.bhk = `${bhkMatch[1]}BHK`;
  }

  // Extract MAXIMUM budget (under, below, less than)
  const maxBudgetPatterns = [
    /(?:under|below|less than|within|upto|up to|max|maximum)\s*₹?\s*([\d.]+)\s*(cr|crore|crores)/i,
    /(?:under|below|less than|within|upto|up to)\s*₹?\s*([\d.]+)\s*(lakh|lakhs|l)/i
  ];

  for (const pattern of maxBudgetPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      
      if (unit.includes('cr')) {
        filters.maxBudget = value * 10000000; // Crores to rupees
      } else if (unit.includes('lakh') || unit === 'l') {
        filters.maxBudget = value * 100000; // Lakhs to rupees
      }
      break;
    }
  }

  // Extract MINIMUM budget (above, more than, minimum)
  const minBudgetPatterns = [
    /(?:above|more than|greater than|minimum|min|atleast|at least)\s*₹?\s*([\d.]+)\s*(cr|crore|crores)/i,
    /(?:above|more than|greater than|minimum|min)\s*₹?\s*([\d.]+)\s*(lakh|lakhs|l)/i
  ];

  for (const pattern of minBudgetPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      
      if (unit.includes('cr')) {
        filters.minBudget = value * 10000000;
      } else if (unit.includes('lakh') || unit === 'l') {
        filters.minBudget = value * 100000;
      }
      break;
    }
  }

  // Extract MINIMUM carpet area (above, more than, minimum)
  const minAreaPatterns = [
    /(?:above|more than|greater than|minimum|min|atleast|at least)\s*([\d.]+)\s*(?:sq\.?\s*ft|square feet|sqft)/i,
    /(?:carpet area|area)\s*(?:above|more than|greater than)\s*([\d.]+)/i
  ];

  for (const pattern of minAreaPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      filters.minArea = parseFloat(match[1]);
      break;
    }
  }

  // Extract MAXIMUM carpet area (under, below, less than)
  const maxAreaPatterns = [
    /(?:under|below|less than|within|upto|up to|max|maximum)\s*([\d.]+)\s*(?:sq\.?\s*ft|square feet|sqft)/i,
    /(?:carpet area|area)\s*(?:under|below|less than)\s*([\d.]+)/i
  ];

  for (const pattern of maxAreaPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      filters.maxArea = parseFloat(match[1]);
      break;
    }
  }

  // Extract status
  if (lowerText.includes('ready to move') || lowerText.includes('ready-to-move') || lowerText.includes('ready')) {
    filters.status = 'READY_TO_MOVE';
  } else if (lowerText.includes('under construction') || lowerText.includes('under-construction')) {
    filters.status = 'UNDER_CONSTRUCTION';
  }

  // Extract "near metro" requirement
  if (lowerText.includes('near metro') || 
      lowerText.includes('metro station') || 
      lowerText.includes('metro access') ||
      lowerText.includes('close to metro') ||
      lowerText.includes('near to metro')) {
    filters.nearMetro = true;
  }

  // Extract specific amenities
  const amenityKeywords = {
    'gym': ['gym', 'fitness', 'fitness center'],
    'pool': ['pool', 'swimming pool', 'swimming'],
    'parking': ['parking', 'car parking', 'vehicle parking'],
    'lift': ['lift', 'elevator'],
    'garden': ['garden', 'park', 'green space'],
    'security': ['security', '24x7 security', 'gated'],
    'club': ['club', 'clubhouse', 'club house']
  };

  Object.entries(amenityKeywords).forEach(([amenity, keywords]) => {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      if (!filters.amenities.includes(amenity)) {
        filters.amenities.push(amenity);
      }
    }
  });

  // Extract localities (common areas)
  const localities = [
    'chembur', 'ravet', 'kharadi', 'wakad', 'baner', 'punawale',
    'hinjewadi', 'viman nagar', 'koregaon park', 'kalyani nagar',
    'mulund', 'thane', 'andheri', 'powai', 'goregaon'
  ];
  
  for (const locality of localities) {
    if (lowerText.includes(locality)) {
      filters.locality = locality;
      break;
    }
  }

  // Extract project name (if mentioned specifically)
  const projectNameMatch = lowerText.match(/(?:project|property|building)\s+(?:named?|called)?\s*"?([a-z0-9\s]+)"?/i);
  if (projectNameMatch) {
    filters.projectName = projectNameMatch[1].trim();
  }

  return filters;
}

module.exports = { extractFiltersFromText };
