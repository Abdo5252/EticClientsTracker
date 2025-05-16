
import * as admin from 'firebase-admin';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Initialize Firebase Admin SDK
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

async function migrateUsers() {
  try {
    console.log('Starting user migration to Firebase Auth...');
    
    // Get all users from Firestore
    const usersRef = collection(db, 'users');
    const userSnapshot = await getDocs(usersRef);
    
    if (userSnapshot.empty) {
      console.log('No users found to migrate.');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const userDoc of userSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      try {
        // Check if user already exists in Firebase Auth
        try {
          await admin.auth().getUser(userId);
          console.log(`User ${userData.username} already exists in Firebase Auth, skipping...`);
          continue;
        } catch (error) {
          // User doesn't exist, proceed with creation
        }
        
        // Create user in Firebase Auth
        // Note: We're using username + domain as email for existing users
        const email = `${userData.username}@eticclients.com`;
        
        // Create user in Firebase Auth
        const userRecord = await admin.auth().createUser({
          uid: userId,
          email: email,
          displayName: userData.displayName,
          // Note: We can't migrate passwords directly due to different hashing
          // Users would need to reset their passwords
          password: 'TemporaryPassword123!'
        });
        
        // Set custom claims for user role
        await admin.auth().setCustomUserClaims(userRecord.uid, {
          role: userData.role || 'user'
        });
        
        console.log(`Successfully created Firebase Auth user for ${userData.username}`);
        successCount++;
      } catch (error) {
        console.error(`Error migrating user ${userData.username}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Migration completed. Success: ${successCount}, Errors: ${errorCount}`);
  } catch (error) {
    console.error('Error in migration process:', error);
  }
}

// Run the migration
migrateUsers().catch(console.error);
