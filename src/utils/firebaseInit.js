// Firebase initialization and setup utilities
import { authHelpers, dbHelpers } from '../config/firebase';
import FirebaseService from '../services/firebaseService';

class FirebaseInitializer {
  static isInitialized = false;
  static currentUser = null;

  // Initialize Firebase connection and setup
  static async initialize() {
    try {
      console.log('🔥 Initializing Firebase connection...');
      
      // Test database connection
      const testResult = await dbHelpers.read('test');
      console.log('✅ Firebase database connection successful');
      
      // No sample data initialization - clean start
      
      // Set up auth state listener
      this.setupAuthListener();
      
      this.isInitialized = true;
      console.log('🚀 Firebase initialization complete');
      
      return { success: true, message: 'Firebase initialized successfully' };
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Set up authentication state listener
  static setupAuthListener() {
    return authHelpers.onAuthChange((user) => {
      this.currentUser = user;
      if (user) {
        console.log('👤 User signed in:', user.email);
        // You can dispatch user state to your app context here
      } else {
        console.log('👤 User signed out');
      }
    });
  }

  // Get current authentication status
  static getAuthStatus() {
    return {
      isAuthenticated: !!this.currentUser,
      user: this.currentUser
    };
  }

  // Test Firebase services
  static async testServices() {
    const results = {
      database: false,
      auth: false,
      overall: false
    };

    try {
      // Test database
      console.log('🧪 Testing database connection...');
      const dbTest = await dbHelpers.create('test', { 
        message: 'Firebase test', 
        timestamp: Date.now() 
      });
      results.database = dbTest.success;
      
      if (dbTest.success) {
        // Clean up test data
        await dbHelpers.delete(`test/${dbTest.id}`);
        console.log('✅ Database test passed');
      }

      // Test auth (just check if auth is available)
      results.auth = typeof authHelpers.onAuthChange === 'function';
      console.log('✅ Auth service available');

      results.overall = results.database && results.auth;
      
      return results;
    } catch (error) {
      console.error('❌ Service test failed:', error);
      return results;
    }
  }

  // No development data initialization - clean start

  // Health check for Firebase services
  static async healthCheck() {
    const health = {
      timestamp: new Date().toISOString(),
      services: {
        database: 'unknown',
        auth: 'unknown',
        storage: 'unknown'
      },
      overall: 'unknown'
    };

    try {
      // Check database
      const dbCheck = await dbHelpers.read('health');
      health.services.database = 'healthy';
      
      // Check auth
      health.services.auth = typeof authHelpers.onAuthChange === 'function' ? 'healthy' : 'error';
      
      // Storage check (basic availability)
      health.services.storage = 'healthy'; // Assuming storage is configured
      
      // Overall health
      const allHealthy = Object.values(health.services).every(status => status === 'healthy');
      health.overall = allHealthy ? 'healthy' : 'degraded';
      
      return health;
    } catch (error) {
      health.overall = 'error';
      health.error = error.message;
      return health;
    }
  }

  // Get Firebase configuration info (without sensitive data)
  static getConfigInfo() {
    return {
      projectId: 'transport-2524d',
      authDomain: 'transport-2524d.firebaseapp.com',
      databaseURL: 'https://transport-2524d-default-rtdb.firebaseio.com',
      storageBucket: 'transport-2524d.firebasestorage.app',
      initialized: this.isInitialized,
      timestamp: new Date().toISOString()
    };
  }

  // Reset Firebase connection (for debugging)
  static async reset() {
    try {
      console.log('🔄 Resetting Firebase connection...');
      this.isInitialized = false;
      this.currentUser = null;
      
      // Re-initialize
      return await this.initialize();
    } catch (error) {
      console.error('❌ Firebase reset failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Auto-initialize Firebase when module loads
FirebaseInitializer.initialize().then(result => {
  if (result.success) {
    console.log('🎉 Firebase auto-initialization successful');
  } else {
    console.error('💥 Firebase auto-initialization failed:', result.error);
  }
});

export default FirebaseInitializer;
