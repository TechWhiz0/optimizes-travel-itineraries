// Utility script to initialize Firebase with default data
import { initializeDefaultData } from '../services/firebaseService';

// Function to manually initialize Firebase data
export const initFirebaseData = async () => {
  try {
    console.log('Initializing Firebase with default data...');
    await initializeDefaultData();
    console.log('Firebase initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

// Auto-initialize when this module is imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  initFirebaseData().catch(console.error);
}
