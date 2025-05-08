import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@/lib/i18n";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { AlertItem } from "@/components/dashboard/AlertItem";
import { ClientItem } from "@/components/dashboard/ClientItem";
import { Layout } from "@/components/layout/Layout";

export default function Dashboard() {
  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard'],
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center p-8">
          <div className="text-lg">{t('common.loading')}</div>
        </div>
      </Layout>
    );
  }

  if (error || !dashboardData) {
    return (
      <Layout>
        <div className="flex justify-center items-center p-8">
          <div className="text-lg text-red-500">{t('common.error')}</div>
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
    topClients
  } = dashboardData;

  return (
    <Layout>
      <div className="p-6">
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{t('dashboard.activities.title')}</h2>
                <button className="text-primary hover:underline text-sm">{t('common.viewAll')}</button>
              </div>
              
              <div className="space-y-4">
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
                  <div className="text-center py-8 text-gray-500">
                    {t('common.noData')}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Notifications & Alerts */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{t('dashboard.alerts.title')}</h2>
                <button className="text-primary hover:underline text-sm">{t('dashboard.alerts.markAsRead')}</button>
              </div>
              
              <div className="space-y-3">
                {overdueClientsCount > 0 && (
                  <AlertItem
                    type="error"
                    title={t('dashboard.alerts.overduePayments')}
                    description={`${overdueClientsCount} عملاء لديهم مدفوعات متأخرة أكثر من 30 يوم`}
                  />
                )}
                
                {invoiceCount > 0 && (
                  <AlertItem
                    type="warning"
                    title={t('dashboard.alerts.pendingInvoices')}
                    description={`${invoiceCount} فواتير في انتظار المراجعة والتأكيد`}
                  />
                )}
                
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
              </div>
              
              {topClients && topClients.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-semibold mb-3">{t('dashboard.alerts.clients.title')}</h3>
                  <div className="space-y-3">
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
