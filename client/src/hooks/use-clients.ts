import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

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
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      console.log('Fetching clients from API...');
      try {
        const response = await fetch('/api/clients', {
          credentials: 'include', // Include cookies for authentication
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.error('Failed to fetch clients', response.status, response.statusText);
          throw new Error(`Failed to fetch clients: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Client data received:', data.length ? `${data.length} clients` : 'empty array', data);
        return data;
      } catch (err) {
        console.error('Client fetch error:', err);
        throw err;
      }
    },
    retry: 2,
    refetchOnWindowFocus: true
  });

  const addClient = useMutation({
    mutationFn: async (clientData: ClientFormData) => {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
        credentials: 'include' // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error('Failed to add client');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ClientFormData> }) => {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include' // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error('Failed to update client');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
  });

  const uploadClients = useMutation({
    mutationFn: async (data: any[]) => {
      const response = await fetch('/api/clients/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
        credentials: 'include' // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error('Failed to upload clients');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        credentials: 'include' // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
  });

  return {
    clients,
    isLoading,
    addClient,
    updateClient,
    uploadClients,
    deleteClient
  };
}