// Firebase configuration for micaot-com project
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.FIREBASE_API_KEY,
    authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.FIREBASE_APP_ID,
    measurementId: import.meta.env.FIREBASE_MEASUREMENT_ID
};

console.log("=== FIREBASE CONFIG DEBUG ===");
console.log(firebaseConfig);
console.log("=============================");

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;