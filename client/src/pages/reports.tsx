import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ReportCard } from "@/components/reports/ReportCard";
import { ClientReport } from "@/components/reports/ClientReport";
import { MonthlyReport } from "@/components/reports/MonthlyReport";
import { AgingReport } from "@/components/reports/AgingReport";
import { t } from "@/lib/i18n";

export default function Reports() {
  const [activeReport, setActiveReport] = useState<string | null>(null);

  return (
    <Layout>
      <div className="p-6">
        {/* Report Selection Cards */}
        {!activeReport && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <ReportCard
              title={t('reports.clientReport.title')}
              description={t('reports.clientReport.description')}
              icon="ri-user-line"
              color="primary"
              onClick={() => setActiveReport('client')}
            />
            
            <ReportCard
              title={t('reports.monthlyReport.title')}
              description={t('reports.monthlyReport.description')}
              icon="ri-calendar-line"
              color="secondary"
              onClick={() => setActiveReport('monthly')}
            />
            
            <ReportCard
              title={t('reports.agingReport.title')}
              description={t('reports.agingReport.description')}
              icon="ri-time-line"
              color="warning"
              onClick={() => setActiveReport('aging')}
            />
          </div>
        )}
        
        {/* Active Report Content */}
        {activeReport === 'client' && (
          <ClientReport onBack={() => setActiveReport(null)} />
        )}
        
        {activeReport === 'monthly' && (
          <MonthlyReport onBack={() => setActiveReport(null)} />
        )}
        
        {activeReport === 'aging' && (
          <AgingReport onBack={() => setActiveReport(null)} />
        )}
      </div>
    </Layout>
  );
}
