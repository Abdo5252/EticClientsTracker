import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'EGP'): string {
  const currencySymbols: Record<string, string> = {
    'EGP': 'جنيه',
    'USD': 'دولار',
    'EUR': 'يورو'
  };

  return `${amount.toLocaleString('ar-EG')} ${currencySymbols[currency] || currency}`;
}

export function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function getRelativeTime(date: string | Date): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMin = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMin < 1) {
    return 'الآن';
  } else if (diffInMin < 60) {
    return `منذ ${diffInMin} دقيقة`;
  } else if (diffInHours < 24) {
    return `منذ ${diffInHours} ساعة`;
  } else if (diffInDays < 30) {
    return `منذ ${diffInDays} يوم`;
  } else {
    return formatDate(date);
  }
}

export function getInvoiceStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'open': t('invoices.invoiceStatus.open'),
    'partial': t('invoices.invoiceStatus.partial'),
    'paid': t('invoices.invoiceStatus.paid')
  };
  return statusMap[status] || status;
}

export function getInvoiceStatusClass(status: string): string {
  const statusMap: Record<string, string> = {
    'open': 'bg-red-100 text-red-800',
    'partial': 'bg-yellow-100 text-yellow-800',
    'paid': 'bg-green-100 text-green-800'
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800';
}

export function getPaymentMethodText(method: string): string {
  const methodMap: Record<string, string> = {
    'cash': 'نقدي',
    'transfer': 'تحويل بنكي',
    'check': 'شيك',
    'card': 'بطاقة ائتمان'
  };
  return methodMap[method] || method;
}

export function parseExcelToJSON(data: ArrayBuffer): any[] {
  try {
    // This is just a placeholder for the frontend logic
    // The actual Excel parsing will happen on the server
    return [];
  } catch (error) {
    console.error('Error parsing Excel:', error);
    throw new Error('فشل في قراءة ملف Excel. تأكد من أن الملف بالتنسيق الصحيح.');
  }
}

export const generateInitials = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .substring(0, 2);
};
