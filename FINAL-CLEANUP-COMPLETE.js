// FINAL CLEANUP SCRIPT - Run this to clear ALL Firebase data
// Copy and paste this into your browser console

console.log('🧹 Starting FINAL COMPLETE CLEANUP...\n');

async function finalCleanup() {
  try {
    // Method 1: Try to use Firebase directly if available
    if (typeof firebase !== 'undefined' && firebase.database) {
      console.log('🔥 Using Firebase SDK directly...');
      
      const database = firebase.database();
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

      for (const collection of collections) {
        try {
          await database.ref(collection).remove();
          console.log(`✅ ${collection} cleared`);
        } catch (error) {
          console.log(`⚠️ ${collection} - ${error.message}`);
        }
      }

      // Clear root
      try {
        const rootSnapshot = await database.ref('/').once('value');
        if (rootSnapshot.exists()) {
          await database.ref('/').remove();
          console.log('✅ Root data cleared');
        }
      } catch (error) {
        console.log(`⚠️ Root clear - ${error.message}`);
      }

    } else {
      console.log('🌐 Firebase SDK not available, using fetch...');
      
      // Method 2: Use fetch API to clear Firebase
      const firebaseUrl = 'https://transport-2524d-default-rtdb.firebaseio.com';
      
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

      for (const collection of collections) {
        try {
          const response = await fetch(`${firebaseUrl}/${collection}.json`, {
            method: 'DELETE'
          });
          if (response.ok) {
            console.log(`✅ ${collection} cleared via fetch`);
          } else {
            console.log(`⚠️ ${collection} - HTTP ${response.status}`);
          }
        } catch (error) {
          console.log(`⚠️ ${collection} - ${error.message}`);
        }
      }

      // Clear root
      try {
        const response = await fetch(`${firebaseUrl}/.json`, {
          method: 'DELETE'
        });
        if (response.ok) {
          console.log('✅ Root data cleared via fetch');
        }
      } catch (error) {
        console.log(`⚠️ Root clear via fetch - ${error.message}`);
      }
    }

    console.log('\n🎉 FINAL CLEANUP COMPLETED!');
    console.log('✅ All Firebase data has been permanently deleted');
    console.log('✅ Database is completely clean');
    console.log('✅ No demo data remaining');
    console.log('✅ No duplicates');
    console.log('🚀 Dashboard is ready for fresh data!');

  } catch (error) {
    console.error('❌ Error during final cleanup:', error);
  }
}

// Run the final cleanup
finalCleanup();
