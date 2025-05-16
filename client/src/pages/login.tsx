import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { t } from '@/lib/i18n';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  email: z.string().email(t('login.validEmailRequired')),
  password: z.string().min(6, t('login.passwordLengthRequired')),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await login(values.email, values.password);
      
      if (success) {
        setLocation('/');
      } else {
        setError(t('login.error'));
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(t('login.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">{t('common.appName')}</h1>
          <p className="text-gray-700">{t('common.appDescription')}</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">{t('login.email')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder={t('login.email')} 
                      {...field} 
                      className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">{t('login.password')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={t('login.password')} 
                      {...field} 
                      className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 px-4 rounded-lg transition duration-200 font-medium text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                  <span>{t('common.loading')}</span>
                </div>
              ) : t('login.loginButton')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
