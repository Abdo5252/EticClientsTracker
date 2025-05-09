import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useClients } from "@/hooks/use-clients";
import { usePayments } from "@/hooks/use-payments";
import { t } from "@/lib/i18n";
import { formatCurrency, getPaymentMethodText } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const paymentSchema = z.object({
  clientId: z.string().min(1, "العميل مطلوب"),
  amount: z.string().min(1, "المبلغ مطلوب"),
  paymentDate: z.string().min(1, "تاريخ الدفع مطلوب"),
  paymentMethod: z.enum(["cash", "transfer", "check", "card"]),
  checkNumber: z.string().optional(),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
  currency: z.enum(["EGP", "USD", "EUR"])
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export function PaymentForm() {
  const { clients, isLoading: isLoadingClients } = useClients();
  const { createPayment } = usePayments();
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      clientId: "",
      amount: "",
      paymentDate: new Date().toISOString().split('T')[0], // Today's date
      paymentMethod: "cash",
      checkNumber: "",
      transactionId: "",
      notes: "",
      currency: "EGP"
    }
  });

  const watchPaymentMethod = form.watch("paymentMethod");
  const watchClientId = form.watch("clientId");

  // Update selected client when clientId changes
  useEffect(() => {
    if (clients && watchClientId) {
      const client = clients.find(c => c.id.toString() === watchClientId);
      setSelectedClient(client);

      // Update currency to match client's currency
      if (client) {
        form.setValue("currency", client.currency as "EGP" | "USD" | "EUR");
      }
    }
  }, [watchClientId, clients, form]);

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      await createPayment.mutateAsync({
        clientId: parseInt(values.clientId),
        amount: parseFloat(values.amount),
        paymentDate: new Date(values.paymentDate).toISOString(),
        paymentMethod: values.paymentMethod,
        checkNumber: values.checkNumber,
        transactionId: values.transactionId,
        notes: values.notes,
        currency: values.currency
      });

      // Reset form after successful submission
      form.reset({
        clientId: "",
        amount: "",
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: "cash",
        checkNumber: "",
        transactionId: "",
        notes: "",
        currency: "EGP"
      });

      setSelectedClient(null);
    } catch (error) {
      console.error("Error saving payment:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payments.client')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('payments.selectClient')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingClients ? (
                      <SelectItem value="loading" disabled>{t('common.loading')}</SelectItem>
                    ) : clients && clients.length > 0 ? (
                      clients.map(client => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.clientName} ({client.clientCode})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>{t('common.noData')}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('payments.amount')}</FormLabel>
                  <div className="flex">
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder={t('payments.enterAmount')}
                        className="flex-1 rounded-r-lg"
                        {...field} 
                      />
                    </FormControl>

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field: currencyField }) => (
                        <Select 
                          onValueChange={currencyField.onChange} 
                          value={currencyField.value}
                          disabled={!!selectedClient} // Disable if client is selected, to use client's currency
                        >
                          <FormControl>
                            <SelectTrigger className="w-24 rounded-l-lg rounded-r-none border-r-0">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EGP">{t('common.currency.EGP')}</SelectItem>
                            <SelectItem value="USD">{t('common.currency.USD')}</SelectItem>
                            <SelectItem value="EUR">{t('common.currency.EUR')}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="paymentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payments.paymentDate')}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payments.paymentMethod')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('payments.selectPaymentMethod')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cash">{t('payments.cash')}</SelectItem>
                    <SelectItem value="transfer">{t('payments.transfer')}</SelectItem>
                    <SelectItem value="check">{t('payments.check')}</SelectItem>
                    <SelectItem value="card">{t('payments.card')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchPaymentMethod === "check" && (
            <FormField
              control={form.control}
              name="checkNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('payments.checkNumber')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('payments.enterCheckNumber')}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {watchPaymentMethod === "transfer" && (
            <FormField
              control={form.control}
              name="transactionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('payments.transactionId')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('payments.enterTransactionId')}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('payments.notes')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3} 
                      placeholder={t('payments.enterNotes')}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {selectedClient && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-4">{t('payments.clientInfo')}</h3>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="mb-2">
                <span className="text-gray-600 ml-2">{t('payments.currentBalance')}:</span> 
                <span className="font-bold">
                  {selectedClient.balance.toLocaleString('ar-EG')} {t(`common.currency.${selectedClient.currency}`)}
                </span>
              </p>
              <p>
                <span className="text-gray-600 ml-2">{t('payments.overdueInvoices')}:</span> 
                <span className="font-bold">
                  {/* This would ideally come from API */}
                  {selectedClient.balance > 0 ? '1 فاتورة' : '0 فواتير'}
                </span>
              </p>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  {t('payments.paymentNote')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-end space-x-4 space-x-reverse">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => form.reset()}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            type="submit" 
            disabled={createPayment.isPending}
          >
            {createPayment.isPending ? t('common.loading') : t('payments.submitPayment')}
          </Button>
        </div>
      </form>
    </Form>
  );
}