import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  displayName: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/user', {
        credentials: 'include',
      });
      
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await apiRequest('POST', '/api/auth/login', { username, password });
      
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        return true;
      } else {
        const errorData = await res.json();
        toast({
          title: 'خطأ في تسجيل الدخول',
          description: errorData.message || 'اسم المستخدم أو كلمة المرور غير صحيحة',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'خطأ في تسجيل الدخول',
        description: 'حدث خطأ أثناء محاولة تسجيل الدخول',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      setUser(null);
      setLocation('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'خطأ في تسجيل الخروج',
        description: 'حدث خطأ أثناء محاولة تسجيل الخروج',
        variant: 'destructive',
      });
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
