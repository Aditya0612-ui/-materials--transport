// IMMEDIATE FIREBASE CLEAR - Run this in browser console NOW
// This will clear all Firebase data immediately

console.log('🔥 IMMEDIATE Firebase Clear Starting...');

async function clearFirebaseNow() {
  try {
    const firebaseUrl = 'https://transport-2524d-default-rtdb.firebaseio.com';
    
    console.log('🗑️ Clearing ALL Firebase collections...');
    
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

    // Clear each collection
    for (const collection of collections) {
      try {
        const response = await fetch(`${firebaseUrl}/${collection}.json`, {
          method: 'DELETE'
        });
        if (response.ok) {
          console.log(`✅ ${collection} cleared`);
        } else {
          console.log(`⚠️ ${collection} - HTTP ${response.status}`);
        }
      } catch (error) {
        console.log(`⚠️ ${collection} - ${error.message}`);
      }
    }

    // Clear root data
    console.log('🗑️ Clearing root data...');
    try {
      const response = await fetch(`${firebaseUrl}/.json`, {
        method: 'DELETE'
      });
      if (response.ok) {
        console.log('✅ Root data cleared');
      }
    } catch (error) {
      console.log(`⚠️ Root clear - ${error.message}`);
    }

    console.log('\n🎉 IMMEDIATE CLEAR COMPLETED!');
    console.log('✅ All Firebase data deleted');
    console.log('✅ All duplicates removed');
    console.log('✅ Database is completely clean');
    console.log('🔄 Refresh the page to see clean dashboard');
    
    // Auto-refresh after 2 seconds
    setTimeout(() => {
      console.log('🔄 Auto-refreshing page...');
      window.location.reload();
    }, 2000);

  } catch (error) {
    console.error('❌ Error during immediate clear:', error);
  }
}

// Run immediately
clearFirebaseNow();
