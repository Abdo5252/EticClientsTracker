
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration - using the existing values from server/firebase.ts
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

// Initialize Firebase Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
