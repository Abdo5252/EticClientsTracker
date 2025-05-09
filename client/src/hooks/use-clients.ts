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
      const response = await fetch('/api/clients');
      if (!response.ok) {
        console.error('Failed to fetch clients', response.status, response.statusText);
        throw new Error('Failed to fetch clients');
      }
      const data = await response.json();
      console.log('Client data received:', data);
      return data;
    },
    retry: 1,
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