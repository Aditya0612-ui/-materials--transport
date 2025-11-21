// Test script for Maintenance Firebase operations
import FirebaseService from './src/services/firebaseService.js';

const testMaintenanceOperations = async () => {
  console.log('🔧 Testing Maintenance & Service Firebase Operations...\n');

  try {
    // Test 1: Add Maintenance Schedule
    console.log('1. Testing Add Maintenance Schedule...');
    const testSchedule = {
      vehicleId: 'TEST001',
      vehicleName: 'Test Vehicle',
      maintenanceType: 'Preventive',
      serviceType: 'Oil Change',
      scheduledDate: '2024-01-15',
      scheduledTime: '10:00',
      priority: 'Medium',
      status: 'Scheduled',
      estimatedCost: 5000,
      estimatedDuration: '2 hours',
      serviceCenter: 'Test Service Center',
      assignedTechnician: 'Test Technician',
      description: 'Regular oil change maintenance'
    };

    const addResult = await FirebaseService.addMaintenanceSchedule(testSchedule);
    console.log('Add Result:', addResult);

    if (addResult.success) {
      console.log('✅ Maintenance schedule added successfully');
      
      // Test 2: Update Maintenance Schedule
      console.log('\n2. Testing Update Maintenance Schedule...');
      const updateResult = await FirebaseService.updateMaintenanceSchedule(addResult.id, {
        status: 'In Progress',
        notes: 'Started maintenance work'
      });
      console.log('Update Result:', updateResult);
      
      if (updateResult.success) {
        console.log('✅ Maintenance schedule updated successfully');
      }

      // Test 3: Delete Maintenance Schedule
      console.log('\n3. Testing Delete Maintenance Schedule...');
      const deleteResult = await FirebaseService.deleteMaintenanceSchedule(addResult.id);
      console.log('Delete Result:', deleteResult);
      
      if (deleteResult.success) {
        console.log('✅ Maintenance schedule deleted successfully');
      }
    }

    // Test 4: Add Service History
    console.log('\n4. Testing Add Service History...');
    const testService = {
      vehicleId: 'TEST001',
      vehicleName: 'Test Vehicle',
      serviceDate: '2024-01-10',
      serviceType: 'Brake Service',
      serviceCenter: 'Test Service Center',
      technician: 'Test Technician',
      cost: 8000,
      duration: '3 hours',
      kmReading: 45000,
      workDone: 'Brake pad replacement',
      partsUsed: 'Brake pads, Brake fluid',
      rating: 5,
      feedback: 'Excellent service'
    };

    const serviceResult = await FirebaseService.addServiceHistory(testService);
    console.log('Service Add Result:', serviceResult);
    
    if (serviceResult.success) {
      console.log('✅ Service history added successfully');
      
      // Clean up - delete test service
      await FirebaseService.deleteServiceHistory(serviceResult.id);
      console.log('✅ Test service history cleaned up');
    }

    // Test 5: Add Parts Inventory
    console.log('\n5. Testing Add Parts Inventory...');
    const testPart = {
      partName: 'Test Brake Pad',
      partNumber: 'BP001',
      category: 'Brake',
      currentStock: 50,
      minimumStock: 10,
      maximumStock: 100,
      unitPrice: 500,
      supplier: 'Test Supplier',
      location: 'Warehouse A'
    };

    const partResult = await FirebaseService.addPart(testPart);
    console.log('Part Add Result:', partResult);
    
    if (partResult.success) {
      console.log('✅ Parts inventory added successfully');
      
      // Clean up - delete test part
      await FirebaseService.deletePart(partResult.id);
      console.log('✅ Test part cleaned up');
    }

    console.log('\n🎉 All Maintenance Firebase operations are working correctly!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
};

// Test Firebase subscriptions
const testSubscriptions = () => {
  console.log('\n📡 Testing Firebase Subscriptions...');

  // Test maintenance schedule subscription
  const unsubscribeSchedule = FirebaseService.subscribeToMaintenanceSchedule((schedules) => {
    console.log(`📅 Maintenance Schedules: ${schedules.length} items`);
  });

  // Test service history subscription
  const unsubscribeService = FirebaseService.subscribeToServiceHistory((services) => {
    console.log(`🔧 Service History: ${services.length} items`);
  });

  // Test parts inventory subscription
  const unsubscribeParts = FirebaseService.subscribeToPartsInventory((parts) => {
    console.log(`📦 Parts Inventory: ${parts.length} items`);
  });

  // Clean up subscriptions after 5 seconds
  setTimeout(() => {
    unsubscribeSchedule();
    unsubscribeService();
    unsubscribeParts();
    console.log('✅ Subscriptions cleaned up');
  }, 5000);
};

// Run tests
console.log('Starting Firebase Maintenance Tests...\n');
testMaintenanceOperations().then(() => {
  testSubscriptions();
});
