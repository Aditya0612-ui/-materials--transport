// src/services/firebaseService.js
import { 
  database, 
  ref, 
  push, 
  set, 
  onValue, 
  off, 
  update, 
  remove,
  get,
  dbHelpers 
} from '../config/firebase';

class FirebaseService {
  // Vehicle operations
  static async addVehicle(vehicleData) {
    try {
      if (!vehicleData.id) {
        return { success: false, error: 'Vehicle ID is required' };
      }
      
      // Use vehicle ID as the document key
      const vehicleRef = ref(database, `vehicles/${vehicleData.id}`);
      await set(vehicleRef, {
        ...vehicleData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true, id: vehicleData.id };
    } catch (error) {
      console.error('Error adding vehicle:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateVehicle(vehicleId, updates) {
    try {
      const vehicleRef = ref(database, `vehicles/${vehicleId}`);
      await update(vehicleRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating vehicle:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteVehicle(vehicleId) {
    try {
      const vehicleRef = ref(database, `vehicles/${vehicleId}`);
      await remove(vehicleRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      return { success: false, error: error.message };
    }
  }


  static subscribeToVehicles(callback) {
    const vehiclesRef = ref(database, 'vehicles');
    const unsubscribe = onValue(vehiclesRef, (snapshot) => {
      const data = snapshot.val();
      const vehicles = data ? Object.values(data) : [];
      callback(vehicles);
    });
    return () => off(vehiclesRef, 'value', unsubscribe);
  }

  // Trip operations
  static async addTrip(tripData) {
    try {
      const tripId = tripData.id || `TRIP-${Date.now()}`;
      const tripRef = ref(database, `trips/${tripId}`);
      await set(tripRef, {
        ...tripData,
        id: tripId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true, id: tripId };
    } catch (error) {
      console.error('Error adding trip:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateTrip(tripId, updates) {
    try {
      const tripRef = ref(database, `trips/${tripId}`);
      await update(tripRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating trip:', error);
      return { success: false, error: error.message };
    }
  }

  static subscribeToTrips(callback) {
    const tripsRef = ref(database, 'trips');
    const unsubscribe = onValue(tripsRef, (snapshot) => {
      const data = snapshot.val();
      const trips = data ? Object.values(data) : [];
      callback(trips);
    });
    return () => off(tripsRef, 'value', unsubscribe);
  }


  // Notification operations
  static async addNotification(notificationData) {
    try {
      const notificationId = notificationData.id || `NOTIF-${Date.now()}`;
      const notificationRef = ref(database, `notifications/${notificationId}`);
      await set(notificationRef, {
        ...notificationData,
        id: notificationId,
        timestamp: new Date().toISOString(),
        read: false
      });
      return { success: true, id: notificationId };
    } catch (error) {
      console.error('Error adding notification:', error);
      return { success: false, error: error.message };
    }
  }

  static subscribeToNotifications(callback) {
    const notificationsRef = ref(database, 'notifications');
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      const notifications = data ? Object.values(data).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : [];
      callback(notifications);
    });
    return () => off(notificationsRef, 'value', unsubscribe);
  }

  // Statistics operations
  static async updateStats(statsData) {
    try {
      const statsRef = ref(database, 'stats');
      await set(statsRef, {
        ...statsData,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating stats:', error);
      return { success: false, error: error.message };
    }
  }

  static subscribeToStats(callback) {
    const statsRef = ref(database, 'stats');
    const unsubscribe = onValue(statsRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || {});
    });
    return () => off(statsRef, 'value', unsubscribe);
  }

  // Customer operations
  static async addCustomer(customerData) {
    try {
      const customerId = customerData.id || `CUST-${Date.now()}`;
      const customerRef = ref(database, `customers/${customerId}`);
      await set(customerRef, {
        ...customerData,
        id: customerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true, id: customerId };
    } catch (error) {
      console.error('Error adding customer:', error);
      return { success: false, error: error.message };
    }
  }

  static subscribeToCustomers(callback) {
    const customersRef = ref(database, 'customers');
    const unsubscribe = onValue(customersRef, (snapshot) => {
      const data = snapshot.val();
      const customers = data ? Object.values(data) : [];
      callback(customers);
    });
    return () => off(customersRef, 'value', unsubscribe);
  }

  // Fuel records operations
  static async addFuelRecord(fuelData) {
    try {
      const fuelId = fuelData.id || `FUEL-${Date.now()}`;
      const fuelRef = ref(database, `fuelRecords/${fuelId}`);
      await set(fuelRef, {
        ...fuelData,
        id: fuelId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true, id: fuelId };
    } catch (error) {
      console.error('Error adding fuel record:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateFuelRecord(recordId, updates) {
    try {
      const fuelRef = ref(database, `fuelRecords/${recordId}`);
      await update(fuelRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating fuel record:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteFuelRecord(recordId) {
    try {
      const fuelRef = ref(database, `fuelRecords/${recordId}`);
      await remove(fuelRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting fuel record:', error);
      return { success: false, error: error.message };
    }
  }

  static subscribeToFuelRecords(callback) {
    const fuelRef = ref(database, 'fuelRecords');
    const unsubscribe = onValue(fuelRef, (snapshot) => {
      const data = snapshot.val();
      const fuelRecords = data ? Object.values(data) : [];
      callback(fuelRecords);
    });
    return () => off(fuelRef, 'value', unsubscribe);
  }

  // Fuel Purchase operations
  static async addFuelPurchase(purchaseData) {
    try {
      const purchaseId = purchaseData.id || `FP-${Date.now()}`;
      const purchaseRef = ref(database, `fuelPurchases/${purchaseId}`);
      await set(purchaseRef, {
        ...purchaseData,
        id: purchaseId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true, id: purchaseId };
    } catch (error) {
      console.error('Error adding fuel purchase:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateFuelPurchase(purchaseId, updates) {
    try {
      const purchaseRef = ref(database, `fuelPurchases/${purchaseId}`);
      await update(purchaseRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating fuel purchase:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteFuelPurchase(purchaseId) {
    try {
      const purchaseRef = ref(database, `fuelPurchases/${purchaseId}`);
      await remove(purchaseRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting fuel purchase:', error);
      return { success: false, error: error.message };
    }
  }

  static subscribeToFuelPurchases(callback) {
    const purchasesRef = ref(database, 'fuelPurchases');
    const unsubscribe = onValue(purchasesRef, (snapshot) => {
      const data = snapshot.val();
      const purchases = data ? Object.values(data) : [];
      callback(purchases);
    });
    return () => off(purchasesRef, 'value', unsubscribe);
  }

  // Maintenance Schedule operations
  static async addMaintenanceSchedule(scheduleData) {
    try {
      const scheduleId = scheduleData.id || `MS${Date.now().toString().slice(-6)}`;
      const scheduleRef = ref(database, `maintenanceSchedule/${scheduleId}`);
      await set(scheduleRef, {
        ...scheduleData,
        id: scheduleId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true, id: scheduleId };
    } catch (error) {
      console.error('Error adding maintenance schedule:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateMaintenanceSchedule(scheduleId, updates) {
    try {
      const scheduleRef = ref(database, `maintenanceSchedule/${scheduleId}`);
      await update(scheduleRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating maintenance schedule:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteMaintenanceSchedule(scheduleId) {
    try {
      const scheduleRef = ref(database, `maintenanceSchedule/${scheduleId}`);
      await remove(scheduleRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting maintenance schedule:', error);
      return { success: false, error: error.message };
    }
  }

  static subscribeToMaintenanceSchedule(callback) {
    const maintenanceRef = ref(database, 'maintenanceSchedule');
    const unsubscribe = onValue(maintenanceRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const schedules = data ? Object.entries(data).map(([firebaseKey, schedule]) => ({
          ...schedule,
          firebaseKey: firebaseKey,
          id: schedule.id || firebaseKey
        })) : [];
        callback(schedules);
      } catch (error) {
        console.error('Error processing maintenance schedule data:', error);
        callback([]);
      }
    }, (error) => {
      console.error('Error subscribing to maintenance schedule:', error);
      callback([]);
    });
    return () => off(maintenanceRef, 'value', unsubscribe);
  }


  // Service History operations
  static async addServiceHistory(serviceData) {
    try {
      const serviceId = serviceData.id || `SH${Date.now().toString().slice(-6)}`;
      const serviceRef = ref(database, `serviceHistory/${serviceId}`);
      await set(serviceRef, {
        ...serviceData,
        id: serviceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true, id: serviceId };
    } catch (error) {
      console.error('Error adding service history:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateServiceHistory(serviceId, updates) {
    try {
      const serviceRef = ref(database, `serviceHistory/${serviceId}`);
      await update(serviceRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating service history:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteServiceHistory(serviceId) {
    try {
      const serviceRef = ref(database, `serviceHistory/${serviceId}`);
      await remove(serviceRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting service history:', error);
      return { success: false, error: error.message };
    }
  }


  static subscribeToServiceHistory(callback) {
    const serviceRef = ref(database, 'serviceHistory');
    const unsubscribe = onValue(serviceRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const services = data ? Object.entries(data).map(([firebaseKey, service]) => ({
          ...service,
          firebaseKey: firebaseKey,
          id: service.id || firebaseKey
        })) : [];
        callback(services);
      } catch (error) {
        console.error('Error processing service history data:', error);
        callback([]);
      }
    }, (error) => {
      console.error('Error subscribing to service history:', error);
      callback([]);
    });
    return () => off(serviceRef, 'value', unsubscribe);
  }

  // Parts Inventory operations
  static async addPart(partData) {
    try {
      const partId = partData.id || `PI${Date.now().toString().slice(-6)}`;
      const partRef = ref(database, `partsInventory/${partId}`);
      await set(partRef, {
        ...partData,
        id: partId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true, id: partId };
    } catch (error) {
      console.error('Error adding part:', error);
      return { success: false, error: error.message };
    }
  }

  static async updatePart(partId, updates) {
    try {
      const partRef = ref(database, `partsInventory/${partId}`);
      await update(partRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating part:', error);
      return { success: false, error: error.message };
    }
  }

  static async deletePart(partId) {
    try {
      const partRef = ref(database, `partsInventory/${partId}`);
      await remove(partRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting part:', error);
      return { success: false, error: error.message };
    }
  }

  static subscribeToPartsInventory(callback) {
    const partsRef = ref(database, 'partsInventory');
    const unsubscribe = onValue(partsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const parts = data ? Object.entries(data).map(([firebaseKey, part]) => ({
          ...part,
          firebaseKey: firebaseKey,
          id: part.id || firebaseKey
        })) : [];
        callback(parts);
      } catch (error) {
        console.error('Error processing parts inventory data:', error);
        callback([]);
      }
    }, (error) => {
      console.error('Error subscribing to parts inventory:', error);
      callback([]);
    });
    return () => off(partsRef, 'value', unsubscribe);
  }


  // Transport System operations
  static async addTransport(transportData) {
    try {
      const transportId = transportData.id || `TRANS-${Date.now()}`;
      const transportRef = ref(database, `transportSystem/${transportId}`);
      await set(transportRef, {
        ...transportData,
        id: transportId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true, id: transportId };
    } catch (error) {
      console.error('Error adding transport:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateTransport(transportId, updates) {
    try {
      const transportRef = ref(database, `transportSystem/${transportId}`);
      await update(transportRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating transport:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteTransport(transportId) {
    try {
      console.log('FirebaseService: Deleting transport with ID:', transportId);
      const transportRef = ref(database, `transportSystem/${transportId}`);
      console.log('FirebaseService: Reference path:', `transportSystem/${transportId}`);
      
      await remove(transportRef);
      console.log('FirebaseService: Transport deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('FirebaseService: Error deleting transport:', error);
      return { success: false, error: error.message };
    }
  }


  static subscribeToTransportSystem(callback) {
    const transportRef = ref(database, 'transportSystem');
    const unsubscribe = onValue(transportRef, (snapshot) => {
      const data = snapshot.val();
      const transports = data ? Object.entries(data).map(([firebaseKey, transport]) => ({
        ...transport,
        firebaseKey: firebaseKey
      })) : [];
      callback(transports);
    });
    return () => off(transportRef, 'value', unsubscribe);
  }

  // Transport History operations
  static async addTransportHistory(historyData) {
    try {
      const historyId = historyData.id || `TH${Date.now().toString().slice(-6)}`;
      const historyRef = ref(database, `transportHistory/${historyId}`);
      await set(historyRef, {
        ...historyData,
        id: historyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true, id: historyId };
    } catch (error) {
      console.error('Error adding transport history:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateTransportHistory(historyId, updates) {
    try {
      const historyRef = ref(database, `transportHistory/${historyId}`);
      await update(historyRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating transport history:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteTransportHistory(historyId) {
    try {
      const historyRef = ref(database, `transportHistory/${historyId}`);
      await remove(historyRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting transport history:', error);
      return { success: false, error: error.message };
    }
  }



  static subscribeToTransportHistory(callback) {
    const historyRef = ref(database, 'transportHistory');
    const unsubscribe = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      const history = data ? Object.entries(data).map(([key, value]) => ({
        ...value,
        id: value.id || key,
        firebaseKey: key
      })) : [];
      callback(history);
    });
    return () => off(historyRef, 'value', unsubscribe);
  }

  // Business Operations - Customer Management
  static async updateCustomer(customerId, updates) {
    try {
      const customerRef = ref(database, `customers/${customerId}`);
      await update(customerRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating customer:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteCustomer(customerId) {
    try {
      const customerRef = ref(database, `customers/${customerId}`);
      await remove(customerRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting customer:', error);
      return { success: false, error: error.message };
    }
  }

  // Invoice Management operations
  static async addInvoice(invoiceData) {
    try {
      const invoiceId = invoiceData.id || `INV-${Date.now()}`;
      const invoiceRef = ref(database, `invoices/${invoiceId}`);
      await set(invoiceRef, {
        ...invoiceData,
        id: invoiceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true, id: invoiceId };
    } catch (error) {
      console.error('Error adding invoice:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateInvoice(invoiceId, updates) {
    try {
      const invoiceRef = ref(database, `invoices/${invoiceId}`);
      await update(invoiceRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating invoice:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteInvoice(invoiceId) {
    try {
      const invoiceRef = ref(database, `invoices/${invoiceId}`);
      await remove(invoiceRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return { success: false, error: error.message };
    }
  }

  static subscribeToInvoices(callback) {
    const invoicesRef = ref(database, 'invoices');
    const unsubscribe = onValue(invoicesRef, (snapshot) => {
      const data = snapshot.val();
      const invoices = data ? Object.values(data) : [];
      callback(invoices);
    });
    return () => off(invoicesRef, 'value', unsubscribe);
  }

  // Contract Management operations
  static async addContract(contractData) {
    try {
      const contractId = contractData.id || `CON-${Date.now()}`;
      const contractRef = ref(database, `contracts/${contractId}`);
      await set(contractRef, {
        ...contractData,
        id: contractId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true, id: contractId };
    } catch (error) {
      console.error('Error adding contract:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateContract(contractId, updates) {
    try {
      const contractRef = ref(database, `contracts/${contractId}`);
      await update(contractRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating contract:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteContract(contractId) {
    try {
      const contractRef = ref(database, `contracts/${contractId}`);
      await remove(contractRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting contract:', error);
      return { success: false, error: error.message };
    }
  }

  static subscribeToContracts(callback) {
    const contractsRef = ref(database, 'contracts');
    const unsubscribe = onValue(contractsRef, (snapshot) => {
      const data = snapshot.val();
      const contracts = data ? Object.values(data) : [];
      callback(contracts);
    });
    return () => off(contractsRef, 'value', unsubscribe);
  }

  // Live Vehicle Tracking operations
  static async updateVehicleLocation(vehicleId, locationData) {
    try {
      const locationRef = ref(database, `vehicleLocations/${vehicleId}`);
      await set(locationRef, {
        ...locationData,
        vehicleId,
        timestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating vehicle location:', error);
      return { success: false, error: error.message };
    }
  }

  static subscribeToVehicleLocations(callback) {
    const locationsRef = ref(database, 'vehicleLocations');
    const unsubscribe = onValue(locationsRef, (snapshot) => {
      const data = snapshot.val();
      const locations = data ? Object.values(data) : [];
      callback(locations);
    });
    return () => off(locationsRef, 'value', unsubscribe);
  }

  // Generic helper methods using the enhanced dbHelpers
  static async createRecord(collection, data) {
    return await dbHelpers.create(collection, data);
  }

  static async readRecord(path) {
    return await dbHelpers.read(path);
  }

  static async updateRecord(path, updates) {
    return await dbHelpers.update(path, updates);
  }

  static async deleteRecord(path) {
    return await dbHelpers.delete(path);
  }

  static subscribeToCollection(collection, callback) {
    return dbHelpers.subscribe(collection, callback);
  }

  // Batch operations for better performance
  static async batchUpdate(updates) {
    try {
      const promises = Object.keys(updates).map(path => 
        update(ref(database, path), updates[path])
      );
      await Promise.all(promises);
      return { success: true };
    } catch (error) {
      console.error('Error in batch update:', error);
      return { success: false, error: error.message };
    }
  }

  // No sample data initialization - clean start

  // Verification operations
  static async addVerificationLog(verificationData) {
    try {
      const verificationId = verificationData.id || `VERIFY-${Date.now()}`;
      const verificationRef = ref(database, `verifications/${verificationId}`);
      await set(verificationRef, {
        ...verificationData,
        id: verificationId,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      return { success: true, id: verificationId };
    } catch (error) {
      console.error('Error adding verification log:', error);
      return { success: false, error: error.message };
    }
  }

  static async getOTPAttempts(phoneNumber) {
    try {
      const attemptsRef = ref(database, `settings/otpAttempts/${phoneNumber.replace(/[^0-9]/g, '')}`);
      const snapshot = await get(attemptsRef);
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      } else {
        return { success: true, data: { count: 0, lastAttempt: null } };
      }
    } catch (error) {
      console.error('Error getting OTP attempts:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateOTPAttempts(phoneNumber, attemptData) {
    try {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      const attemptsRef = ref(database, `settings/otpAttempts/${cleanPhone}`);
      await set(attemptsRef, {
        ...attemptData,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating OTP attempts:', error);
      return { success: false, error: error.message };
    }
  }

  static async checkRateLimit(phoneNumber) {
    try {
      const result = await this.getOTPAttempts(phoneNumber);
      if (!result.success) return result;

      const { count, lastAttempt } = result.data;
      const now = Date.now();
      const lastAttemptTime = lastAttempt ? new Date(lastAttempt).getTime() : 0;
      const timeDiff = now - lastAttemptTime;
      
      // Rate limiting rules
      const RATE_LIMITS = {
        MAX_ATTEMPTS_PER_HOUR: 5,
        MAX_ATTEMPTS_PER_DAY: 10,
        COOLDOWN_MINUTES: 1
      };

      // Check cooldown period (1 minute between attempts)
      if (timeDiff < RATE_LIMITS.COOLDOWN_MINUTES * 60 * 1000) {
        const remainingTime = Math.ceil((RATE_LIMITS.COOLDOWN_MINUTES * 60 * 1000 - timeDiff) / 1000);
        return { 
          success: false, 
          error: `Please wait ${remainingTime} seconds before requesting another OTP`,
          rateLimited: true,
          remainingTime
        };
      }

      // Check hourly limit
      const oneHourAgo = now - (60 * 60 * 1000);
      if (lastAttemptTime > oneHourAgo && count >= RATE_LIMITS.MAX_ATTEMPTS_PER_HOUR) {
        return { 
          success: false, 
          error: 'Too many OTP requests. Please try again after 1 hour.',
          rateLimited: true
        };
      }

      return { success: true, canProceed: true };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return { success: false, error: error.message };
    }
  }
}

export default FirebaseService;
