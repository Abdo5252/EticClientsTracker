import { t } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export function ClientUploader() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('clients.upload.title')}</CardTitle>
        <CardDescription>{t('clients.upload.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-600">Client data information</AlertTitle>
          <AlertDescription>
            Client data is now loaded directly from the clients-data.json file in the project root. 
            The upload feature has been disabled.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}