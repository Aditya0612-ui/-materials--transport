// src/context/DashboardContext.jsx
import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import FirebaseService from '../services/firebaseService';

// Initial state - clean start with no sample data
const initialState = {
  // Real-time data - empty arrays for clean start
  vehicles: [],
  trips: [],
  notifications: [],
  stats: {
    totalRevenue: 0,
    totalExpenses: 0,
    activeVehicles: 0,
    completedTrips: 0,
    fuelCost: 0,
    totalDistance: 0,
    avgFuelEfficiency: 0
  },
  settings: {
    refreshInterval: 30000,
    theme: 'light',
    notifications: true,
    autoRefresh: true
  },
  loading: true,
  error: null
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_VEHICLES: 'SET_VEHICLES',
  ADD_VEHICLE: 'ADD_VEHICLE',
  UPDATE_VEHICLE: 'UPDATE_VEHICLE',
  SET_TRIPS: 'SET_TRIPS',
  ADD_TRIP: 'ADD_TRIP',
  UPDATE_TRIP: 'UPDATE_TRIP',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
  UPDATE_STATS: 'UPDATE_STATS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  REFRESH_DATA: 'REFRESH_DATA'
};

// Reducer function
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case actionTypes.SET_VEHICLES:
      return { ...state, vehicles: action.payload };
    
    case actionTypes.ADD_VEHICLE:
      return { ...state, vehicles: [...state.vehicles, action.payload] };
    
    case actionTypes.UPDATE_VEHICLE:
      return {
        ...state,
        vehicles: state.vehicles.map(vehicle =>
          vehicle.id === action.payload.id ? { ...vehicle, ...action.payload } : vehicle
        )
      };
    
    case actionTypes.SET_TRIPS:
      return { ...state, trips: action.payload };
    
    case actionTypes.ADD_TRIP:
      return {
        ...state,
        trips: [action.payload, ...state.trips]
      };
    
    case actionTypes.UPDATE_TRIP:
      return {
        ...state,
        trips: state.trips.map(trip =>
          trip.id === action.payload.id ? { ...trip, ...action.payload } : trip
        )
      };
    
    case actionTypes.SET_NOTIFICATIONS:
      return { ...state, notifications: action.payload };
    
    case actionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications.slice(0, 49)] // Keep only 50 notifications
      };
    
    case actionTypes.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload ? { ...notification, read: true } : notification
        )
      };
    
    case actionTypes.UPDATE_STATS:
      return {
        ...state,
        stats: { ...state.stats, ...action.payload }
      };
    
    case actionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    case actionTypes.REFRESH_DATA:
      // No demo data - refresh from real data sources only
      const updatedStats = {
        ...state.stats
        // Real stats will be calculated from actual data
      };
      
      return {
        ...state,
        stats: updatedStats
        // No random data updates - real data only
      };
    
    default:
      return state;
  }
};

// Create context
const DashboardContext = createContext();

// Context provider component
export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const dataLoadedRef = useRef({ vehicles: false, trips: false });

  // Firebase subscriptions
  useEffect(() => {
    const unsubscribers = [];

    // Subscribe to vehicles
    const unsubscribeVehicles = FirebaseService.subscribeToVehicles((vehicles) => {
      dispatch({ type: actionTypes.SET_VEHICLES, payload: vehicles });
      dataLoadedRef.current.vehicles = true;
      // Set loading to false once first data is loaded
      if (dataLoadedRef.current.vehicles) {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    });
    unsubscribers.push(unsubscribeVehicles);

    // Subscribe to trips
    const unsubscribeTrips = FirebaseService.subscribeToTrips((trips) => {
      dispatch({ type: actionTypes.SET_TRIPS, payload: trips });
      dataLoadedRef.current.trips = true;
    });
    unsubscribers.push(unsubscribeTrips);

    // Subscribe to notifications
    const unsubscribeNotifications = FirebaseService.subscribeToNotifications((notifications) => {
      dispatch({ type: actionTypes.SET_NOTIFICATIONS, payload: notifications });
    });
    unsubscribers.push(unsubscribeNotifications);

    // Subscribe to stats
    const unsubscribeStats = FirebaseService.subscribeToStats((stats) => {
      if (Object.keys(stats).length > 0) {
        dispatch({ type: actionTypes.UPDATE_STATS, payload: stats });
      }
    });
    unsubscribers.push(unsubscribeStats);

    // Subscribe to maintenance data
    const unsubscribeMaintenanceSchedule = FirebaseService.subscribeToMaintenanceSchedule((schedules) => {
      // Update maintenance schedule in state if needed
    });
    unsubscribers.push(unsubscribeMaintenanceSchedule);

    const unsubscribeServiceHistory = FirebaseService.subscribeToServiceHistory((services) => {
      // Update service history in state if needed
    });
    unsubscribers.push(unsubscribeServiceHistory);

    const unsubscribePartsInventory = FirebaseService.subscribeToPartsInventory((parts) => {
      // Update parts inventory in state if needed
    });
    unsubscribers.push(unsubscribePartsInventory);

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  // No sample data initialization - clean start

  // Auto-refresh data
  useEffect(() => {
    if (!state.settings.autoRefresh) return;

    const interval = setInterval(() => {
      dispatch({ type: actionTypes.REFRESH_DATA });
      
      // No random notifications - real notifications only
    }, state.settings.refreshInterval);

    return () => clearInterval(interval);
  }, [state.settings.autoRefresh, state.settings.refreshInterval]);

  // Action creators
  const actions = {
    setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error }),
    
    // Vehicle actions
    addVehicle: async (vehicle) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const result = await FirebaseService.addVehicle(vehicle);
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      if (!result.success) {
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
      }
      return result;
    },
    updateVehicle: async (vehicleId, updates) => {
      const result = await FirebaseService.updateVehicle(vehicleId, updates);
      if (!result.success) {
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
      }
      return result;
    },
    
    // Trip actions
    addTrip: async (trip) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const result = await FirebaseService.addTrip(trip);
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      if (!result.success) {
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
      }
      return result;
    },
    updateTrip: async (tripId, updates) => {
      const result = await FirebaseService.updateTrip(tripId, updates);
      if (!result.success) {
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
      }
      return result;
    },

    
    // Notification actions
    addNotification: async (notification) => {
      const result = await FirebaseService.addNotification(notification);
      if (!result.success) {
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
      }
      return result;
    },
    markNotificationRead: (id) => dispatch({ type: actionTypes.MARK_NOTIFICATION_READ, payload: id }),
    
    // Customer actions
    addCustomer: async (customer) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const result = await FirebaseService.addCustomer(customer);
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      if (!result.success) {
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
      }
      return result;
    },
    
    // Fuel record actions
    addFuelRecord: async (fuelRecord) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const result = await FirebaseService.addFuelRecord(fuelRecord);
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      if (!result.success) {
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
      }
      return result;
    },
    
    updateStats: async (stats) => {
      const result = await FirebaseService.updateStats(stats);
      if (!result.success) {
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
      }
      return result;
    },
    
    // Maintenance Schedule actions
    addMaintenanceSchedule: async (scheduleData) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const result = await FirebaseService.addMaintenanceSchedule(scheduleData);
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      if (!result.success) {
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
      }
      return result;
    },
    updateMaintenanceSchedule: async (scheduleId, updates) => {
      const result = await FirebaseService.updateMaintenanceSchedule(scheduleId, updates);
      if (!result.success) {
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
      }
      return result;
    },
    deleteMaintenanceSchedule: async (scheduleId) => {
      const result = await FirebaseService.deleteMaintenanceSchedule(scheduleId);
      if (!result.success) {
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
      }
      return result;
    },
    
    // Service History actions
    addServiceHistory: async (serviceData) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const result = await FirebaseService.addServiceHistory(serviceData);
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      if (!result.success) {
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
      }
      return result;
    },
    updateServiceHistory: async (serviceId, updates) => {
      const result = await FirebaseService.updateServiceHistory(serviceId, updates);
      if (!result.success) {
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
      }
      return result;
    },
    deleteServiceHistory: async (serviceId) => {
      const result = await FirebaseService.deleteServiceHistory(serviceId);
      if (!result.success) {
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
      }
      return result;
    },
    
    // Parts Inventory actions
    addPart: async (partData) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const result = await FirebaseService.addPart(partData);
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      if (!result.success) {
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
      }
      return result;
    },
    updatePart: async (partId, updates) => {
      const result = await FirebaseService.updatePart(partId, updates);
      if (!result.success) {
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
      }
      return result;
    },
    deletePart: async (partId) => {
      const result = await FirebaseService.deletePart(partId);
      if (!result.success) {
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
      }
      return result;
    },
    
    updateSettings: (settings) => dispatch({ type: actionTypes.UPDATE_SETTINGS, payload: settings }),
    refreshData: () => dispatch({ type: actionTypes.REFRESH_DATA })
  };

  const value = {
    ...state,
    actions
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook to use dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export default DashboardContext;
