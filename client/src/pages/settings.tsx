import { Layout } from "@/components/layout/Layout";
import { useSettings } from "@/hooks/use-settings";
import { t } from "@/lib/i18n";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { settings, isLoading, updateSettings } = useSettings();
  const { toast } = useToast();
  
  // Default settings state
  const [formData, setFormData] = useState({
    enableAutoReports: true,
    recipients: "manager@eticclients.com, sales@eticclients.com",
    frequency: "weekly",
    reportType: "all",
    newInvoices: true,
    newPayments: true,
    overduePayments: true,
    overdueThreshold: "30",
    notificationDisplay: "dashboard",
    defaultCurrency: "EGP"
  });
  
  // Load settings from API when available
  useState(() => {
    if (settings) {
      // Map settings to form data
      // This is simplified; in a real app, you'd map the settings properly
      try {
        const settingsObj = settings.reduce((obj, setting) => {
          obj[setting.key] = setting.value;
          return obj;
        }, {} as Record<string, string>);
        
        setFormData({
          enableAutoReports: settingsObj.enableAutoReports === "true",
          recipients: settingsObj.recipients || formData.recipients,
          frequency: settingsObj.frequency || formData.frequency,
          reportType: settingsObj.reportType || formData.reportType,
          newInvoices: settingsObj.newInvoices === "true",
          newPayments: settingsObj.newPayments === "true",
          overduePayments: settingsObj.overduePayments === "true",
          overdueThreshold: settingsObj.overdueThreshold || formData.overdueThreshold,
          notificationDisplay: settingsObj.notificationDisplay || formData.notificationDisplay,
          defaultCurrency: settingsObj.defaultCurrency || formData.defaultCurrency
        });
      } catch (error) {
        console.error("Error parsing settings:", error);
      }
    }
  });
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async () => {
    try {
      // Convert formData to settings format
      const settingsData = Object.entries(formData).map(([key, value]) => ({
        key,
        value: value.toString()
      }));
      
      await updateSettings.mutateAsync(settingsData);
      
      toast({
        title: t('settings.successMessage'),
        description: "",
      });
    } catch (error) {
      toast({
        title: t('settings.errorMessage'),
        description: error instanceof Error ? error.message : "",
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center p-8">
          <div className="text-lg">{t('common.loading')}</div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">{t('settings.title')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Email Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('settings.emailSettings.title')}</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Checkbox 
                    id="enableAutoReports" 
                    checked={formData.enableAutoReports}
                    onCheckedChange={(checked) => handleChange('enableAutoReports', checked)}
                  />
                  <Label htmlFor="enableAutoReports" className="mr-2">
                    {t('settings.emailSettings.enableAutoReports')}
                  </Label>
                </div>
                
                <div>
                  <Label htmlFor="recipients">
                    {t('settings.emailSettings.recipients')}
                  </Label>
                  <Input 
                    id="recipients" 
                    value={formData.recipients}
                    onChange={(e) => handleChange('recipients', e.target.value)}
                    placeholder={t('settings.emailSettings.recipientsPlaceholder')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="frequency">
                    {t('settings.emailSettings.frequency')}
                  </Label>
                  <Select 
                    value={formData.frequency}
                    onValueChange={(value) => handleChange('frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{t('settings.emailSettings.daily')}</SelectItem>
                      <SelectItem value="weekly">{t('settings.emailSettings.weekly')}</SelectItem>
                      <SelectItem value="monthly">{t('settings.emailSettings.monthly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="reportType">
                    {t('settings.emailSettings.reportType')}
                  </Label>
                  <Select 
                    value={formData.reportType}
                    onValueChange={(value) => handleChange('reportType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">{t('settings.emailSettings.salesReport')}</SelectItem>
                      <SelectItem value="payments">{t('settings.emailSettings.paymentsReport')}</SelectItem>
                      <SelectItem value="all">{t('settings.emailSettings.allReport')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Notification Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('settings.notificationSettings.title')}</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Checkbox 
                    id="newInvoices" 
                    checked={formData.newInvoices}
                    onCheckedChange={(checked) => handleChange('newInvoices', checked)}
                  />
                  <Label htmlFor="newInvoices" className="mr-2">
                    {t('settings.notificationSettings.newInvoices')}
                  </Label>
                </div>
                
                <div className="flex items-center">
                  <Checkbox 
                    id="newPayments" 
                    checked={formData.newPayments}
                    onCheckedChange={(checked) => handleChange('newPayments', checked)}
                  />
                  <Label htmlFor="newPayments" className="mr-2">
                    {t('settings.notificationSettings.newPayments')}
                  </Label>
                </div>
                
                <div className="flex items-center">
                  <Checkbox 
                    id="overduePayments" 
                    checked={formData.overduePayments}
                    onCheckedChange={(checked) => handleChange('overduePayments', checked)}
                  />
                  <Label htmlFor="overduePayments" className="mr-2">
                    {t('settings.notificationSettings.overduePayments')}
                  </Label>
                </div>
                
                <div>
                  <Label htmlFor="overdueThreshold">
                    {t('settings.notificationSettings.overdueThreshold')}
                  </Label>
                  <Input 
                    id="overdueThreshold" 
                    type="number"
                    value={formData.overdueThreshold}
                    onChange={(e) => handleChange('overdueThreshold', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-md font-medium mb-2">{t('settings.notificationSettings.displayOptions')}</h4>
                <RadioGroup 
                  value={formData.notificationDisplay}
                  onValueChange={(value) => handleChange('notificationDisplay', value)}
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="dashboard" id="dashboard" />
                    <Label htmlFor="dashboard">{t('settings.notificationSettings.dashboardOnly')}</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email">{t('settings.notificationSettings.emailOnly')}</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both">{t('settings.notificationSettings.both')}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">{t('settings.currencySettings.title')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="defaultCurrency">
                  {t('settings.currencySettings.defaultCurrency')}
                </Label>
                <Select 
                  value={formData.defaultCurrency}
                  onValueChange={(value) => handleChange('defaultCurrency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EGP">{t('settings.currencySettings.EGP')}</SelectItem>
                    <SelectItem value="USD">{t('settings.currencySettings.USD')}</SelectItem>
                    <SelectItem value="EUR">{t('settings.currencySettings.EUR')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-end space-x-4 space-x-reverse">
            <Button variant="outline" className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="px-6 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700"
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? t('common.loading') : t('settings.saveChanges')}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
