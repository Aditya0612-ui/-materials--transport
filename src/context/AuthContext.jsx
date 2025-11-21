import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, authHelpers } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Check for existing authentication on app load
  useEffect(() => {
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in with Firebase
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'Admin',
          photoURL: user.photoURL,
          provider: user.providerData[0]?.providerId || 'firebase',
          loginTime: new Date().toISOString(),
          isFirebaseAuth: true
        };
        
        setFirebaseUser(user);
        setAdminData(userData);
        setIsAuthenticated(true);
        setIsLoading(false);
        
        // Store in localStorage for persistence
        localStorage.setItem('adminAuth', JSON.stringify(userData));
      } else {
        // No Firebase user, check for local auth
        checkLocalAuthStatus();
      }
    });

    return () => unsubscribe();
  }, []);

  const checkLocalAuthStatus = () => {
    try {
      // Check localStorage first (remember me)
      let authData = localStorage.getItem('adminAuth');
      
      // If not in localStorage, check sessionStorage
      if (!authData) {
        authData = sessionStorage.getItem('adminAuth');
      }

      if (authData) {
        const parsedData = JSON.parse(authData);
        
        // Skip Firebase auth data if no Firebase user
        if (parsedData.isFirebaseAuth && !firebaseUser) {
          clearAuth();
          setIsLoading(false);
          return;
        }
        
        // Validate the auth data structure
        if (parsedData && (parsedData.username || parsedData.email) && parsedData.loginTime) {
          // Check if session is still valid (24 hours for localStorage, session for sessionStorage)
          const loginTime = new Date(parsedData.loginTime);
          const now = new Date();
          const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
          
          // If remember me was checked, allow 24 hours, otherwise check if session storage exists
          const isValid = parsedData.rememberMe ? hoursDiff < 24 : sessionStorage.getItem('adminAuth');
          
          if (isValid) {
            setIsAuthenticated(true);
            setAdminData(parsedData);
          } else {
            // Clear expired auth
            clearAuth();
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  // OAuth login methods
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const result = await authHelpers.signInWithGoogle();
      if (result.success) {
        return { success: true, user: result.user };
      } else {
        console.error('❌ Google sign-in failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithFacebook = async () => {
    try {
      setIsLoading(true);
      const result = await authHelpers.signInWithFacebook();
      if (result.success) {
        return { success: true, user: result.user };
      } else {
        console.error('❌ Facebook sign-in failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Facebook sign-in error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithTwitter = async () => {
    try {
      setIsLoading(true);
      const result = await authHelpers.signInWithTwitter();
      if (result.success) {
        return { success: true, user: result.user };
      } else {
        console.error('❌ Twitter sign-in failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Twitter sign-in error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGithub = async () => {
    try {
      setIsLoading(true);
      const result = await authHelpers.signInWithGithub();
      if (result.success) {
        return { success: true, user: result.user };
      } else {
        console.error('❌ GitHub sign-in failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ GitHub sign-in error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData) => {
    try {
      setIsAuthenticated(true);
      setAdminData(userData);
      
      // Store in appropriate storage based on remember me preference
      if (userData.rememberMe) {
        localStorage.setItem('adminAuth', JSON.stringify(userData));
      } else {
        sessionStorage.setItem('adminAuth', JSON.stringify(userData));
      }
      
      return { success: true, message: 'Login successful' };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      // Sign out from Firebase if user is authenticated with Firebase
      if (firebaseUser) {
        await authHelpers.signOut();
      }
      
      setIsAuthenticated(false);
      setAdminData(null);
      setFirebaseUser(null);
      clearAuth();
      return { success: true, message: 'Logout successful' };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return { success: false, message: 'Logout failed' };
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminAuth');
  };

  const updateAdminData = (newData) => {
    const updatedData = { ...adminData, ...newData };
    setAdminData(updatedData);
    
    // Update storage
    if (updatedData.rememberMe) {
      localStorage.setItem('adminAuth', JSON.stringify(updatedData));
    } else {
      sessionStorage.setItem('adminAuth', JSON.stringify(updatedData));
    }
  };

  const getAuthToken = () => {
    // In a real app, this would return a JWT token
    return adminData ? `admin_${adminData.username}_${Date.now()}` : null;
  };

  const isSessionValid = () => {
    if (!adminData || !adminData.loginTime) return false;
    
    const loginTime = new Date(adminData.loginTime);
    const now = new Date();
    const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
    
    return adminData.rememberMe ? hoursDiff < 24 : hoursDiff < 8; // 8 hours for session
  };

  const refreshSession = () => {
    if (adminData) {
      const refreshedData = {
        ...adminData,
        loginTime: new Date().toISOString()
      };
      updateAdminData(refreshedData);
    }
  };

  const contextValue = {
    // State
    isAuthenticated,
    adminData,
    isLoading,
    firebaseUser,
    
    // Methods
    login,
    logout,
    updateAdminData,
    getAuthToken,
    isSessionValid,
    refreshSession,
    
    // OAuth Methods
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signInWithGithub,
    
    // Computed values
    adminUsername: adminData?.displayName || adminData?.username || adminData?.email?.split('@')[0] || null,
    loginTime: adminData?.loginTime || null,
    rememberMe: adminData?.rememberMe || false,
    provider: adminData?.provider || 'local',
    photoURL: adminData?.photoURL || null
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
