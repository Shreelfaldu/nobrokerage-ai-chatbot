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
 * Find data directory
 */
function findDataDirectory() {
  const possiblePaths = [
    path.join(__dirname, '../data'),                   // HIGHEST PRIORITY
    '/home/site/wwwroot/src/data',
    process.env.CSV_PATH,
    path.join(__dirname, '../../../data'),
    path.join(__dirname, '../../data'),
    path.join(process.cwd(), 'data'),
    path.join(process.cwd(), 'backend/data'),
    '/home/site/wwwroot/data',
    '/home/site/wwwroot/backend/data'
  ].filter(Boolean);

  for (const dataPath of possiblePaths) {
    if (fs.existsSync(dataPath)) {
      const projectCsvPath = path.join(dataPath, 'project.csv');
      if (fs.existsSync(projectCsvPath)) {
        console.log(`✅ Data directory found: ${dataPath}`);
        return dataPath;
      }
    }
  }
  
  throw new Error('Data directory not found');
}

/**
 * Load CSV file
 */
function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log(`✅ Loaded ${results.length} rows from ${path.basename(filePath)}`);
        resolve(results);
      })
      .on('error', (error) => reject(error));
  });
}

/**
 * Load all CSV files
 */
async function loadData() {
  try {
    console.log('\n==========================================');
    console.log('   LOADING NOBROKERAGE CSV DATA');
    console.log('==========================================\n');

    const dataDir = findDataDirectory();
    
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

    console.log(`\nLoaded ${projects.length} projects, ${configurations.length} configurations, ${variants.length} variants`);

    // Merge data
    mergeData();

    console.log(`\n✅ Successfully merged ${mergedData.length} properties`);
    console.log('==========================================\n');

    return {
      success: true,
      projects: projectsData.length,
      addresses: addressesData.length,
      configurations: configurationsData.length,
      variants: variantsData.length,
      merged: mergedData.length
    };

  } catch (error) {
    console.error('❌ Error loading CSV data:', error);
    throw error;
  }
}

/**
 * Merge all data into single dataset
 * EXACT MATCH TO YOUR LOCAL WORKING VERSION
 */
function mergeData() {
  mergedData = configurationsData.map(config => {
    // Find matching project
    const project = projectsData.find(p => p.id === config.projectId) || {};
    
    // Find matching address
    const address = addressesData.find(a => a.projectId === config.projectId) || {};
    
    // Find matching variant
    const variant = variantsData.find(v => v.configurationId === config.id) || {};

    // Merge all data with CORRECT field mapping
    return {
      // Configuration data
      id: config.id,
      projectId: config.projectId,
      bhk: config.type || config.customBHK || 'N/A',  // type column contains BHK
      bathrooms: variant.bathrooms || '0',             // from variant
      balcony: variant.balcony || '0',                 // from variant
      furnishedType: config.furnishedType || variant.furnishedType || 'UNFURNISHED',
      carpetArea: parseFloat(variant.carpetArea || config.carpetArea) || 0,
      
      // Project data
      projectName: project.projectName || project.name || 'Unknown Project',
      slug: project.slug || '',
      
      // Address data
      fullAddress: address.fullAddress || '',
      landmark: address.landmark || '',
      
      // Variant data
      price: parseFloat(variant.price) || 0,
      status: project.status || 'N/A',
      parkingType: variant.parkingType || '',
      propertyImages: variant.propertyImages || '',
      floorPlanImage: variant.floorPlanImage || '',
      lift: variant.lift || 'false'
    };
  });

  console.log(`Merged ${mergedData.length} total records`);
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

// Export all functions
module.exports = {
  loadData,
  getMergedData,
  getProjects,
  getAddresses,
  getConfigurations,
  getVariants
};
