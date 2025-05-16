import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import bcrypt from "bcrypt";
import * as fs from 'fs';
import * as path from 'path';
import { db } from "./firebase.js";

/**
 * Utility to set up Firestore collections and seed initial data
 */
async function setupFirestore() {
  console.log("Setting up Firestore...");

  try {
    // Check if users collection exists and has data
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);

    if (usersSnapshot.empty) {
      console.log("Setting up users collection...");

      // Create admin user
      const adminPassword = "$2b$10$n9C5XbkfypG8exRUW.zOKOqQpzSEg5eQvFBLXOLgHQJ6Dw/NPlzGa";
      await addDoc(usersRef, {
        username: "admin",
        password: adminPassword,
        displayName: "مدير النظام",
        role: "admin",
        createdAt: serverTimestamp()
      });

      // Create test user
      const userPassword = "$2b$10$KCFJnI0xUFg1o8VgzCyO6.qn3XCuAiS1jdFf1mXBT5N17Ww5gIlUW";
      await addDoc(usersRef, {
        username: "user",
        password: userPassword,
        displayName: "Test User",
        role: "user",
        createdAt: serverTimestamp()
      });

      console.log("Created default users.");
    } else {
      console.log(`Found ${usersSnapshot.size} existing users.`);
    }

    // Check for clients data
    const clientsRef = collection(db, "clients");
    const clientsSnapshot = await getDocs(clientsRef);

    if (clientsSnapshot.empty) {
      console.log("Setting up clients collection...");

      // Import clients from JSON if available
      const clientsPath = path.join(process.cwd(), "clients-data.json");
      if (fs.existsSync(clientsPath)) {
        const clientsJson = JSON.parse(fs.readFileSync(clientsPath, "utf8"));
        console.log(`Found ${clientsJson.length} clients in JSON file.`);

        let importedCount = 0;
        let skippedCount = 0;

        for (const client of clientsJson) {
          try {
            // Map fields to our schema
            const clientData = {
              clientCode: String(client.CODE || client.clientCode || "").trim(),
              clientName: String(client['CUSTOMER NAME'] || client.clientName || "").trim(),
              salesRepName: String(client['SALES REP'] || client.salesRepName || "").trim(),
              currency: client.currency || "EGP",
              balance: 0,
              createdAt: serverTimestamp()
            };

            // Skip empty entries
            if (!clientData.clientCode || !clientData.clientName) {
              skippedCount++;
              continue;
            }

            await addDoc(clientsRef, clientData);
            importedCount++;

            if (importedCount % 10 === 0) {
              console.log(`Imported ${importedCount} clients...`);
            }
          } catch (error) {
            console.error(`Error importing client:`, error);
            skippedCount++;
          }
        }

        console.log(`Imported ${importedCount} clients, skipped ${skippedCount} records.`);
      } else {
        console.log("No clients-data.json file found. Adding sample clients...");

        // Add sample clients
        const sampleClients = [
          {
            clientCode: "C001",
            clientName: "شركة الأهرام للتجارة",
            salesRepName: "أحمد محمود",
            currency: "EGP",
            balance: 0,
            createdAt: serverTimestamp()
          },
          {
            clientCode: "C002",
            clientName: "مؤسسة النيل للصناعات",
            salesRepName: "محمد علي",
            currency: "EGP",
            balance: 0,
            createdAt: serverTimestamp()
          },
          {
            clientCode: "C003",
            clientName: "الشركة المصرية للاستيراد",
            salesRepName: "خالد إبراهيم",
            currency: "USD",
            balance: 0,
            createdAt: serverTimestamp()
          }
        ];

        for (const client of sampleClients) {
          await addDoc(clientsRef, client);
        }

        console.log(`Added ${sampleClients.length} sample clients.`);
      }
    } else {
      console.log(`Found ${clientsSnapshot.size} existing clients.`);
    }

    console.log("Firestore setup complete.");
  } catch (error) {
    console.error("Error setting up Firestore:", error);
  }
}

export default setupFirestore;