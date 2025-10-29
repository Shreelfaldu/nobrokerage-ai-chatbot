const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

let projectsData = [];
let addressesData = [];
let configurationsData = [];
let variantsData = [];

// Load all CSV files on startup
async function loadAllData() {
  try {
    projectsData = await loadCSV('project.csv');
    addressesData = await loadCSV('ProjectAddress.csv');
    configurationsData = await loadCSV('ProjectConfiguration.csv');
    variantsData = await loadCSV('ProjectConfigurationVariant.csv');
    
    console.log(`Loaded ${projectsData.length} projects`);
    console.log(`Loaded ${addressesData.length} addresses`);
    console.log(`Loaded ${configurationsData.length} configurations`);
    console.log(`Loaded ${variantsData.length} variants`);
  } catch (error) {
    console.error('Error loading CSV data:', error);
    throw error;
  }
}

function loadCSV(filename) {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(__dirname, '../../../data', filename);

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// Merge all data sources
function getMergedData() {
  return projectsData.map(project => {
    const address = addressesData.find(a => a.projectId === project.id) || {};
    const configs = configurationsData.filter(c => c.projectId === project.id);
    
    const variants = configs.map(config => {
      const configVariants = variantsData.filter(v => v.configurationId === config.id);
      return configVariants.map(variant => ({
        ...project,
        ...address,
        bhk: config.type,
        ...variant
      }));
    }).flat();

    return variants.length > 0 ? variants : [{
      ...project,
      ...address,
      configurations: configs
    }];
  }).flat();
}

// Initialize data loading
loadAllData();

module.exports = {
  loadAllData,
  getMergedData,
  projectsData,
  addressesData,
  configurationsData,
  variantsData
};
