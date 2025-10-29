/**
 * Generate summary STRICTLY from CSV data only
 * ZERO hallucinations allowed - company requirement
 */
function generateSummary(filters, properties) {
  try {
    if (properties.length === 0) {
      return generateNoResultsSummary(filters);
    }

    return generateStrictSummary(filters, properties);
  } catch (error) {
    console.error('Summary generation error:', error);
    return generateStrictSummary(filters, properties);
  }
}

/**
 * Generate STRICT summary using ONLY actual CSV data
 * NO assumptions, NO external info, NO hallucinations
 */
function generateStrictSummary(filters, properties) {
  const count = properties.length;
  
  // Extract ONLY actual data from results
  const actualCities = [...new Set(
    properties.map(p => p.city).filter(c => c && c !== 'N/A')
  )];
  
  const actualLocalities = [...new Set(
    properties.map(p => p.locality).filter(l => l && l !== 'N/A' && l.trim() !== '')
  )];
  
  const actualBHKs = [...new Set(
    properties.map(p => p.bhk).filter(b => b && b !== 'N/A')
  )];
  
  // Price calculations from ACTUAL data only
  const validPrices = properties
    .map(p => p.priceValue)
    .filter(p => !isNaN(p) && p > 0);
  
  const priceMin = validPrices.length > 0 ? Math.min(...validPrices) : 0;
  const priceMax = validPrices.length > 0 ? Math.max(...validPrices) : 0;
  
  // Status counts from ACTUAL data
  const readyCount = properties.filter(p => 
    p.status && p.status.includes('Ready')
  ).length;
  
  const underConstructionCount = properties.filter(p => 
    p.status && p.status.includes('Construction')
  ).length;

  // Amenities from ACTUAL data only
  const allAmenities = properties
    .flatMap(p => p.amenities || [])
    .filter(a => a && a.trim() !== '');
  
  const amenityCounts = {};
  allAmenities.forEach(amenity => {
    amenityCounts[amenity] = (amenityCounts[amenity] || 0) + 1;
  });
  
  const topAmenities = Object.entries(amenityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .filter(([_, count]) => count >= 2); // Only if at least 2 properties have it

  // Build summary sentence by sentence
  let sentences = [];

  // Sentence 1: Basic count and filters
  let s1 = `Found ${count} ${count === 1 ? 'property' : 'properties'}`;
  
  if (filters.bhk) {
    s1 += ` matching ${filters.bhk}`;
  } else if (actualBHKs.length > 0 && actualBHKs.length <= 3) {
    s1 += ` (${actualBHKs.join(', ')})`;
  }
  
  if (actualCities.length > 0) {
    s1 += ` in ${actualCities.join(' and ')}`;
  }
  
  if (filters.maxBudget) {
    s1 += ` within ${formatPrice(filters.maxBudget)} budget`;
  }
  
  sentences.push(s1 + '.');

  // Sentence 2: Localities (ONLY if data exists)
  if (actualLocalities.length > 0) {
    const topLocs = actualLocalities.slice(0, 3);
    if (topLocs.length === 1) {
      sentences.push(`Located in ${topLocs[0]}.`);
    } else if (topLocs.length === 2) {
      sentences.push(`Available in ${topLocs[0]} and ${topLocs[1]}.`);
    } else {
      sentences.push(`Top areas include ${topLocs[0]}, ${topLocs[1]}, and ${topLocs[2]}.`);
    }
  }

  // Sentence 3: Price range (ONLY if valid data)
  if (priceMin > 0 && priceMax > 0) {
    if (priceMin === priceMax) {
      sentences.push(`Priced at ${formatPrice(priceMin)}.`);
    } else {
      sentences.push(`Price range: ${formatPrice(priceMin)} to ${formatPrice(priceMax)}.`);
    }
  }

  // Sentence 4: Status (ONLY actual counts)
  if (readyCount > 0 && underConstructionCount > 0) {
    sentences.push(`${readyCount} ready-to-move and ${underConstructionCount} under construction.`);
  } else if (readyCount > 0) {
    sentences.push(`All ${readyCount} properties are ready-to-move.`);
  } else if (underConstructionCount > 0) {
    sentences.push(`All ${underConstructionCount} properties are under construction.`);
  }

  // Sentence 5: Amenities (ONLY if data exists)
  if (topAmenities.length > 0) {
    const amenityList = topAmenities
      .map(([name, count]) => `${name} (${count})`)
      .join(', ');
    sentences.push(`Common amenities: ${amenityList}.`);
  }

  return sentences.join(' ');
}

/**
 * Generate no results summary
 */
function generateNoResultsSummary(filters) {
  let summary = 'No properties found';
  
  const criteria = [];
  if (filters.bhk) criteria.push(filters.bhk);
  if (filters.city) criteria.push(`in ${filters.city}`);
  if (filters.locality) criteria.push(`in ${filters.locality}`);
  if (filters.maxBudget) criteria.push(`under ${formatPrice(filters.maxBudget)}`);
  if (filters.status === 'READY_TO_MOVE') criteria.push('ready-to-move');
  if (filters.status === 'UNDER_CONSTRUCTION') criteria.push('under construction');
  
  if (criteria.length > 0) {
    summary += ` for ${criteria.join(', ')}`;
  }
  
  summary += '. Try expanding your search criteria - adjust budget, BHK type, or explore nearby areas for more options.';
  
  return summary;
}

/**
 * Format price (NO assumptions, just formatting)
 */
function formatPrice(price) {
  if (!price || isNaN(price)) return 'N/A';
  
  const num = parseFloat(price);
  
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  } else {
    return `₹${num.toLocaleString('en-IN')}`;
  }
}

module.exports = {
  generateSummary
};
