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
 * Find data directory - tries multiple paths for Azure compatibility
 */
function findDataDirectory() {
  const possiblePaths = [
    path.join(__dirname, '../data'),
    '/home/site/wwwroot/src/data',
    process.env.CSV_PATH,
    path.join(__dirname, '../../../data'),
    path.join(__dirname, '../../data'),
    path.join(process.cwd(), 'data'),
    path.join(process.cwd(), 'backend/data'),
    '/home/site/wwwroot/data',
    '/home/site/wwwroot/backend/data'
  ].filter(Boolean);

  console.log('\n===== SEARCHING FOR DATA DIRECTORY =====');
  
  for (const dataPath of possiblePaths) {
    console.log(`Checking: ${dataPath}`);
    
    if (fs.existsSync(dataPath)) {
      const projectCsvPath = path.join(dataPath, 'project.csv');
      if (fs.existsSync(projectCsvPath)) {
        console.log(`✅ FOUND data directory at: ${dataPath}`);
        console.log('=======================================\n');
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
    console.log(`📂 Loading: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      reject(new Error(`File not found: ${filePath}`));
      return;
    }

    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log(`✅ Loaded ${results.length} rows from ${path.basename(filePath)}`);
        resolve(results);
      })
      .on('error', reject);
  });
}

/**
 * Load all CSV files
 */
async function loadData() {
  try {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   LOADING CSV DATA FOR NOBROKERAGE     ║');
    console.log('╚════════════════════════════════════════╝\n');

    const dataDir = findDataDirectory();
    console.log(`📁 Using data directory: ${dataDir}\n`);

    const files = fs.readdirSync(dataDir);
    console.log('📋 Files in data directory:', files);
    console.log('');

    console.log('⏳ Loading CSV files...\n');
    
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

    console.log('\n📊 DATA LOADING SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✓ Projects:       ${projects.length} records`);
    console.log(`✓ Addresses:      ${addresses.length} records`);
    console.log(`✓ Configurations: ${configurations.length} records`);
    console.log(`✓ Variants:       ${variants.length} records`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Merge data
    console.log('🔄 Merging data...');
    mergeData();
    console.log(`✅ Merged: ${mergedData.length} total records\n`);

    console.log('╔════════════════════════════════════════╗');
    console.log('║   CSV DATA LOADED SUCCESSFULLY ✓       ║');
    console.log('╚════════════════════════════════════════╝\n');

    return {
      success: true,
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
 * Merge all data - CORRECTED FIELD MAPPINGS
 */
function mergeData() {
  mergedData = configurationsData.map(config => {
    // Find matching project
    const project = projectsData.find(p => p.id === config.projectId) || {};
    
    // Find matching address
    const address = addressesData.find(a => a.projectId === config.projectId) || {};
    
    // Find matching variant
    const variant = variantsData.find(v => v.configurationId === config.id) || {};

    // CORRECTED: Map exact CSV column names
    return {
      // IDs
      id: config.id,
      projectId: config.projectId,
      
      // From ProjectConfiguration.csv - EXACT column names
      bhk: config.bhk || 'N/A',
      bathrooms: config.noOfBathRooms || '0',  // ← FIXED: noOfBathRooms
      balcony: config.balconies || '0',        // ← FIXED: balconies
      furnishedType: config.furnishedType || 'UNFURNISHED',
      carpetArea: parseFloat(config.carpetArea) || 0,
      
      // From project.csv
      projectName: project.name || 'Unknown Project',  // ← name field
      slug: project.slug || '',
      status: project.status || 'N/A',
      
      // From ProjectAddress.csv
      fullAddress: address.fullAddress || address.addressLine1 || '',
      landmark: address.landmark || '',
      
      // From ProjectConfigurationVariant.csv
      price: parseFloat(variant.price) || 0,
      parkingType: variant.parkingType || '',
      propertyImages: variant.images || '',
      floorPlanImage: variant.floorPlanImage || '',
      lift: variant.lift || 'false'
    };
  });

  console.log(`   Merged ${mergedData.length} property records`);
}

/**
 * Get merged data
 */
function getMergedData() {
  if (mergedData.length === 0) {
    console.warn('⚠️ Warning: No merged data available');
    return [];
  }
  return mergedData;
}

function getProjects() {
  return projectsData;
}

function getAddresses() {
  return addressesData;
}

function getConfigurations() {
  return configurationsData;
}

function getVariants() {
  return variantsData;
}

module.exports = {
  loadData,
  getMergedData,
  getProjects,
  getAddresses,
  getConfigurations,
  getVariants
};
