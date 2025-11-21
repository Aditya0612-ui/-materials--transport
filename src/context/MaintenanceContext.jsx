// src/context/MaintenanceContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import FirebaseService from '../services/firebaseService';

const MaintenanceContext = createContext();

export const useMaintenanceContext = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenanceContext must be used within a MaintenanceProvider');
  }
  return context;
};

export const MaintenanceProvider = ({ children }) => {
  // Dynamic state from Firebase - no sample data
  const [maintenanceSchedule, setMaintenanceSchedule] = useState([]);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [partsInventory, setPartsInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to remove duplicates from array based on ID
  const removeDuplicates = (array) => {
    const seen = new Set();
    const duplicates = [];
    const unique = array.filter(item => {
      if (seen.has(item.id)) {
        duplicates.push(item.id);
        return false;
      }
      seen.add(item.id);
      return true;
    });
    
    // Only log once if duplicates were found and limit to reasonable number
    if (duplicates.length > 0 && duplicates.length < 100) {
      console.warn(`Found and removed ${duplicates.length} duplicate(s):`, [...new Set(duplicates)]);
    } else if (duplicates.length >= 100) {
      console.warn(`Found and removed ${duplicates.length} duplicates - Firebase needs cleanup!`);
    }
    
    return unique;
  };

  // Firebase subscriptions
  useEffect(() => {
    const unsubscribers = [];
    setLoading(true);

    try {
      // Subscribe to maintenance schedule
      const unsubscribeMaintenanceSchedule = FirebaseService.subscribeToMaintenanceSchedule((schedules) => {
        try {
          const uniqueSchedules = removeDuplicates(schedules || []);
          setMaintenanceSchedule(uniqueSchedules);
          setError(null);
        } catch (err) {
          console.error('Error processing maintenance schedules:', err);
          setError('Failed to load maintenance schedules');
        }
      });
      unsubscribers.push(unsubscribeMaintenanceSchedule);

      // Subscribe to service history
      const unsubscribeServiceHistory = FirebaseService.subscribeToServiceHistory((services) => {
        try {
          const uniqueServices = removeDuplicates(services || []);
          setServiceHistory(uniqueServices);
          setError(null);
        } catch (err) {
          console.error('Error processing service history:', err);
          setError('Failed to load service history');
        }
      });
      unsubscribers.push(unsubscribeServiceHistory);

      // Subscribe to parts inventory
      const unsubscribePartsInventory = FirebaseService.subscribeToPartsInventory((parts) => {
        try {
          const uniqueParts = removeDuplicates(parts || []);
          setPartsInventory(uniqueParts);
          setError(null);
        } catch (err) {
          console.error('Error processing parts inventory:', err);
          setError('Failed to load parts inventory');
        }
      });
      unsubscribers.push(unsubscribePartsInventory);

      // Set loading to false after initial subscriptions are set up
      setTimeout(() => setLoading(false), 1000);

    } catch (err) {
      console.error('Error setting up Firebase subscriptions:', err);
      setError('Failed to connect to database');
      setLoading(false);
    }

    return () => {
      unsubscribers.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (err) {
          console.error('Error unsubscribing:', err);
        }
      });
    };
  }, []);


  // Utility functions
  const getStockStatus = (current, minimum) => {
    const percentage = (current / minimum) * 100;
    if (percentage <= 100) return { status: 'Critical Stock', color: 'danger', priority: 'high' };
    if (percentage <= 150) return { status: 'Low Stock', color: 'warning', priority: 'medium' };
    return { status: 'In Stock', color: 'success', priority: 'low' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Generate unique ID with timestamp to prevent duplicates
  const generateUniqueId = (prefix) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}${timestamp}${random}`;
  };

  const generateMaintenanceId = () => {
    return generateUniqueId('MS');
  };

  const generateServiceId = () => {
    return generateUniqueId('SH');
  };

  const generatePartId = () => {
    return generateUniqueId('PI');
  };

  // CRUD operations for Maintenance Schedule
  const addMaintenanceSchedule = async (scheduleData) => {
    setLoading(true);
    setError(null);
    try {
      const newSchedule = {
        ...scheduleData,
        id: scheduleData.id || generateMaintenanceId(),
        status: scheduleData.status || 'Scheduled'
      };
      const result = await FirebaseService.addMaintenanceSchedule(newSchedule);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateMaintenanceSchedule = async (id, updatedData) => {
    setError(null);
    try {
      const result = await FirebaseService.updateMaintenanceSchedule(id, updatedData);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteMaintenanceSchedule = async (id) => {
    setError(null);
    try {
      const result = await FirebaseService.deleteMaintenanceSchedule(id);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // CRUD operations for Service History
  const addServiceHistory = async (serviceData) => {
    setLoading(true);
    setError(null);
    try {
      const newService = {
        ...serviceData,
        id: serviceData.id || generateServiceId(),
        status: serviceData.status || 'Completed'
      };
      const result = await FirebaseService.addServiceHistory(newService);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateServiceHistory = async (id, updatedData) => {
    setError(null);
    try {
      const result = await FirebaseService.updateServiceHistory(id, updatedData);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteServiceHistory = async (id) => {
    setError(null);
    try {
      const result = await FirebaseService.deleteServiceHistory(id);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteAllServiceHistory = async () => {
    setError(null);
    try {
      // Delete all service history records one by one
      const deletePromises = serviceHistory.map(service => 
        FirebaseService.deleteServiceHistory(service.id)
      );
      
      const results = await Promise.all(deletePromises);
      const failedDeletes = results.filter(result => !result.success);
      
      if (failedDeletes.length > 0) {
        setError(`Failed to delete ${failedDeletes.length} service records`);
        return { success: false, error: `Failed to delete ${failedDeletes.length} service records` };
      }
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // CRUD operations for Parts Inventory
  const addPart = async (partData) => {
    setLoading(true);
    setError(null);
    try {
      const newPart = {
        ...partData,
        id: partData.id || generatePartId(),
        totalValue: partData.currentStock * partData.unitPrice,
        status: getStockStatus(partData.currentStock, partData.minimumStock).status
      };
      const result = await FirebaseService.addPart(newPart);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updatePart = async (id, updatedData) => {
    setError(null);
    try {
      const updatedPart = {
        ...updatedData,
        totalValue: updatedData.currentStock * updatedData.unitPrice,
        status: getStockStatus(updatedData.currentStock, updatedData.minimumStock).status
      };
      const result = await FirebaseService.updatePart(id, updatedPart);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const deletePart = async (id) => {
    setError(null);
    try {
      const result = await FirebaseService.deletePart(id);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Statistics calculation
  const getMaintenanceStats = () => {
    const totalScheduled = maintenanceSchedule.length;
    const inProgress = maintenanceSchedule.filter(item => item.status === 'In Progress').length;
    const completed = maintenanceSchedule.filter(item => item.status === 'Completed').length;
    const pending = maintenanceSchedule.filter(item => item.status === 'Pending' || item.status === 'Scheduled').length;
    const critical = maintenanceSchedule.filter(item => item.priority === 'Critical').length;
    
    const totalCost = maintenanceSchedule.reduce((sum, item) => {
      return sum + (parseFloat(item.estimatedCost) || 0);
    }, 0);

    return {
      totalScheduled,
      inProgress,
      completed,
      pending,
      critical,
      totalCost
    };
  };

  const contextValue = {
    // Data
    maintenanceSchedule,
    serviceHistory,
    partsInventory,
    loading,
    error,
    
    // CRUD operations
    addMaintenanceSchedule,
    updateMaintenanceSchedule,
    deleteMaintenanceSchedule,
    addServiceHistory,
    updateServiceHistory,
    deleteServiceHistory,
    deleteAllServiceHistory,
    addPart,
    updatePart,
    deletePart,
    setError,
    
    // Utility functions
    getStockStatus,
    formatCurrency,
    getMaintenanceStats
  };

  return (
    <MaintenanceContext.Provider value={contextValue}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export default MaintenanceProvider;
