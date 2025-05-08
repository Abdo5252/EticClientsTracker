import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { t } from "@/lib/i18n";

export default function Payments() {
  return (
    <Layout>
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">{t('payments.title')}</h2>
          
          {/* Payment Form Component */}
          <PaymentForm />
        </div>
      </div>
    </Layout>
  );
}
