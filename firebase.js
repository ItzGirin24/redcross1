// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBQtlCxwhIXyKxuW5FRyRqOElCz-2_EPjs",
  authDomain: "redcross-76c90.firebaseapp.com",
  projectId: "redcross-76c90",
  storageBucket: "redcross-76c90.firebasestorage.app",
  messagingSenderId: "720435310423",
  appId: "1:720435310423:web:058f8f14743135da62d812",
  measurementId: "G-1N1LDV3R95"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
