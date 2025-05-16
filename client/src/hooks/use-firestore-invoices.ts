
import { useState, useEffect } from 'react';
import { 
  collection, getDocs, query, orderBy, doc, getDoc, addDoc, 
  updateDoc, deleteDoc, where, serverTimestamp, Timestamp 
} from 'firebase/firestore';
import { db } from '../../../server/firebase';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  invoiceDate: Date;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  status: string;
  createdAt?: Date;
}

export function useFirestoreInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const invoicesCollection = collection(db, 'invoices');
      const invoicesQuery = query(invoicesCollection, orderBy('invoiceDate', 'desc'));
      const snapshot = await getDocs(invoicesQuery);
      
      const invoicesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        invoiceDate: doc.data().invoiceDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Invoice[];
      
      setInvoices(invoicesList);
      setError(null);
      return invoicesList;
    } catch (err: any) {
      const errorMessage = 'Error fetching invoices: ' + err.message;
      setError(errorMessage);
      console.error(errorMessage, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchClientInvoices = async (clientId: string) => {
    try {
      setLoading(true);
      const invoicesCollection = collection(db, 'invoices');
      const clientInvoicesQuery = query(
        invoicesCollection, 
        where('clientId', '==', clientId),
        orderBy('invoiceDate', 'desc')
      );
      
      const snapshot = await getDocs(clientInvoicesQuery);
      
      const invoicesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        invoiceDate: doc.data().invoiceDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Invoice[];
      
      setError(null);
      return invoicesList;
    } catch (err: any) {
      const errorMessage = 'Error fetching client invoices: ' + err.message;
      setError(errorMessage);
      console.error(errorMessage, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getInvoice = async (invoiceId: string) => {
    try {
      const invoiceDoc = doc(db, 'invoices', invoiceId);
      const snapshot = await getDoc(invoiceDoc);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        return { 
          id: snapshot.id, 
          ...data,
          invoiceDate: data.invoiceDate?.toDate(),
          createdAt: data.createdAt?.toDate()
        } as Invoice;
      } else {
        throw new Error('Invoice not found');
      }
    } catch (err: any) {
      console.error('Error getting invoice:', err);
      throw err;
    }
  };

  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'paidAmount' | 'status' | 'createdAt'>) => {
    try {
      const invoicesCollection = collection(db, 'invoices');
      
      // Format the data for Firestore
      const newInvoice = {
        ...invoiceData,
        invoiceDate: Timestamp.fromDate(new Date(invoiceData.invoiceDate)),
        paidAmount: 0,
        status: 'open',
        totalAmount: Number(invoiceData.totalAmount),
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(invoicesCollection, newInvoice);
      
      // Update client balance
      const clientDoc = doc(db, 'clients', invoiceData.clientId);
      const clientSnapshot = await getDoc(clientDoc);
      
      if (clientSnapshot.exists()) {
        const clientData = clientSnapshot.data();
        await updateDoc(clientDoc, {
          balance: (clientData.balance || 0) + Number(invoiceData.totalAmount)
        });
      }
      
      // Log activity
      await addDoc(collection(db, 'activities'), {
        activityType: 'invoice_created',
        description: `تم إضافة فاتورة جديدة رقم ${invoiceData.invoiceNumber}`,
        entityId: docRef.id,
        entityType: 'invoice',
        timestamp: serverTimestamp()
      });
      
      await fetchInvoices(); // Refresh the list
      return docRef.id;
    } catch (err: any) {
      console.error('Error adding invoice:', err);
      throw err;
    }
  };

  const updateInvoice = async (invoiceId: string, invoiceData: Partial<Invoice>) => {
    try {
      const invoiceDoc = doc(db, 'invoices', invoiceId);
      const snapshot = await getDoc(invoiceDoc);
      
      if (!snapshot.exists()) {
        throw new Error('Invoice not found');
      }
      
      const existingData = snapshot.data();
      
      // Calculate balance diff if amount changed
      let balanceDiff = 0;
      if (invoiceData.totalAmount !== undefined && existingData.totalAmount !== invoiceData.totalAmount) {
        balanceDiff = Number(invoiceData.totalAmount) - Number(existingData.totalAmount);
      }
      
      // Prepare update data
      const updateData: any = { ...invoiceData };
      
      // Convert date to Firestore timestamp if present
      if (invoiceData.invoiceDate) {
        updateData.invoiceDate = Timestamp.fromDate(new Date(invoiceData.invoiceDate));
      }
      
      // Add timestamp
      updateData.updatedAt = serverTimestamp();
      
      await updateDoc(invoiceDoc, updateData);
      
      // Update client balance if needed
      if (balanceDiff !== 0) {
        const clientDoc = doc(db, 'clients', existingData.clientId);
        const clientSnapshot = await getDoc(clientDoc);
        
        if (clientSnapshot.exists()) {
          const clientData = clientSnapshot.data();
          await updateDoc(clientDoc, {
            balance: (clientData.balance || 0) + balanceDiff
          });
        }
      }
      
      // Log activity
      await addDoc(collection(db, 'activities'), {
        activityType: 'invoice_updated',
        description: `تم تحديث الفاتورة رقم ${existingData.invoiceNumber}`,
        entityId: invoiceId,
        entityType: 'invoice',
        timestamp: serverTimestamp()
      });
      
      await fetchInvoices(); // Refresh the list
    } catch (err: any) {
      console.error('Error updating invoice:', err);
      throw err;
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    try {
      const invoiceDoc = doc(db, 'invoices', invoiceId);
      const snapshot = await getDoc(invoiceDoc);
      
      if (!snapshot.exists()) {
        throw new Error('Invoice not found');
      }
      
      const invoiceData = snapshot.data();
      
      // Update client balance
      const clientDoc = doc(db, 'clients', invoiceData.clientId);
      const clientSnapshot = await getDoc(clientDoc);
      
      if (clientSnapshot.exists()) {
        const clientData = clientSnapshot.data();
        await updateDoc(clientDoc, {
          balance: (clientData.balance || 0) - (invoiceData.totalAmount - invoiceData.paidAmount)
        });
      }
      
      // Delete invoice
      await deleteDoc(invoiceDoc);
      
      // Log activity
      await addDoc(collection(db, 'activities'), {
        activityType: 'invoice_deleted',
        description: `تم حذف الفاتورة رقم ${invoiceData.invoiceNumber}`,
        entityId: invoiceId,
        entityType: 'invoice',
        timestamp: serverTimestamp()
      });
      
      await fetchInvoices(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting invoice:', err);
      throw err;
    }
  };

  // Load invoices on initial render
  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    fetchClientInvoices,
    getInvoice,
    addInvoice,
    updateInvoice,
    deleteInvoice
  };
}
