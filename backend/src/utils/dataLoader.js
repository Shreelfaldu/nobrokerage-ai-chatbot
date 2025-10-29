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
  // Try multiple possible paths
  const possiblePaths = [
    path.join(__dirname, '../data'),                    // src/data
    process.env.CSV_PATH,  
    path.join(__dirname, '../../../data'),             // Root level (local dev)
    path.join(__dirname, '../../data'),                // Backend/data                   
    path.join(process.cwd(), 'data'),                  // Current working directory
    path.join(process.cwd(), 'backend/data'),          // backend/data from root
    '/home/site/wwwroot/data',                         // Azure absolute path
    '/home/site/wwwroot/backend/data',                  // Azure backend/data
    '/home/site/wwwroot/src/data'                      // ← ADD THIS TOO
  ].filter(Boolean); // Remove null/undefined values

  console.log('\n===== SEARCHING FOR DATA DIRECTORY =====');
  
  for (const dataPath of possiblePaths) {
    console.log(`Checking: ${dataPath}`);
    
    if (fs.existsSync(dataPath)) {
      // Verify at least one CSV file exists
      const projectCsvPath = path.join(dataPath, 'project.csv');
      if (fs.existsSync(projectCsvPath)) {
        console.log(`✅ FOUND data directory at: ${dataPath}`);
        console.log('=======================================\n');
        return dataPath;
      } else {
        console.log(`⚠️ Directory exists but project.csv not found`);
      }
    }
  }

  console.error('❌ Data directory not found in any location!');
  console.error('Tried paths:', possiblePaths);
  console.error('=======================================\n');
  throw new Error('Data directory not found. Please ensure CSV files are deployed.');
}

/**
 * Load CSV file and return data as array
 */
function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    console.log(`📂 Loading: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      const error = new Error(`File not found: ${filePath}`);
      console.error(`❌ ${error.message}`);
      reject(error);
      return;
    }

    const results = [];
    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log(`✅ Loaded ${results.length} rows from ${path.basename(filePath)}`);
        resolve(results);
      })
      .on('error', (error) => {
        console.error(`❌ Error reading ${path.basename(filePath)}:`, error.message);
        reject(error);
      });
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

    // Find data directory
    const dataDir = findDataDirectory();
    console.log(`📁 Using data directory: ${dataDir}\n`);

    // List all files in directory
    const files = fs.readdirSync(dataDir);
    console.log('📋 Files in data directory:', files);
    console.log('');

    // Load all CSV files in parallel
    console.log('⏳ Loading CSV files...\n');
    
    const [projects, addresses, configurations, variants] = await Promise.all([
      loadCSV(path.join(dataDir, 'project.csv')),
      loadCSV(path.join(dataDir, 'ProjectAddress.csv')),
      loadCSV(path.join(dataDir, 'ProjectConfiguration.csv')),
      loadCSV(path.join(dataDir, 'ProjectConfigurationVariant.csv'))
    ]);

    // Store loaded data
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

    // DEBUG: Show column names
    if (projects.length > 0) {
      console.log('📋 Project CSV Columns:', Object.keys(projects[0]));
      console.log('📋 Sample Project:', projects[0]);
    }
    if (addresses.length > 0) {
      console.log('📋 Address CSV Columns:', Object.keys(addresses[0]));
    }
    if (configurations.length > 0) {
      console.log('📋 Configuration CSV Columns:', Object.keys(configurations[0]));
    }
    if (variants.length > 0) {
      console.log('📋 Variant CSV Columns:', Object.keys(variants[0]));
    }
    console.log('');

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
    console.error('\n╔════════════════════════════════════════╗');
    console.error('║   ERROR LOADING CSV DATA ✗             ║');
    console.error('╚════════════════════════════════════════╝\n');
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('');
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
    
    // Find matching variant (use first variant for this config)
    const variant = variantsData.find(v => v.configurationId === config.id) || {};

    // Debug first record
    if (mergedData.length === 0) {
      console.log('\n🔍 DEBUG: First merged record:');
      console.log('Config ID:', config.id);
      console.log('Project ID:', config.projectId);
      console.log('Project found:', project ? 'YES' : 'NO');
      console.log('Project data:', {
        id: project.id,
        name: project.name,
        allFields: Object.keys(project)
      });
      console.log('Address found:', address ? 'YES' : 'NO');
      console.log('Variant found:', variant ? 'YES' : 'NO');
      console.log('');
    }

    // Merge all data with correct field names
    return {
      // IDs
      id: config.id,
      projectId: config.projectId,
      
      // Configuration data
      bhk: config.bhk || 'N/A',
      bathrooms: config.bathrooms || config.noOfBathRooms || '0',
      balcony: config.balcony || config.balconies || '0',
      furnishedType: config.furnishedType || variant.furnishedType || 'UNFURNISHED',
      carpetArea: parseFloat(config.carpetArea || variant.carpetArea) || 0,
      
      // Project data - try multiple field names
      projectName: project.name || project.projectName || project.title || 'Unknown Project',
      slug: project.slug || project.projectSlug || '',
      status: project.status || variant.status || config.status || 'N/A',
      
      // Address data
      fullAddress: address.fullAddress || address.addressLine1 || address.address || '',
      landmark: address.landmark || address.locality || '',
      
      // Variant data
      price: parseFloat(variant.price || variant.priceValue || config.price) || 0,
      parkingType: variant.parkingType || config.parkingType || '',
      propertyImages: variant.propertyImages || variant.images || '',
      floorPlanImage: variant.floorPlanImage || variant.floorPlan || '',
      lift: variant.lift || config.lift || 'false'
    };
  });

  console.log(`   Merged ${mergedData.length} property records`);
  
  // Show sample of first merged record
  if (mergedData.length > 0) {
    console.log('\n📋 Sample merged record:');
    console.log({
      projectName: mergedData[0].projectName,
      bhk: mergedData[0].bhk,
      price: mergedData[0].price,
      address: mergedData[0].fullAddress
    });
    console.log('');
  }
}


/**
 * Get merged data
 */
function getMergedData() {
  if (mergedData.length === 0) {
    console.warn('⚠️ Warning: No merged data available. Data might not be loaded yet.');
    return [];
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
