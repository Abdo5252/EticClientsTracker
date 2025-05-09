import { Layout } from "@/components/layout/Layout";
import { ClientUploader } from "@/components/clients/ClientUploader";
import { useClients } from "@/hooks/use-clients";
import { t } from "@/lib/i18n";

export default function ClientUpload() {
  const { uploadClients } = useClients();

  return (
    <Layout>
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-2">{t('clientUpload.title')}</h2>
          <p className="text-gray-600 mb-6">{t('clientUpload.description')}</p>
          
          {/* Client Uploader Component */}
          <ClientUploader onUpload={uploadClients.mutateAsync} isUploading={uploadClients.isPending} />
          
          <div className="bg-yellow-50 border-r-4 border-warning p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0 ml-3">
                <i className="ri-alert-line text-warning"></i>
              </div>
              <div>
                <h4 className="text-sm text-warning font-medium">{t('clientUpload.oneTimeWarning')}</h4>
                <p className="text-xs text-gray-600 mt-1">{t('clientUpload.oneTimeWarningDesc')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border-r-4 border-primary p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0 ml-3">
                <i className="ri-information-line text-primary"></i>
              </div>
              <div>
                <h4 className="text-sm text-primary font-medium">{t('clientUpload.fileFormat')}</h4>
                <p className="text-xs text-gray-600 mt-1">{t('clientUpload.fileFormatDesc')}</p>
                <div className="mt-3 bg-white p-3 rounded border border-blue-200">
                  <h5 className="text-xs font-medium mb-2">تنسيق الأعمدة المطلوب:</h5>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li><strong>CODE</strong>: كود العميل (مطلوب)</li>
                    <li><strong>CUSTOMER NAME</strong>: اسم العميل (مطلوب)</li>
                    <li><strong>SALES REP</strong>: اسم مندوب المبيعات (اختياري)</li>
                  </ul>
                  <div className="mt-2 text-xs text-gray-500">
                    تأكد من أن عناوين الأعمدة متطابقة تماماً مع ما هو مذكور أعلاه.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
