
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { t } from "@/lib/i18n";

export default function ClientDataInfo() {
  return (
    <Layout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('clientUpload.title')}</CardTitle>
            <CardDescription>{t('clientUpload.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-blue-50 border-blue-200 mb-6">
              <InfoIcon className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-600">تغيير في طريقة إدارة بيانات العملاء</AlertTitle>
              <AlertDescription>
                يتم الآن قراءة بيانات العملاء مباشرة من ملف clients-data.json في جذر المشروع.
                تم تعطيل ميزة تحميل العملاء. لتحديث بيانات العملاء، يرجى تعديل الملف مباشرة.
              </AlertDescription>
            </Alert>
            
            <div className="bg-yellow-50 border-r-4 border-warning p-4 mb-6 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0 ml-3">
                  <i className="ri-information-line text-warning"></i>
                </div>
                <div>
                  <h4 className="text-sm text-warning font-medium">تنسيق ملف البيانات</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    يجب أن يحتوي ملف clients-data.json على مصفوفة من كائنات العملاء بالتنسيق التالي:
                  </p>
                  <div className="mt-3 bg-white p-3 rounded border border-yellow-200">
                    <ul className="text-xs space-y-1 list-disc list-inside">
                      <li><strong>CODE</strong>: كود العميل</li>
                      <li><strong>CUSTOMER NAME</strong>: اسم العميل</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
