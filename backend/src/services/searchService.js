const { getMergedData } = require('../utils/dataLoader');

/**
 * Search properties based on extracted filters
 * Supports: city, BHK, budget (min/max), area (min/max), status, locality, nearMetro, amenities
 */
function searchProperties(filters) {
  try {
    let results = getMergedData();

    console.log('\n===== SEARCH FILTERS =====');
    console.log('Total properties before filtering:', results.length);
    console.log('Applied filters:', filters);

    // Filter by city
    if (filters.city) {
      results = results.filter(property => {
        const address = (property.fullAddress || '').toLowerCase();
        return address.includes(filters.city.toLowerCase());
      });
      console.log(`After city filter: ${results.length}`);
    }

    // Filter by BHK
    if (filters.bhk) {
      results = results.filter(property => {
        return property.bhk === filters.bhk;
      });
      console.log(`After BHK filter: ${results.length}`);
    }

    // Filter by MAXIMUM budget
    if (filters.maxBudget) {
      results = results.filter(property => {
        const price = parseFloat(property.price);
        return !isNaN(price) && price <= filters.maxBudget;
      });
      console.log(`After max budget filter: ${results.length}`);
    }

    // Filter by MINIMUM budget
    if (filters.minBudget) {
      results = results.filter(property => {
        const price = parseFloat(property.price);
        return !isNaN(price) && price >= filters.minBudget;
      });
      console.log(`After min budget filter: ${results.length}`);
    }

    // Filter by MINIMUM carpet area
    if (filters.minArea) {
      results = results.filter(property => {
        const area = parseFloat(property.carpetArea);
        return !isNaN(area) && area >= filters.minArea;
      });
      console.log(`After min area filter: ${results.length}`);
    }

    // Filter by MAXIMUM carpet area
    if (filters.maxArea) {
      results = results.filter(property => {
        const area = parseFloat(property.carpetArea);
        return !isNaN(area) && area <= filters.maxArea;
      });
      console.log(`After max area filter: ${results.length}`);
    }

    // Filter by status
    if (filters.status) {
      results = results.filter(property => {
        return property.status === filters.status;
      });
      console.log(`After status filter: ${results.length}`);
    }

    // Filter by locality
    if (filters.locality) {
      results = results.filter(property => {
        const address = (property.fullAddress || '').toLowerCase();
        const landmark = (property.landmark || '').toLowerCase();
        return address.includes(filters.locality.toLowerCase()) ||
               landmark.includes(filters.locality.toLowerCase());
      });
      console.log(`After locality filter: ${results.length}`);
    }

    // Filter by "near metro" requirement
    if (filters.nearMetro) {
      results = results.filter(property => {
        const address = (property.fullAddress || '').toLowerCase();
        const landmark = (property.landmark || '').toLowerCase();
        // Check if address/landmark mentions metro
        return address.includes('metro') || landmark.includes('metro');
      });
      console.log(`After near metro filter: ${results.length}`);
    }

    // Filter by amenities
    if (filters.amenities && filters.amenities.length > 0) {
      results = results.filter(property => {
        const propertyAmenities = (property.amenities || []).map(a => a.toLowerCase());
        // Check if property has at least one of the requested amenities
        return filters.amenities.some(amenity => 
          propertyAmenities.some(pa => pa.includes(amenity))
        );
      });
      console.log(`After amenities filter: ${results.length}`);
    }

    // Filter by project name
    if (filters.projectName) {
      results = results.filter(property => {
        const projectName = (property.projectName || '').toLowerCase();
        return projectName.includes(filters.projectName.toLowerCase());
      });
      console.log(`After project name filter: ${results.length}`);
    }

    console.log('Final results:', results.length);
    console.log('========================\n');

    // Sort by price (ascending)
    results.sort((a, b) => {
      const priceA = parseFloat(a.price) || 0;
      const priceB = parseFloat(b.price) || 0;
      return priceA - priceB;
    });

    // Format properties for response
    return results.map(formatProperty);

  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

/**
 * Format property data for frontend
 */
function formatProperty(property) {
  const price = parseFloat(property.price) || 0;
  const carpetArea = parseFloat(property.carpetArea) || 0;

  return {
    id: property.id,
    title: property.projectName || 'Unnamed Project',
    city: extractCity(property.fullAddress),
    locality: property.landmark || extractLocality(property.fullAddress),
    bhk: property.bhk || 'N/A',
    price: formatPrice(price),
    priceValue: price,
    carpetArea: carpetArea ? `${carpetArea} sq ft` : 'N/A',
    carpetAreaValue: carpetArea,
    status: formatStatus(property.status),
    amenities: extractAmenities(property),
    bathrooms: property.bathrooms || 'N/A',
    balcony: property.balcony || '0',
    furnishedType: property.furnishedType || 'UNFURNISHED',
    slug: property.slug || '',
    address: property.fullAddress || 'Address not available',
    image: extractFirstImage(property.propertyImages) || property.floorPlanImage || null
  };
}

function extractCity(address) {
  if (!address) return 'N/A';
  if (address.toLowerCase().includes('mumbai')) return 'Mumbai';
  if (address.toLowerCase().includes('pune')) return 'Pune';
  return 'N/A';
}

function extractLocality(address) {
  if (!address) return '';
  const parts = address.split(',');
  return parts[0]?.trim() || '';
}

function formatPrice(price) {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  } else {
    return `₹${price.toLocaleString('en-IN')}`;
  }
}

function formatStatus(status) {
  if (status === 'READY_TO_MOVE') return 'Ready to Move';
  if (status === 'UNDER_CONSTRUCTION') return 'Under Construction';
  return status || 'N/A';
}

function extractAmenities(property) {
  const amenities = [];
  
  if (property.lift === 'true' || property.lift === true) {
    amenities.push('Lift');
  }
  if (property.parkingType) {
    amenities.push('Parking');
  }
  if (property.balcony && parseInt(property.balcony) > 0) {
    amenities.push('Balcony');
  }
  
  if (property.furnishedType === 'FURNISHED' || property.furnishedType === 'SEMI_FURNISHED') {
    amenities.push('Furnished');
  }
  
  return amenities.slice(0, 3);
}

function extractFirstImage(images) {
  if (!images) return null;
  
  try {
    if (typeof images === 'string') {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed[0] : null;
    }
    return Array.isArray(images) ? images[0] : null;
  } catch {
    return null;
  }
}

module.exports = {
  searchProperties
};
