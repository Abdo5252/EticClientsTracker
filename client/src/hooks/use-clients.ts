import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import clientsData from '../../../clients-data.json';

type Client = {
  id: number;
  clientCode: string;
  clientName: string;
  salesRepName: string;
  balance: number;
  currency: string;
};

type ClientFormData = {
  clientCode: string;
  clientName: string;
  salesRepName: string;
  currency: string;
};

export function useClients() {
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients-data'],
    queryFn: async () => {
      console.log('Loading clients from local JSON file...');
      try {
        // Format the data from the JSON file
        const formattedClients = clientsData.map((client, index) => ({
          id: index + 1,
          clientCode: String(client.CODE || "").trim(),
          clientName: String(client['CUSTOMER NAME'] || "").trim(),
          salesRepName: "", // Default empty string as salesRepName is not in the JSON
          balance: 0, // Default balance
          currency: "EGP" // Default currency
        }));

        console.log('Client data loaded:', formattedClients.length ? `${formattedClients.length} clients` : 'empty array');
        return formattedClients;
      } catch (err) {
        console.error('Client load error:', err);
        throw err;
      }
    },
    retry: 2,
    refetchOnWindowFocus: false // We don't need to refetch since the JSON file doesn't change during runtime
  });

  // These mutations are no longer making actual API calls, they're just updating the in-memory state
  // In a real implementation, you might want to replace these with local state management
  const addClient = useMutation({
    mutationFn: async (clientData: ClientFormData) => {
      console.log('Adding client locally:', clientData);
      return { id: (clients?.length || 0) + 1, ...clientData, balance: 0 };
    },
    onSuccess: (newClient) => {
      queryClient.setQueryData(['clients-data'], (old: any) => [...(old || []), newClient]);
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ClientFormData> }) => {
      console.log('Updating client locally:', id, data);
      return { id, ...data };
    },
    onSuccess: (updatedClient) => {
      queryClient.setQueryData(['clients-data'], (old: any) => 
        old ? old.map((client: Client) => client.id === updatedClient.id ? { ...client, ...updatedClient } : client) : []
      );
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: number) => {
      console.log('Deleting client locally:', id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(['clients-data'], (old: any) => 
        old ? old.filter((client: Client) => client.id !== id) : []
      );
    },
  });

  return {
    clients,
    isLoading,
    addClient,
    updateClient,
    deleteClient
  };
}