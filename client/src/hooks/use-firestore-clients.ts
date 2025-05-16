
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, getDoc, addDoc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../../../server/firebase';

/**
 * Hook for managing client data with Firestore
 */
export function useFirestoreClients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const clientsCollection = collection(db, 'clients');
      const clientsQuery = query(clientsCollection, orderBy('clientName'));
      const snapshot = await getDocs(clientsQuery);
      
      const clientsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setClients(clientsList);
      setError(null);
    } catch (err: any) {
      setError('Error fetching clients: ' + err.message);
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const getClient = async (clientId: string) => {
    try {
      const clientDoc = doc(db, 'clients', clientId);
      const snapshot = await getDoc(clientDoc);
      
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      } else {
        throw new Error('Client not found');
      }
    } catch (err: any) {
      console.error('Error getting client:', err);
      throw err;
    }
  };

  const addClient = async (clientData: any) => {
    try {
      const clientsCollection = collection(db, 'clients');
      const docRef = await addDoc(clientsCollection, {
        ...clientData,
        createdAt: new Date()
      });
      await fetchClients(); // Refresh the list
      return docRef.id;
    } catch (err: any) {
      console.error('Error adding client:', err);
      throw err;
    }
  };

  const updateClient = async (clientId: string, clientData: any) => {
    try {
      const clientDoc = doc(db, 'clients', clientId);
      await updateDoc(clientDoc, {
        ...clientData,
        updatedAt: new Date()
      });
      await fetchClients(); // Refresh the list
    } catch (err: any) {
      console.error('Error updating client:', err);
      throw err;
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      const clientDoc = doc(db, 'clients', clientId);
      await deleteDoc(clientDoc);
      await fetchClients(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting client:', err);
      throw err;
    }
  };

  // Load clients on initial render
  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    error,
    fetchClients,
    getClient,
    addClient,
    updateClient,
    deleteClient
  };
}
