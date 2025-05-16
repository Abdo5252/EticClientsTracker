
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, getDoc, addDoc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../../server/firebase';

interface Client {
  id: string;
  clientCode: string;
  clientName: string;
  salesRepName: string;
  currency: string;
  balance: number;
}

export function useFirestoreClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const clientsCollection = collection(db, 'clients');
      const clientsQuery = query(clientsCollection, orderBy('clientName'));
      const querySnapshot = await getDocs(clientsQuery);
      
      const clientsList: Client[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        clientsList.push({
          id: doc.id,
          clientCode: data.clientCode,
          clientName: data.clientName,
          salesRepName: data.salesRepName || '',
          currency: data.currency || 'EGP',
          balance: data.balance || 0,
        });
      });
      
      setClients(clientsList);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const getClientByCode = async (code: string) => {
    try {
      const clientsCollection = collection(db, 'clients');
      const q = query(clientsCollection, where('clientCode', '==', code));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        clientCode: data.clientCode,
        clientName: data.clientName,
        salesRepName: data.salesRepName || '',
        currency: data.currency || 'EGP',
        balance: data.balance || 0,
      };
    } catch (err) {
      console.error('Error getting client by code:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    isLoading,
    error,
    refetch: fetchClients,
    getClientByCode
  };
}
