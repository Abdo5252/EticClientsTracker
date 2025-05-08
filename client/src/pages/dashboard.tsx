import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@/lib/i18n";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { AlertItem } from "@/components/dashboard/AlertItem";
import { ClientItem } from "@/components/dashboard/ClientItem";
import { Layout } from "@/components/layout/Layout";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Eye, 
  CreditCard, 
  FileText,
  Bell,
  Users,
  DollarSign,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today");
  
  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard', selectedPeriod],
  });

  if (isLoading) {
    return (
      <Layout title={t('dashboard.title')}>
        <div className="flex justify-center items-center p-8">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
            <div className="text-lg">{t('common.loading')}</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !dashboardData) {
    return (
      <Layout title={t('dashboard.title')}>
        <div className="flex justify-center items-center p-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            <div className="flex items-center space-x-2 space-x-reverse font-medium">
              <Bell className="h-5 w-5" />
              <div>{t('common.error')}</div>
            </div>
            <div className="mt-1 text-sm">تعذر تحميل بيانات لوحة التحكم. يرجى المحاولة مرة أخرى.</div>
          </div>
        </div>
      </Layout>
    );
  }

  const {
    totalSalesToday,
    totalSalesChange,
    totalPaymentsToday,
    totalPaymentsChange,
    invoiceCount,
    overdueClientsCount,
    recentActivities,
    topClients,
    salesByMonth = [],
    paymentsByMethod = []
  } = dashboardData;

  // Calculate remaining balance
  const remainingBalance = totalSalesToday - totalPaymentsToday;
  
  // Prepare chart data
  const pieChartData = paymentsByMethod.map(item => ({
    name: item.name === 'cash' ? 'نقداً' : 
          item.name === 'transfer' ? 'تحويل بنكي' : 
          item.name === 'check' ? 'شيك' : 
          item.name === 'card' ? 'بطاقة ائتمان' : item.name,
    value: item.value
  }));
  
  const COLORS = ['#1E3A8A', '#0090E7', '#FFB545', '#FF4850', '#42B883'];

  return (
    <Layout title={t('dashboard.title')}>
      <div className="p-6">
        {/* Dashboard Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('dashboard.welcome')}</h1>
            <div className="text-sm text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 ml-1" />
              {new Date().toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
          
          <div className="flex mt-3 md:mt-0 space-x-2 space-x-reverse">
            <Button variant="outline" size="sm" onClick={() => setSelectedPeriod("today")} 
              className={selectedPeriod === "today" ? "bg-blue-50" : ""}
            >
              اليوم
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedPeriod("week")}
              className={selectedPeriod === "week" ? "bg-blue-50" : ""}
            >
              هذا الأسبوع
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedPeriod("month")}
              className={selectedPeriod === "month" ? "bg-blue-50" : ""}
            >
              هذا الشهر
            </Button>
          </div>
        </div>
        
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title={t('dashboard.cards.totalSales')}
            value={totalSalesToday}
            currency={t('common.currency.EGP')}
            icon="ri-shopping-bag-line"
            color="primary"
            change={totalSalesChange}
          />
          
          <DashboardCard
            title={t('dashboard.cards.totalPayments')}
            value={totalPaymentsToday}
            currency={t('common.currency.EGP')}
            icon="ri-money-dollar-circle-line"
            color="secondary"
            change={totalPaymentsChange}
          />
          
          <DashboardCard
            title={t('dashboard.cards.overdueClients')}
            value={overdueClientsCount}
            unit={t('dashboard.cards.client')}
            icon="ri-time-line"
            color="warning"
          />
          
          <DashboardCard
            title={t('dashboard.cards.totalInvoices')}
            value={invoiceCount}
            unit={t('dashboard.cards.invoice')}
            icon="ri-file-list-3-line"
            color="success"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-6">
          {/* Sales Analytics Chart */}
          <Card className="lg:col-span-5">
            <CardHeader className="pb-2">
              <CardTitle>تحليل المبيعات والمدفوعات</CardTitle>
              <CardDescription>
                نظرة عامة على المبيعات والمدفوعات عبر الأشهر
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesByMonth}
                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickLine={false}
                      tickFormatter={(value) => `${value} ج.م`}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} ج.م`, undefined]}
                      labelFormatter={(label) => `شهر ${label}`}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="sales" name="المبيعات" fill="#1E40AF" barSize={20} />
                    <Bar dataKey="payments" name="المدفوعات" fill="#0EA5E9" barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Payment Methods Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>طرق الدفع</CardTitle>
              <CardDescription>
                توزيع المدفوعات حسب الطريقة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} ج.م`, undefined]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4">
                <ul className="space-y-1 text-sm">
                  {pieChartData.map((entry, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span 
                          className="w-3 h-3 inline-block mr-2 rounded-sm" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></span>
                        {entry.name}
                      </div>
                      <span>{formatCurrency(entry.value, 'EGP')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>أحدث الأنشطة</CardTitle>
                  <Badge variant="outline" className="bg-blue-50">اليوم</Badge>
                </div>
                <CardDescription>
                  آخر المعاملات والتحديثات في النظام
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => {
                      // Determine activity type based on activityType
                      let type: 'invoice' | 'payment' | 'overdue' | 'report' = 'invoice';
                      let title = '';
                      
                      if (activity.activityType.includes('invoice')) {
                        type = 'invoice';
                        title = t('dashboard.activities.newInvoice');
                      } else if (activity.activityType.includes('payment')) {
                        type = 'payment';
                        title = t('dashboard.activities.newPayment');
                      } else if (activity.activityType.includes('overdue') || activity.activityType.includes('client_deleted')) {
                        type = 'overdue';
                        title = t('dashboard.activities.overdueClient');
                      } else {
                        type = 'report';
                        title = t('dashboard.activities.reportSent');
                      }
                      
                      return (
                        <ActivityItem
                          key={activity.id}
                          type={type}
                          title={title}
                          description={activity.description}
                          timestamp={activity.timestamp}
                        />
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Bell className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                      <p>{t('common.noData')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 rounded-b-lg justify-center p-2">
                <Button variant="ghost" size="sm" className="text-primary w-full">
                  <Eye className="h-4 w-4 ml-1" />
                  عرض كل الأنشطة
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Notifications & Alerts */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="alerts">
              <div className="bg-white rounded-xl shadow-sm">
                <div className="px-4 pt-4">
                  <TabsList className="w-full">
                    <TabsTrigger value="alerts" className="flex-1">
                      <Bell className="h-4 w-4 ml-1" />
                      التنبيهات
                    </TabsTrigger>
                    <TabsTrigger value="clients" className="flex-1">
                      <Users className="h-4 w-4 ml-1" />
                      العملاء
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="alerts" className="p-4 pt-6 space-y-4">
                  {overdueClientsCount > 0 ? (
                    <AlertItem
                      type="error"
                      title={t('dashboard.alerts.overduePayments')}
                      description={`${overdueClientsCount} عملاء لديهم مدفوعات متأخرة أكثر من 30 يوم`}
                    />
                  ) : null}
                  
                  {invoiceCount > 0 ? (
                    <AlertItem
                      type="warning"
                      title={t('dashboard.alerts.pendingInvoices')}
                      description={`${invoiceCount} فواتير في انتظار المراجعة والتأكيد`}
                    />
                  ) : null}
                  
                  <AlertItem
                    type="info"
                    title={t('dashboard.alerts.newReport')}
                    description="تقرير المبيعات الأسبوعي جاهز للتحميل"
                  />
                  
                  <AlertItem
                    type="success"
                    title={t('dashboard.alerts.paymentComplete')}
                    description="عميل: الشركة المتحدة، قام بسداد كامل المستحقات"
                  />
                  
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Bell className="h-4 w-4 ml-1" />
                      تحديث الإشعارات
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="clients" className="p-0">
                  <div className="p-4 border-b">
                    <h3 className="text-sm font-medium text-gray-500">
                      العملاء الأكثر مديونية
                    </h3>
                  </div>
                  
                  {topClients && topClients.length > 0 ? (
                    <div className="divide-y">
                      {topClients.map((client) => (
                        <ClientItem
                          key={client.id}
                          name={client.clientName}
                          code={client.clientCode}
                          balance={client.balance}
                          currency={client.currency}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-500">
                      <Users className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                      <p>لا يوجد عملاء مدينين حالياً</p>
                    </div>
                  )}
                  
                  <div className="p-3 bg-gray-50 rounded-b-lg">
                    <Button variant="ghost" size="sm" className="text-primary w-full">
                      <Users className="h-4 w-4 ml-1" />
                      عرض كل العملاء
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
            
            {/* Summary Card */}
            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle>ملخص المالية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <div className="flex items-center text-gray-500">
                    <FileText className="h-4 w-4 ml-1" />
                    <span>إجمالي المبيعات</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(totalSalesToday, 'EGP')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-center text-gray-500">
                    <CreditCard className="h-4 w-4 ml-1" />
                    <span>إجمالي المدفوعات</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(totalPaymentsToday, 'EGP')}
                  </span>
                </div>
                
                <div className="flex justify-between border-t pt-2">
                  <div className="flex items-center text-gray-500">
                    <DollarSign className="h-4 w-4 ml-1" />
                    <span>الرصيد المتبقي</span>
                  </div>
                  <span className={`font-medium ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(Math.abs(remainingBalance), 'EGP')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 ml-1" />
                    <span>فواتير متأخرة</span>
                  </div>
                  <span className="font-medium">
                    {overdueClientsCount} عميل
                  </span>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 p-3 rounded-b-lg">
                {remainingBalance > 0 ? (
                  <div className="text-sm text-red-600 w-full text-center font-medium flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 ml-1" />
                    مستحقات متبقية
                  </div>
                ) : (
                  <div className="text-sm text-green-600 w-full text-center font-medium flex items-center justify-center">
                    <TrendingDown className="h-4 w-4 ml-1" />
                    لا توجد مستحقات
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
