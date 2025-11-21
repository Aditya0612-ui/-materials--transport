// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getDatabase, 
  ref, 
  push, 
  set, 
  onValue, 
  off, 
  update, 
  remove,
  get,
  child,
  query,
  orderByChild,
  orderByKey,
  limitToLast,
  equalTo
} from "firebase/database";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from "firebase/auth";
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  onSnapshot, 
  query as firestoreQuery, 
  where, 
  orderBy, 
  limit 
} from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase config
if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
  console.error('❌ Firebase configuration is missing. Please check your environment variables.');
  console.log('Available env vars:', {
    hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
    hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
    hasAuthDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
  });
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);
const firestore = getFirestore(app);

// Database helper functions
export const dbHelpers = {
  // Generic CRUD operations for Realtime Database
  create: async (path, data) => {
    try {
      const newRef = push(ref(database, path));
      await set(newRef, { ...data, id: newRef.key, createdAt: Date.now() });
      return { success: true, id: newRef.key, data: { ...data, id: newRef.key } };
    } catch (error) {
      console.error(`Error creating data at ${path}:`, error);
      return { success: false, error: error.message };
    }
  },

  read: async (path) => {
    try {
      const snapshot = await get(ref(database, path));
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      } else {
        return { success: true, data: null };
      }
    } catch (error) {
      console.error(`Error reading data from ${path}:`, error);
      return { success: false, error: error.message };
    }
  },

  update: async (path, updates) => {
    try {
      await update(ref(database, path), { ...updates, updatedAt: Date.now() });
      return { success: true };
    } catch (error) {
      console.error(`Error updating data at ${path}:`, error);
      return { success: false, error: error.message };
    }
  },

  delete: async (path) => {
    try {
      await remove(ref(database, path));
      return { success: true };
    } catch (error) {
      console.error(`Error deleting data at ${path}:`, error);
      return { success: false, error: error.message };
    }
  },

  // Real-time subscription
  subscribe: (path, callback) => {
    const dbRef = ref(database, path);
    onValue(dbRef, callback);
    return () => off(dbRef, callback);
  }
};

// OAuth Providers
export const oauthProviders = {
  google: new GoogleAuthProvider(),
  facebook: new FacebookAuthProvider(),
  twitter: new TwitterAuthProvider(),
  github: new GithubAuthProvider()
};

// Configure OAuth providers
oauthProviders.google.addScope('profile');
oauthProviders.google.addScope('email');
oauthProviders.facebook.addScope('email');
oauthProviders.github.addScope('user:email');

// Authentication helper functions
export const authHelpers = {
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // OAuth Sign In Methods
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, oauthProviders.google);
      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);
      return { 
        success: true, 
        user, 
        credential,
        isNewUser: result._tokenResponse?.isNewUser || false
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, error: error.message, code: error.code };
    }
  },

  signInWithFacebook: async () => {
    try {
      const result = await signInWithPopup(auth, oauthProviders.facebook);
      const user = result.user;
      const credential = FacebookAuthProvider.credentialFromResult(result);
      return { 
        success: true, 
        user, 
        credential,
        isNewUser: result._tokenResponse?.isNewUser || false
      };
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      return { success: false, error: error.message, code: error.code };
    }
  },

  signInWithTwitter: async () => {
    try {
      const result = await signInWithPopup(auth, oauthProviders.twitter);
      const user = result.user;
      const credential = TwitterAuthProvider.credentialFromResult(result);
      return { 
        success: true, 
        user, 
        credential,
        isNewUser: result._tokenResponse?.isNewUser || false
      };
    } catch (error) {
      console.error('Twitter sign-in error:', error);
      return { success: false, error: error.message, code: error.code };
    }
  },

  signInWithGithub: async () => {
    try {
      const result = await signInWithPopup(auth, oauthProviders.github);
      const user = result.user;
      const credential = GithubAuthProvider.credentialFromResult(result);
      return { 
        success: true, 
        user, 
        credential,
        isNewUser: result._tokenResponse?.isNewUser || false
      };
    } catch (error) {
      console.error('GitHub sign-in error:', error);
      return { success: false, error: error.message, code: error.code };
    }
  },

  // Generic OAuth sign-in with redirect (for mobile)
  signInWithRedirect: async (provider) => {
    try {
      await signInWithRedirect(auth, oauthProviders[provider]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get redirect result
  getRedirectResult: async () => {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        return { success: true, user: result.user };
      }
      return { success: true, user: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  signUp: async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  onAuthChange: (callback) => {
    return onAuthStateChanged(auth, callback);
  },

  // Phone Authentication with reCAPTCHA
  setupRecaptcha: (containerId) => {
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'normal',
        callback: (response) => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        }
      });
      return { success: true, verifier: recaptchaVerifier };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  sendOTP: async (phoneNumber, recaptchaVerifier) => {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return { success: true, confirmationResult };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  verifyOTP: async (confirmationResult, otpCode) => {
    try {
      const result = await confirmationResult.confirm(otpCode);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Test phone numbers for development
  getTestPhoneNumbers: () => {
    return {
      '+1 650-555-3434': '123456', // Test number with OTP 123456
      '+1 650-555-1234': '654321', // Test number with OTP 654321
      '+91 9876543210': '111111',  // Indian test number
      '+91 8765432109': '222222'   // Another Indian test number
    };
  }
};

// Storage helper functions
export const storageHelpers = {
  upload: async (path, file) => {
    try {
      const fileRef = storageRef(storage, path);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { success: true, url: downloadURL };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  delete: async (path) => {
    try {
      await deleteObject(storageRef(storage, path));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Firestore helper functions (for complex queries and better scalability)
export const firestoreHelpers = {
  create: async (collectionName, data) => {
    try {
      const docRef = await addDoc(collection(firestore, collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  read: async (collectionName, docId) => {
    try {
      const docSnap = await getDoc(doc(firestore, collectionName, docId));
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: true, data: null };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  readAll: async (collectionName) => {
    try {
      const querySnapshot = await getDocs(collection(firestore, collectionName));
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  update: async (collectionName, docId, updates) => {
    try {
      await updateDoc(doc(firestore, collectionName, docId), {
        ...updates,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  delete: async (collectionName, docId) => {
    try {
      await deleteDoc(doc(firestore, collectionName, docId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  subscribe: (collectionName, callback, queryConstraints = []) => {
    const q = firestoreQuery(collection(firestore, collectionName), ...queryConstraints);
    return onSnapshot(q, callback);
  }
};

// Export Firebase services and helpers
export { 
  app,
  analytics,
  database, 
  auth, 
  storage,
  firestore,
  // Realtime Database functions
  ref, 
  push, 
  set, 
  onValue, 
  off, 
  update, 
  remove,
  get,
  child,
  query,
  orderByChild,
  orderByKey,
  limitToLast,
  equalTo,
  // Auth functions
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  // Storage functions
  storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  // Firestore functions
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  firestoreQuery,
  where,
  orderBy,
  limit
};

export default app;