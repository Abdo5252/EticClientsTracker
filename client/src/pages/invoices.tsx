import { Layout } from "@/components/layout/Layout";
import { InvoiceUploader } from "@/components/invoices/InvoiceUploader";
import { InvoiceHistoryTable } from "@/components/invoices/InvoiceHistoryTable";
import { useInvoices } from "@/hooks/use-invoices";
import { t } from "@/lib/i18n";

export default function Invoices() {
  const { invoices, isLoading, uploadInvoices } = useInvoices();

  return (
    <Layout>
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">{t('invoices.title')}</h2>
          
          {/* Invoice Uploader Component */}
          <InvoiceUploader onUpload={uploadInvoices.mutateAsync} isUploading={uploadInvoices.isPending} />
          
          <div className="bg-blue-50 border-r-4 border-primary p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0 ml-3">
                <i className="ri-information-line text-primary"></i>
              </div>
              <div>
                <h4 className="text-sm text-primary font-medium">{t('invoices.fileFormat')}</h4>
                <p className="text-xs text-gray-600 mt-1">{t('invoices.fileFormatDesc')}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-4">{t('invoices.uploadHistory')}</h3>
            
            {/* Invoice History Table Component */}
            <InvoiceHistoryTable invoices={invoices} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
