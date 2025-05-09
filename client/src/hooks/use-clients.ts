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
        if (!clientsData || !Array.isArray(clientsData) || clientsData.length === 0) {
          console.error('Invalid or empty clients data:', clientsData);
          return [];
        }
        
        // Logging sample client data for debugging
        if (clientsData.length > 0) {
          console.log('Client data sample:', clientsData[0]);
          console.log('Available fields:', Object.keys(clientsData[0]));
        }
        
        // Format the data from the JSON file with more flexible field matching
        const formattedClients = clientsData.map((client, index) => {
          // Helper function for field extraction with multiple possible field names
          const getField = (fieldOptions: string[], defaultValue: string = ""): string => {
            for (const field of fieldOptions) {
              if (client[field] !== undefined && client[field] !== null) {
                return String(client[field]).trim();
              }
            }
            return defaultValue;
          };
          
          return {
            id: index + 1,
            clientCode: getField(['CODE', 'Client Code', 'ClientCode', 'Customer Code', 'CustomerCode', 'رمز العميل', 'كود']),
            clientName: getField(['CUSTOMER NAME', 'Customer Name', 'CustomerName', 'Client Name', 'ClientName', 'اسم العميل', 'الاسم']),
            salesRepName: getField(['SALES REP', 'Sales Rep', 'SalesRep', 'مندوب المبيعات', 'مندوب'], ""),
            balance: 0, // Default balance
            currency: getField(['Currency', 'عملة'], "EGP") // Default currency
          };
        }).filter(client => client.clientCode || client.clientName); // Filter out completely empty records

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