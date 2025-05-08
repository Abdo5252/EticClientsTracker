import { useQuery } from '@tanstack/react-query';

export function useDashboard() {
  // Fetch dashboard data
  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/dashboard'],
  });

  return {
    dashboardData,
    isLoading,
    error,
    refetch,
  };
}
