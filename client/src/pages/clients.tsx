import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { ClientForm } from "@/components/clients/ClientForm";
import { useClients } from "@/hooks/use-clients";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { 
  Search, 
  Users, 
  UserPlus, 
  Filter, 
  SlidersHorizontal, 
  DownloadCloud, 
  Mail, 
  ChevronDown,
  PlusCircle,
  FileText,
  ClipboardList,
  CreditCard
} from "lucide-react";

export default function Clients() {
  const { clients, isLoading, deleteClient } = useClients();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editClientId, setEditClientId] = useState<number | null>(null);
  const [deleteClientId, setDeleteClientId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<"all" | "active" | "inactive">("all");
  const [currency, setCurrency] = useState<"all" | "EGP" | "USD" | "EUR">("all");
  const [sortBy, setSortBy] = useState<"name" | "code" | "balance">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedClient, setSelectedClient] = useState<number | null>(null);

  // Reset search when unmounting
  useEffect(() => {
    return () => {
      setSearchQuery("");
    };
  }, []);

  // Debug client data
  console.log("Clients page - Raw clients data:", clients);
  
  // Filter and sort clients
  const filteredAndSortedClients = clients ? 
    clients
      // Filter by search
      .filter(client => 
        client.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.clientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.salesRepName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      // Filter by currency
      .filter(client => currency === "all" || client.currency === currency)
      // Filter by status (active = has balance, inactive = no balance)
      .filter(client => {
        if (selectedView === "all") return true;
        if (selectedView === "active") return client.balance > 0;
        if (selectedView === "inactive") return client.balance <= 0;
        return true;
      })
      // Sort clients
      .sort((a, b) => {
        if (sortBy === "name") {
          return sortDirection === "asc" 
            ? a.clientName.localeCompare(b.clientName) 
            : b.clientName.localeCompare(a.clientName);
        } else if (sortBy === "code") {
          return sortDirection === "asc" 
            ? a.clientCode.localeCompare(b.clientCode) 
            : b.clientCode.localeCompare(a.clientCode);
        } else { // balance
          return sortDirection === "asc" 
            ? a.balance - b.balance 
            : b.balance - a.balance;
        }
      })
    : [];

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

  const toggleSort = (field: "name" | "code" | "balance") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  // Find the selected client details
  const selectedClientDetails = selectedClient && clients 
    ? clients.find(client => client.id === selectedClient) 
    : null;

  const totalClients = clients?.length || 0;
  const activeClients = clients?.filter(client => client.balance > 0).length || 0;
  const inactiveClients = totalClients - activeClients;

  return (
    <Layout title={t('clients.title')}>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">إجمالي العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Users className="h-10 w-10 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{totalClients}</div>
                  <div className="text-sm text-gray-500">عميل</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">العملاء النشطين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 space-x-reverse">
                <UserPlus className="h-10 w-10 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{activeClients}</div>
                  <div className="text-sm text-gray-500">عميل نشط</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">العملاء غير النشطين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Users className="h-10 w-10 text-gray-400" />
                <div>
                  <div className="text-2xl font-bold">{inactiveClients}</div>
                  <div className="text-sm text-gray-500">عميل غير نشط</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">إجمالي الأرصدة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 space-x-reverse">
                <CreditCard className="h-10 w-10 text-amber-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(clients?.reduce((sum, client) => sum + client.balance, 0) || 0, 'EGP')}
                  </div>
                  <div className="text-sm text-gray-500">رصيد مستحق</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{t('clients.title')}</CardTitle>
                  <div className="flex space-x-2 space-x-reverse">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <PlusCircle className="h-4 w-4 ml-1" />
                          <span>إضافة</span>
                          <ChevronDown className="h-4 w-4 mr-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsAddDialogOpen(true)}>
                          <UserPlus className="h-4 w-4 ml-2" />
                          <span>إضافة عميل جديد</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <DownloadCloud className="h-4 w-4 ml-2" />
                          <span>استيراد العملاء</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                      className={isFiltersOpen ? "bg-blue-50 border-blue-200" : ""}
                    >
                      <Filter className="h-4 w-4 ml-1" />
                      <span>تصفية</span>
                    </Button>
                  </div>
                </div>
                <CardDescription>إدارة وتنظيم قائمة العملاء</CardDescription>
                
                {/* Search and Filters */}
                <div className="mt-2">
                  <div className="relative">
                    <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="بحث بالاسم أو الكود أو الممثل التجاري..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  {isFiltersOpen && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm text-gray-500 block mb-1">عرض العملاء</span>
                        <Select value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="كل العملاء" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">كل العملاء</SelectItem>
                            <SelectItem value="active">العملاء النشطين</SelectItem>
                            <SelectItem value="inactive">العملاء غير النشطين</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500 block mb-1">العملة</span>
                        <Select value={currency} onValueChange={(value: any) => setCurrency(value)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="كل العملات" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">كل العملات</SelectItem>
                            <SelectItem value="EGP">جنيه مصري</SelectItem>
                            <SelectItem value="USD">دولار أمريكي</SelectItem>
                            <SelectItem value="EUR">يورو</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500 block mb-1">الترتيب</span>
                        <Select 
                          value={`${sortBy}-${sortDirection}`} 
                          onValueChange={(value) => {
                            const [field, direction] = value.split('-');
                            setSortBy(field as any);
                            setSortDirection(direction as any);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="الترتيب" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name-asc">الاسم (تصاعدي)</SelectItem>
                            <SelectItem value="name-desc">الاسم (تنازلي)</SelectItem>
                            <SelectItem value="code-asc">الكود (تصاعدي)</SelectItem>
                            <SelectItem value="code-desc">الكود (تنازلي)</SelectItem>
                            <SelectItem value="balance-asc">الرصيد (تصاعدي)</SelectItem>
                            <SelectItem value="balance-desc">الرصيد (تنازلي)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  {searchQuery && (
                    <div className="mt-2 text-sm text-gray-500">
                      تم العثور على {filteredAndSortedClients.length} من أصل {clients?.length} عميل
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <Tabs defaultValue="table" className="w-full">
                  <div className="px-6 border-b">
                    <TabsList className="w-full justify-start">
                      <TabsTrigger value="table" className="flex-grow-0">
                        <ClipboardList className="h-4 w-4 ml-1" />
                        جدول
                      </TabsTrigger>
                      <TabsTrigger value="cards" className="flex-grow-0">
                        <Users className="h-4 w-4 ml-1" />
                        بطاقات
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="table" className="m-0">
                    <ClientsTable 
                      clients={filteredAndSortedClients} 
                      isLoading={isLoading} 
                      onEdit={handleEdit} 
                      onDelete={handleDelete}
                      onSelectClient={setSelectedClient}
                    />
                  </TabsContent>
                  
                  <TabsContent value="cards" className="m-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 p-6">
                      {filteredAndSortedClients.length > 0 ? (
                        filteredAndSortedClients.map(client => (
                          <Card key={client.id} 
                            className={`cursor-pointer hover:border-primary transition-colors ${
                              selectedClient === client.id ? 'border-primary ring-1 ring-primary' : ''
                            }`}
                            onClick={() => setSelectedClient(client.id)}
                          >
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex justify-between">
                                <div className="truncate">{client.clientName}</div>
                                <Badge variant="outline">{client.clientCode}</Badge>
                              </CardTitle>
                              <CardDescription className="flex justify-between">
                                <span>{client.salesRepName}</span>
                                <span className="text-gray-500">{client.currency}</span>
                              </CardDescription>
                            </CardHeader>
                            <CardFooter className="pt-0 pb-3 flex justify-between">
                              <span className="text-sm text-gray-500">الرصيد:</span>
                              <span className={`font-medium ${client.balance > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                                {formatCurrency(client.balance, client.currency)}
                              </span>
                            </CardFooter>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-12 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p className="mb-2">لا توجد بيانات متطابقة</p>
                          <p className="text-sm">جرّب تغيير معايير البحث أو التصفية</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              
              <CardFooter className="justify-between border-t p-4">
                <div className="text-sm text-gray-500">
                  {filteredAndSortedClients.length} من {clients?.length || 0} عميل
                </div>
                
                <div className="flex space-x-2 space-x-reverse">
                  <Button variant="outline" size="sm" className="text-primary">
                    <DownloadCloud className="h-4 w-4 ml-1" />
                    <span>تصدير القائمة</span>
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 ml-1" />
                    <span>إرسال التقرير</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          {/* Client Details Panel */}
          <div className="lg:col-span-1">
            {selectedClientDetails ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedClientDetails.clientName}</CardTitle>
                  <CardDescription>
                    <div className="flex justify-between">
                      <span>كود العميل: {selectedClientDetails.clientCode}</span>
                      <Badge variant="outline" className={`
                        ${selectedClientDetails.balance > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}
                      `}>
                        {selectedClientDetails.balance > 0 ? 'مستحق' : 'سداد كامل'}
                      </Badge>
                    </div>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="border-t border-b py-3">
                    <h3 className="text-lg font-medium mb-2">معلومات العميل</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">الممثل التجاري:</dt>
                        <dd>{selectedClientDetails.salesRepName}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">العملة:</dt>
                        <dd>{selectedClientDetails.currency}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">الرصيد الحالي:</dt>
                        <dd className={`font-medium ${selectedClientDetails.balance > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                          {formatCurrency(selectedClientDetails.balance, selectedClientDetails.currency)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">الإجراءات</h3>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start" 
                        onClick={() => handleEdit(selectedClientDetails.id)}
                      >
                        <SlidersHorizontal className="h-4 w-4 ml-2" />
                        تعديل بيانات العميل
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 ml-2" />
                        عرض تقرير العميل
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start">
                        <CreditCard className="h-4 w-4 ml-2" />
                        تسجيل دفعة جديدة
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-red-600 hover:bg-red-50" 
                        onClick={() => handleDelete(selectedClientDetails.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        حذف العميل
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center p-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">معلومات العميل</h3>
                  <p className="text-gray-500 mb-6">اختر عميلاً من القائمة لعرض التفاصيل</p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 ml-1" />
                    إضافة عميل جديد
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
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
