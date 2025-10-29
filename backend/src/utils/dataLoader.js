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

  for (const dataPath of possiblePaths) {
    if (fs.existsSync(dataPath)) {
      const projectCsvPath = path.join(dataPath, 'project.csv');
      if (fs.existsSync(projectCsvPath)) {
        console.log(`✅ FOUND data directory at: ${dataPath}`);
        return dataPath;
      }
    }
  }

  throw new Error('Data directory not found. Please ensure CSV files are deployed.');
}

/**
 * Load CSV file and return data as array
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

    const dataDir = findDataDirectory();
    console.log(`📁 Using data directory: ${dataDir}\n`);

    const files = fs.readdirSync(dataDir);
    console.log('📋 Files in data directory:', files);
    console.log('\n⏳ Loading CSV files...\n');
    
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

    console.log('🔄 Merging data...');
    mergeData();
    console.log(`✅ Merged: ${mergedData.length} total records\n`);

    // Show sample
    if (mergedData.length > 0) {
      console.log('📋 Sample Property:');
      const sample = mergedData[0];
      console.log(`   Name: ${sample.projectName}`);
      console.log(`   BHK: ${sample.bhk}`);
      console.log(`   Price: ₹${(sample.price / 10000000).toFixed(2)} Cr`);
      console.log(`   Location: ${sample.fullAddress}`);
      console.log(`   Carpet Area: ${sample.carpetArea} sq ft`);
      console.log('');
    }

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
    console.error('\n❌ ERROR LOADING CSV DATA:', error.message);
    throw error;
  }
}

/**
 * Merge all data - CORRECTED VERSION based on actual CSV structure
 */
function mergeData() {
  mergedData = configurationsData.map(config => {
    // Find matching project by projectId
    const project = projectsData.find(p => p.id === config.projectId) || {};
    
    // Find matching address by projectId
    const address = addressesData.find(a => a.projectId === config.projectId) || {};
    
    // Find matching variant by configurationId
    const variant = variantsData.find(v => v.configurationId === config.id) || {};

    // Extract BHK correctly
    let bhkValue = 'N/A';
    if (config.bhk) {
      // If bhk field exists, use it
      bhkValue = config.bhk;
    } else if (config.noOfBedRooms) {
      // Or construct from noOfBedRooms
      bhkValue = `${config.noOfBedRooms}BHK`;
    } else if (variant.noOfBedRooms) {
      bhkValue = `${variant.noOfBedRooms}BHK`;
    }

    // Merge all data with correct field mapping
    return {
      // IDs
      id: config.id || '',
      projectId: config.projectId || '',
      
      // Project info
      projectName: project.name || 'Unknown Project',
      slug: project.slug || '',
      
      // Configuration data
      bhk: bhkValue,
      bathrooms: config.noOfBathRooms || variant.noOfBathRooms || '0',
      balcony: config.balconies || variant.balconies || '0',
      furnishedType: config.furnishedType || variant.furnishedType || 'UNFURNISHED',
      carpetArea: parseFloat(config.carpetArea || variant.carpetArea || 0),
      
      // Address data
      fullAddress: address.addressLine1 || address.fullAddress || '',
      landmark: address.landmark || '',
      
      // Variant data
      price: parseFloat(variant.price || 0),
      status: project.status || 'N/A',
      parkingType: variant.parkingType || '',
      propertyImages: variant.images || '',
      floorPlanImage: variant.floorPlanImage || '',
      lift: config.lift || variant.lift || 'false'
    };
  });

  console.log(`   Merged ${mergedData.length} property records with complete data`);
}

/**
 * Get merged data
 */
function getMergedData() {
  if (mergedData.length === 0) {
    console.warn('⚠️ Warning: No merged data available.');
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
