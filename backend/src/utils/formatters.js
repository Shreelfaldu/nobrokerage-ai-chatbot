/**
 * Format price in Indian currency format
 */
function formatPrice(price) {
    const numPrice = parseFloat(price);
    
    if (isNaN(numPrice)) return 'N/A';
    
    if (numPrice >= 10000000) {
      return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    } else if (numPrice >= 100000) {
      return `₹${(numPrice / 100000).toFixed(2)} L`;
    } else if (numPrice >= 1000) {
      return `₹${(numPrice / 1000).toFixed(2)} K`;
    } else {
      return `₹${numPrice.toLocaleString('en-IN')}`;
    }
  }
  
  /**
   * Extract city from address string
   */
  function extractCity(address) {
    if (!address) return null;
    
    const cities = ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad'];
    const lowerAddress = address.toLowerCase();
    
    for (const city of cities) {
      if (lowerAddress.includes(city.toLowerCase())) {
        return city;
      }
    }
    
    return null;
  }
  
  /**
   * Clean and validate BHK format
   */
  function normalizeBHK(bhk) {
    if (!bhk) return null;
    
    const bhkStr = String(bhk).toUpperCase();
    const match = bhkStr.match(/(\d+)\s*BHK/i);
    
    if (match) {
      return `${match[1]}BHK`;
    }
    
    return bhkStr;
  }
  
  /**
   * Parse budget from string
   */
  function parseBudget(budgetStr) {
    if (!budgetStr) return null;
    
    const str = String(budgetStr).toLowerCase().replace(/,/g, '');
    
    // Match Crores
    const crMatch = str.match(/([\d.]+)\s*cr/);
    if (crMatch) {
      return parseFloat(crMatch[1]) * 10000000;
    }
    
    // Match Lakhs
    const lakhMatch = str.match(/([\d.]+)\s*(lakh|l)/);
    if (lakhMatch) {
      return parseFloat(lakhMatch[1]) * 100000;
    }
    
    // Direct number
    const numMatch = str.match(/[\d.]+/);
    if (numMatch) {
      return parseFloat(numMatch[0]);
    }
    
    return null;
  }
  
  module.exports = {
    formatPrice,
    extractCity,
    normalizeBHK,
    parseBudget
  };
  