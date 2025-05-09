import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClients } from "@/hooks/use-clients";
import { useToast } from "@/hooks/use-toast";
import { t } from "@/lib/i18n";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ClientFormProps {
  clientId?: number;
  onSuccess?: () => void;
}

const clientSchema = z.object({
  clientCode: z.string().min(1, "كود العميل مطلوب"),
  clientName: z.string().min(1, "اسم العميل مطلوب"),
  salesRepName: z.string().min(1, "اسم مندوب المبيعات مطلوب"),
  currency: z.enum(["EGP", "USD", "EUR"])
});

type ClientFormValues = z.infer<typeof clientSchema>;

export function ClientForm({ clientId, onSuccess }: ClientFormProps) {
  const { getClient, createClient, updateClient } = useClients();
  const { toast } = useToast();
  const isEditing = !!clientId;

  // Fetch client data if editing
  const { data: clientData, isLoading: isLoadingClient } = getClient(clientId || 0);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      clientCode: "",
      clientName: "",
      salesRepName: "",
      currency: "EGP"
    }
  });

  // Update form with client data when available
  useEffect(() => {
    if (isEditing && clientData) {
      form.reset({
        clientCode: clientData.clientCode,
        clientName: clientData.clientName,
        salesRepName: clientData.salesRepName,
        currency: clientData.currency as "EGP" | "USD" | "EUR"
      });
    }
  }, [clientData, form, isEditing]);

  const onSubmit = async (values: ClientFormValues) => {
    try {
      if (isEditing && clientId) {
        await updateClient.mutateAsync({ id: clientId, client: values });
        toast({
          title: "تم تحديث العميل بنجاح",
          description: "تم تحديث بيانات العميل",
          variant: "success"
        });
      } else {
        await createClient.mutateAsync(values);
        toast({
          title: "تمت إضافة العميل بنجاح",
          description: "تمت إضافة العميل الجديد إلى قاعدة البيانات",
          variant: "success"
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving client:", error);
      toast({
        title: "حدث خطأ",
        description: "فشلت عملية حفظ بيانات العميل. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  if (isEditing && isLoadingClient) {
    return <div className="text-center py-4">{t('common.loading')}</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="clientCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('clients.clientCode')}</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  disabled={isEditing} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('clients.clientName')}</FormLabel>
              <FormControl>
                <Input {...field} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salesRepName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('clients.salesRep')}</FormLabel>
              <FormControl>
                <Input {...field} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('clients.currency')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <SelectValue placeholder={t('clients.currency')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="EGP">{t('common.currency.EGP')}</SelectItem>
                  <SelectItem value="USD">{t('common.currency.USD')}</SelectItem>
                  <SelectItem value="EUR">{t('common.currency.EUR')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 space-x-reverse pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onSuccess}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            type="submit" 
            disabled={createClient.isPending || updateClient.isPending}
          >
            {createClient.isPending || updateClient.isPending 
              ? t('common.loading') 
              : isEditing ? t('common.save') : t('common.add')
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}