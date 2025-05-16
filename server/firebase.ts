import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
// Replace these with your actual Firebase project details
const firebaseConfig = {
  apiKey: "AIzaSyBsBi538eOGJlkwRONZpD784fAl2JgQ--I",
  authDomain: "eticclients.firebaseapp.com",
  projectId: "eticclients",
  storageBucket: "eticclients.firebasestorage.app",
  messagingSenderId: "484585240155",
  appId: "1:484585240155:web:b1df107c6cc0d5dae3b17e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
