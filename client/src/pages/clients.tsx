import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { ClientForm } from "@/components/clients/ClientForm";
import { useClients } from "@/hooks/use-clients";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

export default function Clients() {
  const { clients, isLoading, deleteClient } = useClients();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editClientId, setEditClientId] = useState<number | null>(null);
  const [deleteClientId, setDeleteClientId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter clients based on search query
  const filteredClients = clients ? clients.filter(client => 
    client.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.clientCode.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleEdit = (clientId: number) => {
    setEditClientId(clientId);
  };

  const handleDelete = (clientId: number) => {
    setDeleteClientId(clientId);
  };

  const confirmDelete = async () => {
    if (deleteClientId) {
      await deleteClient.mutateAsync(deleteClientId);
      setDeleteClientId(null);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{t('clients.title')}</h2>
            <div className="flex space-x-2 space-x-reverse">
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700"
              >
                <i className="ri-add-line ml-1"></i>
                <span>{t('clients.addClient')}</span>
              </Button>
              <Button 
                variant="outline" 
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <i className="ri-filter-3-line ml-1"></i>
                <span>{t('common.filter')}</span>
              </Button>
            </div>
          </div>
          
          <div className="mb-4">
            <Input
              placeholder={t('clients.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <ClientsTable 
            clients={filteredClients} 
            isLoading={isLoading} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        </div>
      </div>
      
      {/* Add Client Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('clients.addClient')}</DialogTitle>
          </DialogHeader>
          <ClientForm onSuccess={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Client Dialog */}
      <Dialog open={!!editClientId} onOpenChange={(open) => !open && setEditClientId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('common.edit')}</DialogTitle>
          </DialogHeader>
          {editClientId && (
            <ClientForm clientId={editClientId} onSuccess={() => setEditClientId(null)} />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteClientId} onOpenChange={(open) => !open && setDeleteClientId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('clients.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
