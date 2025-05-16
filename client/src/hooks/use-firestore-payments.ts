
import { useState, useEffect } from 'react';
import { 
  collection, getDocs, query, orderBy, doc, getDoc, addDoc, 
  updateDoc, deleteDoc, where, serverTimestamp, Timestamp 
} from 'firebase/firestore';
import { db } from '../../../server/firebase';

export interface Payment {
  id: string;
  clientId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  checkNumber?: string;
  transactionId?: string;
  notes?: string;
  currency: string;
  createdAt?: Date;
}

export function useFirestorePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const paymentsCollection = collection(db, 'payments');
      const paymentsQuery = query(paymentsCollection, orderBy('paymentDate', 'desc'));
      const snapshot = await getDocs(paymentsQuery);
      
      const paymentsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        paymentDate: doc.data().paymentDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Payment[];
      
      setPayments(paymentsList);
      setError(null);
      return paymentsList;
    } catch (err: any) {
      const errorMessage = 'Error fetching payments: ' + err.message;
      setError(errorMessage);
      console.error(errorMessage, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchClientPayments = async (clientId: string) => {
    try {
      setLoading(true);
      const paymentsCollection = collection(db, 'payments');
      const clientPaymentsQuery = query(
        paymentsCollection, 
        where('clientId', '==', clientId),
        orderBy('paymentDate', 'desc')
      );
      
      const snapshot = await getDocs(clientPaymentsQuery);
      
      const paymentsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        paymentDate: doc.data().paymentDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Payment[];
      
      setError(null);
      return paymentsList;
    } catch (err: any) {
      const errorMessage = 'Error fetching client payments: ' + err.message;
      setError(errorMessage);
      console.error(errorMessage, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPayment = async (paymentId: string) => {
    try {
      const paymentDoc = doc(db, 'payments', paymentId);
      const snapshot = await getDoc(paymentDoc);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        return { 
          id: snapshot.id, 
          ...data,
          paymentDate: data.paymentDate?.toDate(),
          createdAt: data.createdAt?.toDate()
        } as Payment;
      } else {
        throw new Error('Payment not found');
      }
    } catch (err: any) {
      console.error('Error getting payment:', err);
      throw err;
    }
  };

  const addPayment = async (paymentData: Omit<Payment, 'id' | 'createdAt'>) => {
    try {
      const paymentsCollection = collection(db, 'payments');
      
      // Format the data for Firestore
      const newPayment = {
        ...paymentData,
        paymentDate: Timestamp.fromDate(new Date(paymentData.paymentDate)),
        amount: Number(paymentData.amount),
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(paymentsCollection, newPayment);
      
      // Get client's invoices ordered by date (oldest first)
      const invoicesRef = collection(db, 'invoices');
      const invoicesQuery = query(
        invoicesRef,
        where('clientId', '==', paymentData.clientId),
        where('status', 'in', ['open', 'partial']),
        orderBy('invoiceDate')
      );
      
      const invoiceSnapshot = await getDocs(invoicesQuery);
      const invoices = invoiceSnapshot.docs;
      
      // Apply payment to invoices
      let remainingAmount = Number(paymentData.amount);
      for (const invoiceDoc of invoices) {
        if (remainingAmount <= 0) break;
        
        const invoice = invoiceDoc.data();
        const amountDue = invoice.totalAmount - invoice.paidAmount;
        const amountToApply = Math.min(amountDue, remainingAmount);
        
        if (amountToApply > 0) {
          const newPaidAmount = invoice.paidAmount + amountToApply;
          const newStatus = newPaidAmount >= invoice.totalAmount ? 'paid' : 'partial';
          
          await updateDoc(doc(db, 'invoices', invoiceDoc.id), {
            paidAmount: newPaidAmount,
            status: newStatus
          });
          
          remainingAmount -= amountToApply;
        }
      }
      
      // Update client balance
      const clientDoc = doc(db, 'clients', paymentData.clientId);
      const clientSnapshot = await getDoc(clientDoc);
      
      if (clientSnapshot.exists()) {
        const clientData = clientSnapshot.data();
        await updateDoc(clientDoc, {
          balance: (clientData.balance || 0) - Number(paymentData.amount)
        });
      }
      
      // Log activity
      const clientSnapshot2 = await getDoc(clientDoc);
      const clientName = clientSnapshot2.exists() ? clientSnapshot2.data().clientName : 'Unknown client';
      
      await addDoc(collection(db, 'activities'), {
        activityType: 'payment_created',
        description: `تم تسجيل دفعة جديدة بقيمة ${paymentData.amount} من العميل: ${clientName}`,
        entityId: docRef.id,
        entityType: 'payment',
        timestamp: serverTimestamp()
      });
      
      await fetchPayments(); // Refresh the list
      return docRef.id;
    } catch (err: any) {
      console.error('Error adding payment:', err);
      throw err;
    }
  };

  const updatePayment = async (paymentId: string, paymentData: Partial<Payment>) => {
    try {
      const paymentDoc = doc(db, 'payments', paymentId);
      const snapshot = await getDoc(paymentDoc);
      
      if (!snapshot.exists()) {
        throw new Error('Payment not found');
      }
      
      const existingData = snapshot.data();
      
      // We don't allow changing the amount to keep payment allocation consistent
      if (paymentData.amount !== undefined && existingData.amount !== paymentData.amount) {
        throw new Error('Changing payment amount is not supported');
      }
      
      // Prepare update data
      const updateData: any = { ...paymentData };
      
      // Convert date to Firestore timestamp if present
      if (paymentData.paymentDate) {
        updateData.paymentDate = Timestamp.fromDate(new Date(paymentData.paymentDate));
      }
      
      // Add timestamp
      updateData.updatedAt = serverTimestamp();
      
      await updateDoc(paymentDoc, updateData);
      
      // Log activity
      await addDoc(collection(db, 'activities'), {
        activityType: 'payment_updated',
        description: `تم تحديث بيانات الدفعة بتاريخ ${new Date(paymentData.paymentDate || existingData.paymentDate.toDate()).toLocaleDateString()}`,
        entityId: paymentId,
        entityType: 'payment',
        timestamp: serverTimestamp()
      });
      
      await fetchPayments(); // Refresh the list
    } catch (err: any) {
      console.error('Error updating payment:', err);
      throw err;
    }
  };

  const deletePayment = async (paymentId: string) => {
    try {
      const paymentDoc = doc(db, 'payments', paymentId);
      const snapshot = await getDoc(paymentDoc);
      
      if (!snapshot.exists()) {
        throw new Error('Payment not found');
      }
      
      const paymentData = snapshot.data();
      
      // Restore client balance
      const clientDoc = doc(db, 'clients', paymentData.clientId);
      const clientSnapshot = await getDoc(clientDoc);
      
      if (clientSnapshot.exists()) {
        const clientData = clientSnapshot.data();
        await updateDoc(clientDoc, {
          balance: (clientData.balance || 0) + Number(paymentData.amount)
        });
      }
      
      // Get client's invoices
      const invoicesRef = collection(db, 'invoices');
      const q = query(
        invoicesRef,
        where('clientId', '==', paymentData.clientId)
      );
      
      const invoiceSnapshot = await getDocs(q);
      
      // Reset all invoices to unpaid status
      for (const invoiceDoc of invoiceSnapshot.docs) {
        await updateDoc(doc(db, 'invoices', invoiceDoc.id), {
          paidAmount: 0,
          status: 'open'
        });
      }
      
      // Get all other payments except this one
      const paymentsRef = collection(db, 'payments');
      const pq = query(
        paymentsRef,
        where('clientId', '==', paymentData.clientId),
        orderBy('paymentDate')
      );
      
      const paymentSnapshot = await getDocs(pq);
      const otherPayments = paymentSnapshot.docs
        .filter(doc => doc.id !== paymentId)
        .map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Reapply all other payments
      for (const otherPayment of otherPayments) {
        let remainingAmount = otherPayment.amount;
        
        // Get updated invoice list and sort by date
        const updatedInvoiceSnapshot = await getDocs(q);
        const invoices = updatedInvoiceSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => a.invoiceDate.toMillis() - b.invoiceDate.toMillis());
        
        // Apply payment to invoices
        for (const invoice of invoices) {
          if (remainingAmount <= 0) break;
          
          const amountDue = invoice.totalAmount - invoice.paidAmount;
          const amountToApply = Math.min(amountDue, remainingAmount);
          
          if (amountToApply > 0) {
            const newPaidAmount = invoice.paidAmount + amountToApply;
            const newStatus = newPaidAmount >= invoice.totalAmount ? 'paid' : 'partial';
            
            await updateDoc(doc(db, 'invoices', invoice.id), {
              paidAmount: newPaidAmount,
              status: newStatus
            });
            
            remainingAmount -= amountToApply;
          }
        }
      }
      
      // Delete payment
      await deleteDoc(paymentDoc);
      
      // Log activity
      await addDoc(collection(db, 'activities'), {
        activityType: 'payment_deleted',
        description: `تم حذف دفعة بقيمة ${paymentData.amount}`,
        entityId: paymentId,
        entityType: 'payment',
        timestamp: serverTimestamp()
      });
      
      await fetchPayments(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting payment:', err);
      throw err;
    }
  };

  // Load payments on initial render
  useEffect(() => {
    fetchPayments();
  }, []);

  return {
    payments,
    loading,
    error,
    fetchPayments,
    fetchClientPayments,
    getPayment,
    addPayment,
    updatePayment,
    deletePayment
  };
}
