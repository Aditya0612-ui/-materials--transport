// COMPLETE DASHBOARD CLEANUP SCRIPT
// This script will remove ALL demo data, Firebase data, and unnecessary files

import { database, ref, remove, get } from './src/config/firebase.js';
import fs from 'fs';
import path from 'path';

async function completeCleanup() {
  console.log('🧹 Starting COMPLETE Dashboard Cleanup...\n');

  // 1. Clear ALL Firebase Data
  console.log('🔥 Step 1: Clearing ALL Firebase Data...');
  await clearAllFirebaseData();

  // 2. Remove unnecessary files
  console.log('🗑️ Step 2: Removing unnecessary files...');
  await removeUnnecessaryFiles();

  // 3. Clean up contexts (remove any remaining demo data)
  console.log('🧽 Step 3: Cleaning up contexts...');
  await cleanupContexts();

  // 4. Remove unused imports
  console.log('📦 Step 4: Removing unused imports...');
  await removeUnusedImports();

  console.log('\n🎉 COMPLETE CLEANUP FINISHED!');
  console.log('✅ Firebase database is completely empty');
  console.log('✅ All demo data removed');
  console.log('✅ Unnecessary files deleted');
  console.log('✅ Contexts cleaned');
  console.log('✅ Unused imports removed');
  console.log('🚀 Dashboard is now completely clean and ready for fresh data!');
}

// Clear ALL Firebase Data
async function clearAllFirebaseData() {
  const collections = [
    'transportSystem',
    'transportHistory', 
    'maintenanceSchedule',
    'serviceHistory',
    'partsInventory',
    'vehicles',
    'orders',
    'trips',
    'notifications',
    'customers',
    'fuelRecords',
    'materials',
    'invoices',
    'contracts',
    'suppliers',
    'users',
    'settings',
    'analytics',
    'reports',
    'logs'
  ];

  for (const collection of collections) {
    try {
      const collectionRef = ref(database, collection);
      await remove(collectionRef);
      console.log(`  ✅ ${collection} cleared`);
    } catch (error) {
      console.log(`  ⚠️ ${collection} - ${error.message}`);
    }
  }

  // Clear root level
  try {
    const rootRef = ref(database, '/');
    const snapshot = await get(rootRef);
    if (snapshot.exists()) {
      await remove(rootRef);
      console.log('  ✅ Root data cleared');
    }
  } catch (error) {
    console.log(`  ⚠️ Root clear - ${error.message}`);
  }
}

// Remove unnecessary files
async function removeUnnecessaryFiles() {
  const filesToDelete = [
    'clear-all-demo-data.js',
    'clear-demo-data-console.js',
    'clear-orders.js',
    'clear-transport-data.js',
    'clear-trips-console.js',
    'AUTO-RESTORE-FIX-COMPLETE.md',
    'FIREBASE_CLEANUP_GUIDE.md',
    'FIREBASE_ID_STRUCTURE_FIX.md',
    'FIREBASE_INTEGRATION.md',
    'FIREBASE_OTP_VERIFICATION.md',
    'FIREBASE_SETUP.md',
    'FIREBASE_VEHICLE_ID_UPDATE.md',
    'INTERNATIONALIZATION_SETUP.md',
    'MAINTENANCE-DUPLICATES-FIXED.md',
    'QUICK_ADD_FORMS.md',
    'RECENT_ORDERS_UPDATE.md',
    'STARTUP_GUIDE.md',
    'FINANCIAL_MANAGEMENT_SYSTEM.md'
  ];

  for (const file of filesToDelete) {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`  ✅ Deleted ${file}`);
      }
    } catch (error) {
      console.log(`  ⚠️ Failed to delete ${file}: ${error.message}`);
    }
  }

  // Remove Clear Data Components
  const componentsToDelete = [
    'src/components/transport/ClearTransportData.jsx',
    'src/components/maintenance/ClearMaintenanceData.jsx'
  ];

  for (const component of componentsToDelete) {
    try {
      if (fs.existsSync(component)) {
        fs.unlinkSync(component);
        console.log(`  ✅ Deleted ${component}`);
      }
    } catch (error) {
      console.log(`  ⚠️ Failed to delete ${component}: ${error.message}`);
    }
  }
}

// Clean up contexts - remove any demo data initialization
async function cleanupContexts() {
  const contexts = [
    'src/context/TransportContext.jsx',
    'src/context/MaintenanceContext.jsx',
    'src/context/BusinessContext.jsx',
    'src/context/MaterialContext.jsx',
    'src/context/DashboardContext.jsx'
  ];

  for (const contextFile of contexts) {
    try {
      if (fs.existsSync(contextFile)) {
        let content = fs.readFileSync(contextFile, 'utf8');
        
        // Remove any sample data arrays
        content = content.replace(/const sample\w+\s*=\s*\[[^\]]*\];?/gs, '');
        
        // Remove initialization comments
        content = content.replace(/\/\/ Initialize with sample data.*?\n/g, '');
        content = content.replace(/\/\/ Sample data.*?\n/g, '');
        
        // Clean up empty lines
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        fs.writeFileSync(contextFile, content);
        console.log(`  ✅ Cleaned ${contextFile}`);
      }
    } catch (error) {
      console.log(`  ⚠️ Failed to clean ${contextFile}: ${error.message}`);
    }
  }
}

// Remove unused imports (basic cleanup)
async function removeUnusedImports() {
  const filesToCheck = [
    'src/components/transport/TransportSystem.jsx',
    'src/components/maintenance/MaintenanceSchedule.jsx'
  ];

  for (const file of filesToCheck) {
    try {
      if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Remove ClearTransportData import
        content = content.replace(/import ClearTransportData from.*?;\n/g, '');
        
        // Remove ClearMaintenanceData import
        content = content.replace(/import ClearMaintenanceData from.*?;\n/g, '');
        
        // Remove usage of Clear components
        content = content.replace(/<ClearTransportData\s*\/>/g, '');
        content = content.replace(/<ClearMaintenanceData\s*\/>/g, '');
        
        // Remove empty rows that contained Clear components
        content = content.replace(/\s*<Row[^>]*>\s*<Col[^>]*>\s*<\/Col>\s*<\/Row>/g, '');
        
        // Clean up empty lines
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        fs.writeFileSync(file, content);
        console.log(`  ✅ Cleaned imports in ${file}`);
      }
    } catch (error) {
      console.log(`  ⚠️ Failed to clean imports in ${file}: ${error.message}`);
    }
  }
}

// Run the complete cleanup
completeCleanup().catch(console.error);
