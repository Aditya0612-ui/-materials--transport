// src/context/TransportContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import FirebaseService from '../services/firebaseService';

const TransportContext = createContext();

export const useTransportContext = () => {
  const context = useContext(TransportContext);
  if (!context) {
    throw new Error('useTransportContext must be used within a TransportProvider');
  }
  return context;
};

export const TransportProvider = ({ children }) => {
  // State management
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Firebase subscriptions
  useEffect(() => {
    const unsubscribers = [];

    // Subscribe to transport system (vehicles)
    const unsubscribeTransport = FirebaseService.subscribeToTransportSystem((transports) => {
      // Convert and clean data
      const cleanVehicles = transports.map(transport => ({
        ...transport,
        id: transport.vehicleNumber || transport.id,
        firebaseId: transport.firebaseKey || transport.id
      }));
      
      // Remove duplicates
      const uniqueVehicles = cleanVehicles.reduce((acc, vehicle) => {
        const existingIndex = acc.findIndex(existing => 
          existing.vehicleNumber === vehicle.vehicleNumber || existing.id === vehicle.id
        );
        if (existingIndex === -1) {
          acc.push(vehicle);
        } else {
          // Keep the most recent one
          const existing = acc[existingIndex];
          const vehicleTime = new Date(vehicle.updatedAt || vehicle.createdAt || 0);
          const existingTime = new Date(existing.updatedAt || existing.createdAt || 0);
          if (vehicleTime > existingTime) {
            acc[existingIndex] = vehicle;
          }
        }
        return acc;
      }, []);
      
      setVehicles(uniqueVehicles);
    });
    unsubscribers.push(unsubscribeTransport);

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  // CRUD operations for vehicles
  const addVehicle = async (vehicleData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await FirebaseService.addTransport(vehicleData);
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

  const updateVehicle = async (vehicleId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const result = await FirebaseService.updateTransport(vehicleId, updates);
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

  const deleteVehicle = async (vehicleId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('TransportContext: Deleting vehicle with ID:', vehicleId);
      const result = await FirebaseService.deleteTransport(vehicleId);
      console.log('TransportContext: Delete result:', result);
      
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      console.error('TransportContext: Delete error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const getVehiclesByType = (type) => {
    return vehicles.filter(vehicle => vehicle.type === type);
  };

  const getVehicleStats = () => {
    const total = vehicles.length;
    const active = vehicles.filter(v => v.status === 'active').length;
    const maintenance = vehicles.filter(v => v.status === 'maintenance').length;
    const inactive = vehicles.filter(v => v.status === 'inactive').length;
    
    return { total, active, maintenance, inactive };
  };

  const contextValue = {
    // Data
    vehicles,
    loading,
    error,
    
    // CRUD operations
    addVehicle,
    updateVehicle,
    deleteVehicle,
    setError,
    
    // Utility functions
    getVehiclesByType,
    getVehicleStats
  };

  return (
    <TransportContext.Provider value={contextValue}>
      {children}
    </TransportContext.Provider>
  );
};

export default TransportProvider;
