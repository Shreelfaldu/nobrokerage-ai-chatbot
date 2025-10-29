const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Storage for loaded data
let projectsData = [];
let addressesData = [];
let configurationsData = [];
let variantsData = [];
let mergedData = [];

/**
 * Load CSV file and return data as array
 */
function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

/**
 * Load all CSV files
 */
async function loadData() {
  try {
    // Determine data directory path (works both locally and on Azure)
    const dataDir = process.env.CSV_PATH || path.join(__dirname, '../../../data');
    
    console.log('Loading CSV files from:', dataDir);

    // Check if data directory exists
    if (!fs.existsSync(dataDir)) {
      throw new Error(`Data directory not found: ${dataDir}`);
    }

    // Load all CSV files in parallel
    const [projects, addresses, configurations, variants] = await Promise.all([
      loadCSV(path.join(dataDir, 'project.csv')),
      loadCSV(path.join(dataDir, 'ProjectAddress.csv')),
      loadCSV(path.join(dataDir, 'ProjectConfiguration.csv')),
      loadCSV(path.join(dataDir, 'ProjectConfigurationVariant.csv'))
    ]);

    projectsData = projects;
    addressesData = addresses;
    configurationsData = configurations;
    variantsData = variants;

    console.log(`Loaded ${projects.length} projects`);
    console.log(`Loaded ${addresses.length} addresses`);
    console.log(`Loaded ${configurations.length} configurations`);
    console.log(`Loaded ${variants.length} variants`);

    // Merge data
    mergeData();

    return {
      projects: projectsData.length,
      addresses: addressesData.length,
      configurations: configurationsData.length,
      variants: variantsData.length,
      merged: mergedData.length
    };

  } catch (error) {
    console.error('Error loading CSV data:', error);
    throw error;
  }
}

/**
 * Merge all data into single dataset
 */
function mergeData() {
  mergedData = configurationsData.map(config => {
    // Find matching project
    const project = projectsData.find(p => p.id === config.projectId) || {};
    
    // Find matching address
    const address = addressesData.find(a => a.projectId === config.projectId) || {};
    
    // Find matching variant
    const variant = variantsData.find(v => v.configurationId === config.id) || {};

    // Merge all data
    return {
      // Configuration data
      id: config.id,
      projectId: config.projectId,
      bhk: config.bhk,
      bathrooms: config.bathrooms,
      balcony: config.balcony,
      furnishedType: config.furnishedType,
      carpetArea: parseFloat(config.carpetArea) || 0,
      
      // Project data
      projectName: project.name || 'Unknown Project',
      slug: project.slug || '',
      
      // Address data
      fullAddress: address.fullAddress || '',
      landmark: address.landmark || '',
      
      // Variant data
      price: parseFloat(variant.price) || 0,
      status: variant.status || 'N/A',
      parkingType: variant.parkingType || '',
      propertyImages: variant.propertyImages || '',
      floorPlanImage: variant.floorPlanImage || '',
      lift: variant.lift || 'false'
    };
  });

  console.log(`Merged data: ${mergedData.length} total records`);
}

/**
 * Get merged data
 */
function getMergedData() {
  if (mergedData.length === 0) {
    throw new Error('Data not loaded. Call loadData() first.');
  }
  return mergedData;
}

/**
 * Get projects data
 */
function getProjects() {
  return projectsData;
}

/**
 * Get addresses data
 */
function getAddresses() {
  return addressesData;
}

/**
 * Get configurations data
 */
function getConfigurations() {
  return configurationsData;
}

/**
 * Get variants data
 */
function getVariants() {
  return variantsData;
}

// IMPORTANT: Export all functions
module.exports = {
  loadData,
  getMergedData,
  getProjects,
  getAddresses,
  getConfigurations,
  getVariants
};
