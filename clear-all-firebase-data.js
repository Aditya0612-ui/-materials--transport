// Complete Firebase Data Cleanup Script
// This will clear ALL data from Firebase database

import { database, ref, remove } from './src/config/firebase.js';

async function clearAllFirebaseData() {
  try {
    console.log('🔥 Starting COMPLETE Firebase data cleanup...\n');

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
      'settings'
    ];

    console.log(`🗑️ Clearing ${collections.length} collections from Firebase...\n`);

    for (const collection of collections) {
      try {
        console.log(`🗑️ Clearing ${collection}...`);
        const collectionRef = ref(database, collection);
        await remove(collectionRef);
        console.log(`✅ ${collection} cleared successfully`);
      } catch (error) {
        console.log(`⚠️ ${collection} - ${error.message}`);
      }
    }

    // Clear root level data
    console.log('\n🗑️ Clearing any remaining root level data...');
    try {
      const rootRef = ref(database, '/');
      const snapshot = await get(rootRef);
      if (snapshot.exists()) {
        await remove(rootRef);
        console.log('✅ Root data cleared');
      } else {
        console.log('✅ No root data to clear');
      }
    } catch (error) {
      console.log(`⚠️ Root clear - ${error.message}`);
    }

    console.log('\n🎉 COMPLETE Firebase cleanup finished!');
    console.log('📝 All collections and data have been permanently deleted.');
    console.log('🚀 Your Firebase database is now completely clean and ready for fresh data.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during complete cleanup:', error);
    process.exit(1);
  }
}

// Run the complete cleanup
clearAllFirebaseData();
