// Arabic translations for the application
export const translations = {
  common: {
    appName: 'EticClients',
    appDescription: 'نظام إدارة حسابات العملاء',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    success: 'تمت العملية بنجاح',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    view: 'عرض',
    add: 'إضافة',
    filter: 'فلترة',
    search: 'بحث',
    logout: 'تسجيل الخروج',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    noData: 'لا توجد بيانات',
    viewAll: 'عرض الكل',
    export: 'تصدير',
    currency: {
      EGP: 'جنيه مصري',
      USD: 'دولار أمريكي',
      EUR: 'يورو'
    }
  },
  navigation: {
    dashboard: 'لوحة التحكم',
    clients: 'إدارة العملاء',
    invoices: 'رفع الفواتير',
    payments: 'إضافة دفعة',
    reports: 'التقارير',
    clientUpload: 'رفع بيانات العملاء',
    settings: 'الإعدادات',
    more: 'المزيد'
  },
  login: {
    title: 'تسجيل الدخول',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    loginButton: 'تسجيل الدخول',
    error: 'اسم المستخدم أو كلمة المرور غير صحيحة',
    usernameRequired: 'اسم المستخدم مطلوب',
    passwordRequired: 'كلمة المرور مطلوبة'
  },
  dashboard: {
    title: 'لوحة التحكم',
    today: 'اليوم',
    yesterday: 'الأمس',
    week: 'الأسبوع',
    month: 'الشهر',
    cards: {
      totalSales: 'إجمالي المبيعات اليوم',
      totalPayments: 'إجمالي الدفعات المستلمة',
      overdueClients: 'عدد العملاء المتأخرين',
      totalInvoices: 'إجمالي الفواتير',
      client: 'عميل',
      invoice: 'فاتورة',
      compared: 'مقارنة بالأمس'
    },
    activities: {
      title: 'أحدث النشاطات',
      newInvoice: 'تم إضافة فاتورة جديدة',
      newPayment: 'تم تسجيل دفعة جديدة',
      overdueClient: 'عميل متأخر عن السداد',
      reportSent: 'تم إرسال تقرير'
    },
    alerts: {
      title: 'التنبيهات',
      markAsRead: 'تعيين كمقروءة',
      overduePayments: 'متأخرات سداد',
      pendingInvoices: 'فواتير معلقة',
      newReport: 'تقرير جديد جاهز',
      paymentComplete: 'اكتمال السداد',
      clients: {
        title: 'العملاء المهمين',
        code: 'كود'
      }
    }
  },
  clients: {
    title: 'قائمة العملاء',
    addClient: 'إضافة عميل',
    clientCode: 'كود العميل',
    clientName: 'اسم العميل',
    salesRep: 'مندوب المبيعات',
    currentBalance: 'الرصيد الحالي',
    currency: 'العملة',
    actions: 'الإجراءات',
    deleteConfirm: 'هل أنت متأكد أنك تريد حذف هذا العميل؟',
    search: 'بحث بالاسم أو الكود',
    showing: 'عرض',
    of: 'من',
    clients: 'عميل'
  },
  invoices: {
    title: 'رفع الفواتير',
    upload: 'رفع ملف Excel',
    chooseFile: 'اختيار ملف',
    dragDrop: 'أو اسحب وأفلت الملف هنا',
    fileFormat: 'تنسيق الملف المطلوب',
    fileFormatDesc: 'يجب أن يحتوي ملف Excel على الأعمدة التالية: رقم الفاتورة، رمز العميل، اسم العميل، تاريخ الفاتورة، إجمالي المبلغ، العملة',
    uploadHistory: 'سجل عمليات الرفع السابقة',
    date: 'التاريخ',
    fileName: 'اسم الملف',
    invoiceCount: 'عدد الفواتير',
    status: 'الحالة',
    actions: 'الإجراءات',
    successStatus: 'تم بنجاح',
    modifiedStatus: 'تم مع تعديلات',
    failedStatus: 'فشل',
    viewDetails: 'عرض التفاصيل',
    invoiceNumber: 'رقم الفاتورة',
    invoiceDate: 'تاريخ الفاتورة',
    totalAmount: 'إجمالي المبلغ',
    paidAmount: 'المبلغ المدفوع',
    remainingAmount: 'المبلغ المتبقي',
    status: {
      open: 'مستحق',
      partial: 'مدفوع جزئياً',
      paid: 'مدفوع بالكامل'
    }
  },
  payments: {
    title: 'إضافة دفعة جديدة',
    client: 'العميل',
    selectClient: 'اختر العميل',
    amount: 'المبلغ',
    enterAmount: 'أدخل المبلغ',
    paymentDate: 'تاريخ الدفع',
    paymentMethod: 'طريقة الدفع',
    selectPaymentMethod: 'اختر طريقة الدفع',
    cash: 'نقدي',
    transfer: 'تحويل بنكي',
    check: 'شيك',
    card: 'بطاقة ائتمان',
    checkNumber: 'رقم الشيك',
    enterCheckNumber: 'أدخل رقم الشيك',
    transactionId: 'رقم التحويل',
    enterTransactionId: 'أدخل رقم التحويل',
    notes: 'ملاحظات',
    enterNotes: 'أدخل ملاحظات إضافية (اختياري)',
    clientInfo: 'معلومات العميل',
    currentBalance: 'رصيد العميل الحالي',
    overdueInvoices: 'الفواتير المستحقة',
    paymentNote: 'سيتم خصم الدفعة تلقائياً من أقدم الفواتير المستحقة',
    submitPayment: 'تسجيل الدفعة',
    successMessage: 'تم تسجيل الدفعة بنجاح'
  },
  reports: {
    title: 'التقارير',
    clientReport: {
      title: 'تقرير العميل',
      description: 'عرض تفاصيل الفواتير، الدفعات، والرصيد لعميل محدد'
    },
    monthlyReport: {
      title: 'التقرير الشهري',
      description: 'عرض إجمالي الفواتير، الدفعات، والأرصدة لجميع العملاء'
    },
    agingReport: {
      title: 'تقرير الأعمار',
      description: 'عرض المبالغ المستحقة مصنفة حسب فترات التأخير'
    },
    createReport: 'إنشاء التقرير',
    exportPDF: 'تصدير PDF',
    exportExcel: 'تصدير Excel',
    client: 'العميل',
    selectClient: 'اختر العميل',
    startDate: 'من تاريخ',
    endDate: 'إلى تاريخ',
    summary: {
      totalSales: 'إجمالي المبيعات',
      totalPayments: 'إجمالي المدفوعات',
      remainingBalance: 'الرصيد المتبقي'
    },
    invoices: 'الفواتير',
    payments: 'الدفعات',
    invoiceNumber: 'رقم الفاتورة',
    date: 'التاريخ',
    amount: 'المبلغ',
    paidAmount: 'المدفوع',
    remainingAmount: 'المتبقي',
    status: 'الحالة',
    paymentMethod: 'طريقة الدفع',
    checkTransNumber: 'رقم الشيك/التحويل',
    notes: 'ملاحظات'
  },
  clientUpload: {
    title: 'رفع بيانات العملاء',
    description: 'قم برفع ملف Excel يحتوي على بيانات العملاء الأساسية. سيتم استخدام هذا الملف مرة واحدة فقط لإنشاء قاعدة البيانات.',
    chooseFile: 'اختيار ملف Excel لبيانات العملاء',
    dragDrop: 'أو اسحب وأفلت الملف هنا',
    oneTimeWarning: 'انتبه! عملية لمرة واحدة',
    oneTimeWarningDesc: 'سيتم استخدام هذا الملف لإنشاء قاعدة البيانات الأولية. بعد ذلك سيتم تحديث البيانات من خلال النظام فقط.',
    fileFormat: 'تنسيق الملف المطلوب',
    fileFormatDesc: 'يجب أن يحتوي ملف Excel على الأعمدة التالية: رمز العميل (كود)، اسم العميل، اسم مندوب المبيعات',
    uploadAndProcess: 'رفع ومعالجة البيانات',
    successMessage: 'تم رفع بيانات العملاء بنجاح',
    errorMessage: 'حدث خطأ أثناء رفع البيانات'
  },
  settings: {
    title: 'الإعدادات',
    emailSettings: {
      title: 'إعدادات البريد الإلكتروني',
      enableAutoReports: 'تفعيل إرسال التقارير التلقائية',
      recipients: 'المستلمون',
      recipientsPlaceholder: 'example@example.com, another@example.com',
      frequency: 'توقيت الإرسال',
      daily: 'يومياً',
      weekly: 'أسبوعياً',
      monthly: 'شهرياً',
      reportType: 'نوع التقرير',
      salesReport: 'تقرير المبيعات',
      paymentsReport: 'تقرير الدفعات',
      allReport: 'تقرير شامل'
    },
    notificationSettings: {
      title: 'إعدادات التنبيهات',
      newInvoices: 'تنبيهات الفواتير الجديدة',
      newPayments: 'تنبيهات الدفعات الجديدة',
      overduePayments: 'تنبيهات المدفوعات المتأخرة',
      overdueThreshold: 'عتبة التنبيه للتأخير (أيام)',
      displayOptions: 'خيارات عرض التنبيهات',
      dashboardOnly: 'عرض في لوحة التحكم فقط',
      emailOnly: 'إرسال بريد إلكتروني',
      both: 'كلاهما'
    },
    currencySettings: {
      title: 'إعدادات العملة',
      defaultCurrency: 'العملة الافتراضية',
      EGP: 'جنيه مصري (EGP)',
      USD: 'دولار أمريكي (USD)',
      EUR: 'يورو (EUR)'
    },
    saveChanges: 'حفظ التغييرات',
    successMessage: 'تم حفظ الإعدادات بنجاح',
    errorMessage: 'حدث خطأ أثناء حفظ الإعدادات'
  }
};

// Helper function to get translations
export function t(key: string, params?: Record<string, string | number>): string {
  // Split the key by dots
  const keys = key.split('.');
  
  // Navigate through the translations object
  let value: any = translations;
  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      return key; // Return the key if translation is not found
    }
  }
  
  // If the result is not a string, return the key
  if (typeof value !== 'string') {
    return key;
  }
  
  // Replace parameters if any
  if (params) {
    return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
      return str.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
    }, value);
  }
  
  return value;
}
