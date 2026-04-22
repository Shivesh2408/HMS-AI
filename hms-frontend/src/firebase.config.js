// Firebase configuration for HMS Frontend
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDWSIZX11GHxFaJgR5cCQ9qtQhElr2wOE",
  authDomain: "hms-ai-32e8c.firebaseapp.com",
  projectId: "hms-ai-32e8c",
  storageBucket: "hms-ai-32e8c.firebasestorage.app",
  messagingSenderId: "527589963916",
  appId: "1:527589963916:web:649f10a416cf692b85e3a9",
  measurementId: "G-9HFYPP4T8K"
};

console.log('🔥 Firebase Config Loaded:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 10) + '...' : 'MISSING'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Set persistence to LOCAL so user stays logged in even after page refresh
setPersistence(auth, browserLocalPersistence)
  .catch((error) => console.error("❌ Error setting auth persistence:", error));

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Multiple tabs open - Firestore persistence disabled');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Firestore persistence not supported in this browser');
    } else {
      console.warn('⚠️ Firestore persistence error:', err);
    }
  });

export { auth, db, storage, analytics, app };
export default app;
