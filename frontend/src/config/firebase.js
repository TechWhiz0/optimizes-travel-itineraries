// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDFgh-C87uh-QhyhWk7WV5EA7rHiiJO5lU",
  authDomain: "smart-itationary.firebaseapp.com",
  projectId: "smart-itationary",
  storageBucket: "smart-itationary.firebasestorage.app",
  messagingSenderId: "553781772997",
  appId: "1:553781772997:web:fb05d55713238ecc91e6ac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
