// IMMEDIATE VEHICLE DATA CLEAR - Run this in browser console NOW
// This will clear all the vehicle data you see in the screenshots

console.log('🚛 Clearing all vehicle data from Firebase...');

async function clearVehicleDataNow() {
  try {
    const firebaseUrl = 'https://materials--transport-default-rtdb.firebaseio.com';
    
    console.log('🗑️ Clearing vehicle collections...');
    
    // Clear all vehicle-related collections
    const collections = [
      'vehicles',           // Main vehicles collection
      'transportSystem',    // Transport system data
      'transportHistory',   // Transport history
      'trips'              // Trip data
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

    console.log('\n🎉 VEHICLE DATA CLEARED!');
    console.log('✅ All vehicle data deleted');
    console.log('✅ Transport system cleared');
    console.log('✅ No more demo vehicles');
    console.log('🔄 Refreshing page in 2 seconds...');
    
    // Auto-refresh after 2 seconds
    setTimeout(() => {
      console.log('🔄 Auto-refreshing page...');
      window.location.reload();
    }, 2000);

  } catch (error) {
    console.error('❌ Error during vehicle data clear:', error);
  }
}

// Run immediately
clearVehicleDataNow();
