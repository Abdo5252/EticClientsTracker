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
      const res = await fetch('/api/auth', {
        credentials: 'include',
      });
      
      if (res.ok) {
        try {
          const userData = await res.json();
          setUser(userData.user);
        } catch (parseError) {
          console.error('Error parsing auth response:', parseError);
          setUser(null);
        }
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
      const res = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        const userData = await res.json();
        setUser(userData.user);
        return true;
      } else {
        // Handle non-JSON responses safely
        let errorMessage = 'اسم المستخدم أو كلمة المرور غير صحيحة';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        toast({
          title: 'خطأ في تسجيل الدخول',
          description: errorMessage,
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
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
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
