const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

let projectsData = [];
let addressesData = [];
let configurationsData = [];
let variantsData = [];
let mergedData = [];

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
        console.log(`✅ Found data directory: ${dataPath}`);
        return dataPath;
      }
    }
  }
  throw new Error('Data directory not found');
}

function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
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

async function loadData() {
  try {
    console.log('\n═══════════════════════════════════');
    console.log('   LOADING NOBROKERAGE CSV DATA');
    console.log('═══════════════════════════════════\n');

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

    console.log(`\n📊 Loaded: ${projects.length} projects, ${configurations.length} configs, ${variants.length} variants\n`);

    // DEBUG: Show first record structure
    if (projects.length > 0) {
      console.log('🔍 Sample Project:', projects[0]);
    }
    if (configurations.length > 0) {
      console.log('🔍 Sample Config:', configurations[0]);
    }
    if (variants.length > 0) {
      console.log('🔍 Sample Variant:', variants[0]);
    }
    console.log('');

    mergeData();
    
    console.log('═══════════════════════════════════');
    console.log(`✅ SUCCESSFULLY MERGED ${mergedData.length} PROPERTIES`);
    console.log('═══════════════════════════════════\n');

    return {
      success: true,
      projects: projects.length,
      addresses: addresses.length,
      configurations: configurations.length,
      variants: variants.length,
      merged: mergedData.length
    };

  } catch (error) {
    console.error('❌ ERROR loading CSV:', error.message);
    throw error;
  }
}

function mergeData() {
  console.log('🔄 Merging data...\n');
  
  mergedData = configurationsData.map((config, index) => {
    // Find matching project by projectId
    const project = projectsData.find(p => p.id === config.projectId);
    
    // Find matching address by projectId
    const address = addressesData.find(a => a.projectId === config.projectId);
    
    // Find matching variant by configurationId
    const variant = variantsData.find(v => v.configurationId === config.id);

    // Debug first 3 records
    if (index < 3) {
      console.log(`Record ${index + 1}:`);
      console.log(`  Config ID: ${config.id}, Project ID: ${config.projectId}`);
      console.log(`  Project found: ${project ? 'YES (' + project.name + ')' : 'NO'}`);
      console.log(`  Address found: ${address ? 'YES' : 'NO'}`);
      console.log(`  Variant found: ${variant ? 'YES (₹' + variant.price + ')' : 'NO'}`);
      console.log(`  BHK: ${config.bhk}, Bathrooms: ${config.noOfBathRooms}, Balconies: ${config.balconies}`);
      console.log('');
    }

    // Build merged record with EXACT field names from CSV
    const merged = {
      // IDs
      id: config.id || '',
      projectId: config.projectId || '',
      
      // From ProjectConfiguration.csv
      bhk: config.bhk || 'N/A',
      bathrooms: config.noOfBathRooms || '0',
      balcony: config.balconies || '0',
      furnishedType: config.furnishedType || 'UNFURNISHED',
      carpetArea: parseFloat(config.carpetArea) || 0,
      
      // From project.csv
      projectName: project ? (project.name || 'Unknown Project') : 'Unknown Project',
      slug: project ? (project.slug || '') : '',
      status: project ? (project.status || 'N/A') : 'N/A',
      
      // From ProjectAddress.csv
      fullAddress: address ? (address.fullAddress || address.addressLine1 || '') : '',
      landmark: address ? (address.landmark || '') : '',
      
      // From ProjectConfigurationVariant.csv
      price: variant ? (parseFloat(variant.price) || 0) : 0,
      parkingType: variant ? (variant.parkingType || '') : '',
      propertyImages: variant ? (variant.images || variant.propertyImages || '') : '',
      floorPlanImage: variant ? (variant.floorPlanImage || '') : '',
      lift: variant ? (variant.lift || 'false') : 'false'
    };

    return merged;
  });

  // Show sample merged record
  if (mergedData.length > 0) {
    console.log('📋 Sample Merged Property:');
    console.log({
      projectName: mergedData[0].projectName,
      bhk: mergedData[0].bhk,
      bathrooms: mergedData[0].bathrooms,
      balcony: mergedData[0].balcony,
      carpetArea: mergedData[0].carpetArea,
      price: mergedData[0].price,
      address: mergedData[0].fullAddress
    });
    console.log('');
  }
  
  console.log(`✓ Merged ${mergedData.length} properties\n`);
}

function getMergedData() {
  if (mergedData.length === 0) {
    console.warn('⚠️ No merged data available');
    return [];
  }
  return mergedData;
}

function getProjects() { return projectsData; }
function getAddresses() { return addressesData; }
function getConfigurations() { return configurationsData; }
function getVariants() { return variantsData; }

module.exports = {
  loadData,
  getMergedData,
  getProjects,
  getAddresses,
  getConfigurations,
  getVariants
};
