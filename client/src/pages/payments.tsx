import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { usePayments } from "@/hooks/use-payments";
import { t } from "@/lib/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getPaymentMethodText } from "@/lib/utils";
import { 
  PlusCircle, 
  Search, 
  CreditCard, 
  Receipt, 
  FileText,
  Download,
  Filter,
  Clock,
  DollarSign,
  Calendar,
  User,
  CheckCircle2,
  ArrowDownUp
} from "lucide-react";

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const { payments, isLoading } = usePayments();
  
  // Calculate total payments amount
  const totalPaymentsAmount = payments ? 
    payments.reduce((total, payment) => total + payment.amount, 0) : 0;
  
  // Filter payments by search query
  const filteredPayments = payments ? 
    payments.filter(payment => 
      payment.clientId.toString().includes(searchQuery) ||
      payment.paymentMethod.includes(searchQuery.toLowerCase()) ||
      payment.amount.toString().includes(searchQuery)
    ) : [];
  
  // Calculate current month payments
  const currentMonthPayments = payments ? 
    payments
      .filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        const now = new Date();
        return paymentDate.getMonth() === now.getMonth() && 
              paymentDate.getFullYear() === now.getFullYear();
      })
      .reduce((total, payment) => total + payment.amount, 0) : 0;
  
  // Find most common payment method
  const getMostCommonPaymentMethod = () => {
    if (!payments || payments.length === 0) return "-";
    
    const methodCounts: Record<string, number> = {};
    payments.forEach(payment => {
      methodCounts[payment.paymentMethod] = (methodCounts[payment.paymentMethod] || 0) + 1;
    });
    
    let mostCommonMethod = "";
    let highestCount = 0;
    
    Object.entries(methodCounts).forEach(([method, count]) => {
      if (count > highestCount) {
        mostCommonMethod = method;
        highestCount = count;
      }
    });
    
    return getPaymentMethodText(mostCommonMethod);
  };
  
  return (
    <Layout title={t('payments.title')}>
      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">إجمالي المدفوعات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 space-x-reverse">
                <DollarSign className="h-10 w-10 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(totalPaymentsAmount, 'EGP')}</div>
                  <div className="text-sm text-gray-500">الإجمالي</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">عدد المدفوعات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Receipt className="h-10 w-10 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{payments?.length || 0}</div>
                  <div className="text-sm text-gray-500">سجل دفع</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">مدفوعات الشهر الحالي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Calendar className="h-10 w-10 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(currentMonthPayments, 'EGP')}
                  </div>
                  <div className="text-sm text-gray-500">هذا الشهر</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">طريقة الدفع الشائعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 space-x-reverse">
                {payments && payments.length > 0 ? (
                  <>
                    <CreditCard className="h-10 w-10 text-amber-600" />
                    <div>
                      <div className="text-xl font-bold">
                        {getMostCommonPaymentMethod()}
                      </div>
                      <div className="text-sm text-gray-500">الأكثر استخداماً</div>
                    </div>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-10 w-10 text-gray-400" />
                    <div>
                      <div className="text-xl font-bold">-</div>
                      <div className="text-sm text-gray-500">لا توجد بيانات</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content - Payment Form and List */}
        <Card>
          <Tabs defaultValue={isAddingPayment ? "add" : "list"} className="w-full">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div>
                  <CardTitle>{t('payments.title')}</CardTitle>
                  <CardDescription>إدارة مدفوعات العملاء وسجل الدفع</CardDescription>
                </div>
                
                <TabsList className="mt-3 md:mt-0">
                  <TabsTrigger value="list" onClick={() => setIsAddingPayment(false)}>
                    <FileText className="h-4 w-4 ml-2" />
                    سجل المدفوعات
                  </TabsTrigger>
                  <TabsTrigger value="add" onClick={() => setIsAddingPayment(true)}>
                    <PlusCircle className="h-4 w-4 ml-2" />
                    إضافة دفعة
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {!isAddingPayment && (
                <div className="mt-3">
                  <div className="relative">
                    <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="بحث في المدفوعات..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
              )}
            </CardHeader>
            
            {/* Payments List Tab */}
            <TabsContent value="list" className="mt-0">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <div className="text-md text-gray-500">{t('common.loading')}</div>
                  </div>
                ) : payments && payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-y">
                          <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <span>رقم العميل</span>
                              <ArrowDownUp className="ml-1 h-3 w-3" />
                            </div>
                          </th>
                          <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <span>المبلغ</span>
                              <ArrowDownUp className="ml-1 h-3 w-3" />
                            </div>
                          </th>
                          <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <span>تاريخ الدفع</span>
                              <ArrowDownUp className="ml-1 h-3 w-3" />
                            </div>
                          </th>
                          <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <span>طريقة الدفع</span>
                              <Filter className="ml-1 h-3 w-3" />
                            </div>
                          </th>
                          <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <span>رقم المرجع</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredPayments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <User className="h-4 w-4 text-gray-400" />
                                <span>{payment.clientId}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <DollarSign className="h-4 w-4 text-green-500" />
                                <span>{formatCurrency(payment.amount, payment.currency)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{formatDate(payment.paymentDate)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <Badge variant="outline" className={
                                payment.paymentMethod === 'cash' ? 'bg-green-50 text-green-700 border-green-200' :
                                payment.paymentMethod === 'transfer' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                payment.paymentMethod === 'check' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-purple-50 text-purple-700 border-purple-200'
                              }>
                                {getPaymentMethodText(payment.paymentMethod)}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.paymentMethod === 'check' && payment.checkNumber ? (
                                <span className="text-gray-900">شيك #{payment.checkNumber}</span>
                              ) : payment.paymentMethod === 'transfer' && payment.transactionId ? (
                                <span className="text-gray-900">تحويل #{payment.transactionId}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                      <CreditCard className="w-full h-full" />
                    </div>
                    <div className="text-lg text-gray-500 mb-1">{t('common.noData')}</div>
                    <div className="text-sm text-gray-400 mb-6">لا توجد مدفوعات مسجلة</div>
                    <Button onClick={() => setIsAddingPayment(true)}>
                      <PlusCircle className="h-4 w-4 ml-1" />
                      <span>تسجيل الدفعة الأولى</span>
                    </Button>
                  </div>
                )}
              </CardContent>
              
              {payments && payments.length > 0 && (
                <CardFooter className="border-t py-4 justify-between">
                  <div className="text-sm text-gray-500">
                    {filteredPayments.length} من {payments.length} مدفوعات
                  </div>
                  
                  <div className="flex space-x-2 space-x-reverse">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 ml-1" />
                      <span>تصدير البيانات</span>
                    </Button>
                  </div>
                </CardFooter>
              )}
            </TabsContent>
            
            {/* Add Payment Tab */}
            <TabsContent value="add" className="mt-0">
              <CardContent>
                <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="bg-blue-100 p-2 rounded-full mt-1">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-800">تسجيل دفعة جديدة</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        يرجى إدخال المعلومات المطلوبة أدناه لتسجيل دفعة يدوية جديدة. سيتم تحديث رصيد العميل تلقائياً بعد تسجيل الدفعة.
                      </p>
                    </div>
                  </div>
                </div>
                
                <PaymentForm />
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </Layout>
  );
}
