import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all settings
  const { data: settings, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/settings'],
  });

  // Create or update settings
  const updateSettings = useMutation({
    mutationFn: async (settingsData: any[]) => {
      // Update each setting individually
      const promises = settingsData.map(async (setting) => {
        const res = await apiRequest('POST', '/api/settings', setting);
        return res.json();
      });
      
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/settings']});
      toast({
        title: 'تم بنجاح',
        description: 'تم حفظ الإعدادات بنجاح',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ الإعدادات',
        variant: 'destructive',
      });
    },
  });

  return {
    settings,
    isLoading,
    error,
    refetch,
    updateSettings,
  };
}
