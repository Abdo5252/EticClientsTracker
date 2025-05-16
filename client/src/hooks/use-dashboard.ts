import { useQuery } from '@tanstack/react-query';
import { useFirestoreDashboard } from './use-firestore-dashboard';

export function useDashboard() {
  const { loading, error, fetchDashboardData } = useFirestoreDashboard();

  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
    refetchOnWindowFocus: true
  });

  return {
    dashboardData: dashboardQuery.data,
    isLoading: loading || dashboardQuery.isLoading,
    isError: error || dashboardQuery.isError,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch
  };
}