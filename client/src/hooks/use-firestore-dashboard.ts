
import { useState } from 'react';
import { 
  collection, getDocs, query, orderBy, limit, where, Timestamp
} from 'firebase/firestore';
import { db } from '../../../server/firebase';

export function useFirestoreDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const todayStart = Timestamp.fromDate(today);
      const todayEnd = Timestamp.fromDate(new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1));
      const yesterdayStart = Timestamp.fromDate(yesterday);
      const yesterdayEnd = Timestamp.fromDate(new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1));
      
      // Get today's invoices
      const invoicesRef = collection(db, 'invoices');
      const todayInvoicesQuery = query(
        invoicesRef,
        where('invoiceDate', '>=', todayStart),
        where('invoiceDate', '<=', todayEnd)
      );
      
      const yesterdayInvoicesQuery = query(
        invoicesRef,
        where('invoiceDate', '>=', yesterdayStart),
        where('invoiceDate', '<=', yesterdayEnd)
      );
      
      const [todayInvoicesSnapshot, yesterdayInvoicesSnapshot] = await Promise.all([
        getDocs(todayInvoicesQuery),
        getDocs(yesterdayInvoicesQuery)
      ]);
      
      // Get today's payments
      const paymentsRef = collection(db, 'payments');
      const todayPaymentsQuery = query(
        paymentsRef,
        where('paymentDate', '>=', todayStart),
        where('paymentDate', '<=', todayEnd)
      );
      
      const yesterdayPaymentsQuery = query(
        paymentsRef,
        where('paymentDate', '>=', yesterdayStart),
        where('paymentDate', '<=', yesterdayEnd)
      );
      
      const [todayPaymentsSnapshot, yesterdayPaymentsSnapshot] = await Promise.all([
        getDocs(todayPaymentsQuery),
        getDocs(yesterdayPaymentsQuery)
      ]);
      
      // Calculate totals
      const totalSalesToday = todayInvoicesSnapshot.docs.reduce(
        (sum, doc) => sum + doc.data().totalAmount, 0
      );
      
      const totalSalesYesterday = yesterdayInvoicesSnapshot.docs.reduce(
        (sum, doc) => sum + doc.data().totalAmount, 0
      );
      
      const totalPaymentsToday = todayPaymentsSnapshot.docs.reduce(
        (sum, doc) => sum + doc.data().amount, 0
      );
      
      const totalPaymentsYesterday = yesterdayPaymentsSnapshot.docs.reduce(
        (sum, doc) => sum + doc.data().amount, 0
      );
      
      // Get overdue clients
      const clientsRef = collection(db, 'clients');
      const overdueClientsQuery = query(
        clientsRef,
        where('balance', '>', 0)
      );
      
      const overdueSnapshot = await getDocs(overdueClientsQuery);
      
      // Get recent activities
      const activitiesRef = collection(db, 'activities');
      const activitiesQuery = query(
        activitiesRef,
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      
      const activitiesSnapshot = await getDocs(activitiesQuery);
      
      // Get top clients by balance
      const topClientsQuery = query(
        clientsRef,
        orderBy('balance', 'desc'),
        limit(5)
      );
      
      const topClientsSnapshot = await getDocs(topClientsQuery);
      
      const dashboardData = {
        totalSalesToday,
        totalSalesYesterday,
        totalSalesChange: totalSalesYesterday > 0 
          ? (totalSalesToday - totalSalesYesterday) / totalSalesYesterday * 100 
          : 0,
        totalPaymentsToday,
        totalPaymentsYesterday,
        totalPaymentsChange: totalPaymentsYesterday > 0 
          ? (totalPaymentsToday - totalPaymentsYesterday) / totalPaymentsYesterday * 100 
          : 0,
        invoiceCount: todayInvoicesSnapshot.size,
        overdueClientsCount: overdueSnapshot.size,
        recentActivities: activitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        })),
        topClients: topClientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
      
      setError(null);
      return dashboardData;
    } catch (err: any) {
      const errorMessage = 'Error fetching dashboard data: ' + err.message;
      setError(errorMessage);
      console.error(errorMessage, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchDashboardData
  };
}
