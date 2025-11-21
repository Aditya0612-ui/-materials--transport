// Utility script to clear all Firebase maintenance data
// Run this in browser console to clear duplicates

import { ref, remove } from 'firebase/database';
import { database } from '../services/firebaseService';

export const clearAllMaintenanceData = async () => {
  try {
    console.log('🗑️ Starting to clear all maintenance data from Firebase...');
    
    // Clear maintenance schedules
    const maintenanceRef = ref(database, 'maintenanceSchedule');
    await remove(maintenanceRef);
    console.log('✅ Cleared maintenance schedules');
    
    // Clear service history
    const serviceRef = ref(database, 'serviceHistory');
    await remove(serviceRef);
    console.log('✅ Cleared service history');
    
    // Clear parts inventory
    const partsRef = ref(database, 'partsInventory');
    await remove(partsRef);
    console.log('✅ Cleared parts inventory');
    
    console.log('🎉 All maintenance data cleared successfully!');
    console.log('💡 Refresh the page to start with clean data');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    return { success: false, error: error.message };
  }
};

// Make it available globally for console access
if (typeof window !== 'undefined') {
  window.clearAllMaintenanceData = clearAllMaintenanceData;
}
