import { useState, useRef } from "react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ClientUploaderProps {
  onUpload: (data: any[]) => Promise<any>;
  isUploading: boolean;
}

export function ClientUploader({ onUpload, isUploading }: ClientUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { parseExcelFile, isProcessing } = useFileUpload();
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
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
      const data = await parseExcelFile(file);
      await onUpload(data);
      setFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
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
  
  return (
    <div 
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col items-center">
        <i className="ri-file-excel-line text-5xl text-gray-400 mb-2"></i>
        <h3 className="text-lg font-medium mb-2">
          {file ? file.name : t('clientUpload.chooseFile')}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {file ? `${(file.size / 1024).toFixed(2)} KB` : t('clientUpload.dragDrop')}
        </p>
        
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
            disabled={isUploading || isProcessing}
            variant="outline"
          >
            <i className="ri-file-upload-line ml-1"></i>
            <span>{t('invoices.chooseFile')}</span>
          </Button>
          
          {file && (
            <Button 
              type="button"
              onClick={handleUpload}
              disabled={isUploading || isProcessing}
              className="px-6 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700"
            >
              <i className="ri-upload-2-line ml-1"></i>
              <span>
                {isUploading || isProcessing ? t('common.loading') : t('clientUpload.uploadAndProcess')}
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
