import { useState, useRef, useEffect } from "react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileSpreadsheet, Upload, Check, Calendar, Info } from "lucide-react";

interface InvoiceUploaderProps {
  onUpload: (data: any[]) => Promise<any>;
  isUploading: boolean;
}

export function InvoiceUploader({ onUpload, isUploading }: InvoiceUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<null | 'validating' | 'processing' | 'success' | 'error'>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { parseExcelFile, isProcessing } = useFileUpload();
  const { toast } = useToast();

  // Simulate progress during upload
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    if (isUploading || uploadStatus === 'validating' || uploadStatus === 'processing') {
      // Reset progress when starting
      if (uploadProgress === 100) setUploadProgress(0);

      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 300);
    } else if (uploadStatus === 'success') {
      setUploadProgress(100);
    }

    return () => {
      clearInterval(progressInterval);
    };
  }, [isUploading, uploadStatus, uploadProgress]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadStatus(null);
      setUploadResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Only accept Excel files
      const droppedFile = e.dataTransfer.files[0];
      const fileExtension = droppedFile.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        setFile(droppedFile);
        setUploadStatus(null);
        setUploadResult(null);
      } else {
        toast({
          title: "نوع ملف غير مدعوم",
          description: "يرجى تحميل ملف Excel فقط (.xlsx أو .xls)",
          variant: "destructive",
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار ملف أولاً",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadStatus('validating');

      if (!file) {
        throw new Error("الرجاء اختيار ملف");
      }

      const data = await parseExcelFile(file);
      console.log("Parsed Excel data:", data);

      if (!data || data.length === 0) {
        throw new Error("ملف فارغ أو لا يحتوي على بيانات صالحة");
      }

      // Check if data has required fields - use exact field names from the Excel file
      const requiredFields = [
        { api: 'invoiceNumber', excel: 'Document Number' },
        { api: 'clientCode', excel: 'Customer Code' },
        { api: 'invoiceDate', excel: 'Document Date' },
        { api: 'totalAmount', excel: 'Total Amount' }
      ];

      const firstRow = data[0];
      console.log("First row fields:", Object.keys(firstRow));

      const missingFields = requiredFields.filter(field => 
        !Object.keys(firstRow).some(key => 
          key === field.excel || 
          key.toLowerCase() === field.excel.toLowerCase()
        )
      );

      if (missingFields.length > 0) {
        throw new Error(`الحقول المطلوبة غير موجودة: ${missingFields.map(f => f.excel).join(', ')}`);
      }

      setUploadStatus('processing');
      const result = await onUpload(data);
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
        title: "خطأ في معالجة الملف",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء معالجة الملف",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadStatus(null);
    setUploadProgress(0);
    setUploadResult(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Format today's date for showing invoice period
  const today = new Date();
  const formattedDate = today.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>تحميل الفواتير اليومية</span>
          {uploadStatus === 'success' && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Check className="h-3 w-3 mr-1" />
              تم التحميل
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 ml-1" />
            فواتير يوم {formattedDate}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {uploadStatus === 'success' && uploadResult ? (
          <div className="space-y-4">
            <Alert variant={uploadResult.failed > 0 ? "destructive" : "default"}>
              <Info className="h-4 w-4" />
              <AlertTitle>نتائج تحميل الفواتير</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li className="text-green-600">{uploadResult.success} فاتورة تم تحميلها بنجاح</li>
                  {uploadResult.failed > 0 && (
                    <li className="text-amber-600">{uploadResult.failed} فاتورة فشل تحميلها</li>
                  )}
                  {uploadResult.modified > 0 && (
                    <li className="text-blue-600">{uploadResult.modified} فاتورة تم تعديلها</li>
                  )}
                </ul>

                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <div className="mt-2">
                    <details className="cursor-pointer">
                      <summary className="text-sm text-red-600 font-medium">عرض التفاصيل ({uploadResult.errors.length})</summary>
                      <ul className="mt-2 space-y-1 list-disc list-inside text-xs text-gray-600 py-2 px-3 bg-gray-50 rounded">
                        {uploadResult.errors.slice(0, 5).map((err: string, idx: number) => (
                          <li key={idx}>{err}</li>
                        ))}
                        {uploadResult.errors.length > 5 && (
                          <li className="text-gray-500">... وأخطاء أخرى</li>
                        )}
                      </ul>
                    </details>
                  </div>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex justify-end">
              <Button onClick={resetUpload} size="sm" variant="outline">
                تحميل ملف جديد
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-primary bg-blue-50' : 'border-gray-300'
            } ${uploadStatus === 'error' ? 'border-red-300 bg-red-50' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center">
              {uploadStatus === 'error' ? (
                <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
              ) : (
                <FileSpreadsheet className="h-12 w-12 text-gray-400 mb-2" />
              )}

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
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mr-4">
          <li>ملف Excel (.xlsx, .xls)</li>
          <li>يجب أن يحتوي على الأعمدة: Document Type, Document Number, Document Date, Customer Code, Currency Code, Total Amount</li>
          <li>يمكن إضافة أعمدة: Exchange Rate, Extra Discount, Activity Code</li>
          <li>تنسيق التاريخ: DD/MM/YYYY أو MM/DD/YYYY</li>
          <li>العملة الافتراضية هي الجنيه المصري إذا لم يتم تحديدها</li>
        </ul>
      </CardFooter>
    </Card>
  );
}