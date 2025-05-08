import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: number;
  clientCode: string;
  clientName: string;
  salesRepName: string;
  balance: number;
  currency: string;
}

interface ClientInput {
  clientCode: string;
  clientName: string;
  salesRepName: string;
  currency: string;
}

export function useClients() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all clients
  const { data: clients, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Get a specific client
  const getClient = (id: number) => {
    return useQuery({
      queryKey: ['/api/clients', id],
      enabled: !!id,
    });
  };

  // Create a new client
  const createClient = useMutation({
    mutationFn: async (client: ClientInput) => {
      const res = await apiRequest('POST', '/api/clients', client);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/clients']});
      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة العميل بنجاح',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة العميل',
        variant: 'destructive',
      });
    },
  });

  // Update an existing client
  const updateClient = useMutation({
    mutationFn: async ({ id, client }: { id: number; client: Partial<ClientInput> }) => {
      const res = await apiRequest('PUT', `/api/clients/${id}`, client);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({queryKey: ['/api/clients']});
      queryClient.invalidateQueries({queryKey: ['/api/clients', variables.id]});
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث بيانات العميل بنجاح',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث بيانات العميل',
        variant: 'destructive',
      });
    },
  });

  // Delete a client
  const deleteClient = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/clients/${id}`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/clients']});
      toast({
        title: 'تم بنجاح',
        description: 'تم حذف العميل بنجاح',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء حذف العميل',
        variant: 'destructive',
      });
    },
  });

  // Upload client data (Excel)
  const uploadClients = useMutation({
    mutationFn: async (data: any[]) => {
      const res = await apiRequest('POST', '/api/clients/upload', { data });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({queryKey: ['/api/clients']});
      toast({
        title: 'تم بنجاح',
        description: `تم إضافة ${data.success} عميل بنجاح${data.failed > 0 ? ` وفشل إضافة ${data.failed} عميل` : ''}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء رفع بيانات العملاء',
        variant: 'destructive',
      });
    },
  });

  return {
    clients,
    isLoading,
    error,
    refetch,
    getClient,
    createClient,
    updateClient,
    deleteClient,
    uploadClients,
  };
}
