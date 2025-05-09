import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useInvoices } from '@/hooks/use-invoices';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Check, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export function InvoiceUploader() {
  const { uploadInvoices } = useInvoices();
  const { processExcelFile } = useFileUpload();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'validating' | 'processing' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploading = uploadInvoices.isPending;
  const isProcessing = uploadStatus === 'processing';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadStatus('idle');
      setUploadProgress(0);
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploadStatus('validating');
      setUploadProgress(25);

      // Define required fields
      const requiredFields = [
        { name: 'Document Number', excel: 'Document Number' },
        { name: 'Document Date', excel: 'Document Date' },
        { name: 'Customer Code', excel: 'Customer Code' },
        { name: 'Total Amount', excel: 'Total Amount' }
      ];

      // Process Excel file
      const data = await processExcelFile(file);
      setUploadProgress(50);

      if (!data || data.length === 0) {
        throw new Error('لا توجد بيانات في الملف');
      }

      const firstRow = data[0];
      console.log("First row fields:", Object.keys(firstRow));
      console.log("Sample parsed row:", firstRow);
      console.log("Available keys in the first record:", Object.keys(firstRow));

      // More flexible field matching to handle case differences and variations
      const missingFields = requiredFields.filter(field => {
        // Try exact match
        if (Object.keys(firstRow).includes(field.excel)) {
          return false;
        }

        // Try case-insensitive match
        const caseInsensitiveMatch = Object.keys(firstRow).some(key => 
          key.toLowerCase() === field.excel.toLowerCase()
        );

        if (caseInsensitiveMatch) {
          return false;
        }

        // Try partial match (field name might be part of a longer field name)
        const partialMatch = Object.keys(firstRow).some(key => 
          key.toLowerCase().includes(field.excel.toLowerCase())
        );

        return !partialMatch;
      });

      if (missingFields.length > 0) {
        throw new Error(`الحقول المطلوبة غير موجودة: ${missingFields.map(f => f.excel).join(', ')}`);
      }

      setUploadStatus('processing');
      const result = await uploadInvoices.mutateAsync(data);
      setUploadResult(result);
      setUploadStatus('success');

      toast({
        title: "تم تحميل الفواتير بنجاح",
        description: `تم معالجة ${result.success} فاتورة بنجاح، ${result.failed} فشلت`,
        variant: "default",
      });

    } catch (error) {
      setUploadStatus('error');
      toast({
        title: "فشل تحميل الفواتير",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء تحميل الفواتير",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>تحميل الفواتير</CardTitle>
      </CardHeader>
      <CardContent>
        {uploadStatus === 'success' && uploadResult && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <h3 className="text-green-800 font-medium mb-2">تم التحميل بنجاح</h3>
            <p className="text-green-700">تم معالجة {uploadResult.success} فاتورة بنجاح</p>
            {uploadResult.failed > 0 && (
              <div className="mt-2">
                <p className="text-amber-700">فشل في معالجة {uploadResult.failed} فاتورة</p>
                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <ul className="list-disc list-inside mt-1 text-sm text-amber-600">
                    {uploadResult.errors.slice(0, 5).map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                    {uploadResult.errors.length > 5 && (
                      <li>...و{uploadResult.errors.length - 5} أخطاء أخرى</li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {(uploadStatus === 'error') && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <h3 className="text-red-800 font-medium mb-2">فشل التحميل</h3>
            <p className="text-red-700">حدث خطأ أثناء تحميل الفواتير</p>
          </div>
        )}

        {(uploadStatus !== 'success') && (
          <div>
            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
              <FileText className="h-10 w-10 text-gray-400 mb-2" />

              <h3 className="text-lg font-medium mb-2">
                {file ? file.name : "رفع ملف الفواتير"}
              </h3>

              <p className="text-sm text-gray-500 mb-4">
                {file 
                  ? `${(file.size / 1024).toFixed(2)} كيلوبايت - ${file.type}` 
                  : "اسحب ملف Excel هنا أو انقر للاختيار"}
              </p>

              {(uploadStatus === 'validating' || uploadStatus === 'processing' || isUploading) && (
                <div className="w-full max-w-xs mb-4">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {uploadStatus === 'validating' && "جاري التحقق من البيانات..."}
                    {uploadStatus === 'processing' && "جاري معالجة الفواتير..."}
                    {isUploading && "جاري رفع البيانات..."}
                  </p>
                </div>
              )}

              <div className="flex space-x-2 space-x-reverse">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx,.xls"
                  className="hidden"
                />

                <Button 
                  type="button"
                  onClick={handleFileSelect}
                  disabled={isUploading || isProcessing || uploadStatus === 'validating' || uploadStatus === 'processing'}
                  variant="outline"
                >
                  <Upload className="h-4 w-4 ml-1" />
                  <span>اختيار ملف</span>
                </Button>

                {file && (
                  <Button 
                    type="button"
                    onClick={handleUpload}
                    disabled={isUploading || isProcessing || uploadStatus === 'validating' || uploadStatus === 'processing'}
                  >
                    <Check className="h-4 w-4 ml-1" />
                    <span>
                      {isUploading || isProcessing || uploadStatus === 'validating' || uploadStatus === 'processing' 
                        ? "جاري التحميل..." 
                        : "تحميل الفواتير"}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start bg-gray-50 rounded-b-lg">
        <h4 className="text-sm font-semibold mb-2">صيغة الملف المطلوبة:</h4>
        <ul className="list-disc list-inside text-sm text-gray-600">
          <li>ملف Excel (.xlsx, .xls)</li>
          <li>يجب أن يحتوي الملف على الحقول التالية: رقم الفاتورة، تاريخ الفاتورة، رمز العميل، إجمالي المبلغ</li>
          <li>يجب أن يكون رمز العميل متطابقًا مع الرموز الموجودة في النظام</li>
        </ul>
      </CardFooter>
    </Card>
  );
}