
import { NextFunction, Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import admin from 'firebase-admin';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Load the service account key file directly using ES modules
    import serviceAccountJson from '../.secrets/firebase-admin-key.json' assert { type: 'json' };
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson)
    });
    console.log("Firebase Admin initialized successfully with service account");
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    throw error;
  }
}

// Extend the Request type with our user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware to verify Firebase Auth token
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Get the authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  // Extract the token
  const token = authHeader.split('Bearer ')[1];
  
  try {
    // Verify the token
    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;
    
    // Get user data from Firestore (optional, for role-based access)
    const userDoc = await getDoc(doc(db, "users", uid));
    
    if (!userDoc.exists()) {
      return res.status(403).json({ message: "User not found" });
    }
    
    // Set user data on the request object
    const userData = userDoc.data();
    req.user = {
      id: uid,
      email: decodedToken.email,
      displayName: userData.displayName || decodedToken.name,
      role: userData.role || 'user',
    };
    
    return next();
  } catch (error) {
    console.error("Error verifying auth token:", error);
    return res.status(401).json({ message: "Invalid authentication token" });
  }
}

// Middleware for development/testing that skips auth
export function devAuth(req: Request, res: Response, next: NextFunction) {
  // Set a mock user for development
  req.user = {
    id: "dev-user-id",
    email: "admin@example.com",
    displayName: "Development Admin",
    role: "admin"
  };
  
  return next();
}
