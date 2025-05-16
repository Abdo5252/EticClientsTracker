import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFirestoreClients } from './use-firestore-clients';

export interface ClientFormData {
  clientCode: string;
  clientName: string;
  salesRepName?: string;
  currency?: string;
}

export interface Client extends ClientFormData {
  id: string;
  balance: number;
  createdAt?: Date;
}

export function useClients() {
  const queryClient = useQueryClient();
  const { 
    clients, 
    loading, 
    error, 
    fetchClients, 
    getClient, 
    addClient, 
    updateClient, 
    deleteClient 
  } = useFirestoreClients();

  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
    refetchOnWindowFocus: true
  });

  const addClientMutation = useMutation({
    mutationFn: addClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientFormData> }) => {
      return updateClient(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  return {
    clients: clients || [],
    isLoading: loading || clientsQuery.isLoading,
    isError: error || clientsQuery.isError,
    error: clientsQuery.error,
    addClient: addClientMutation.mutate,
    updateClient: updateClientMutation.mutate,
    deleteClient: deleteClientMutation.mutate,
    refetch: fetchClients
  };
}