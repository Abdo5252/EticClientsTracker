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
      console.log('Checking authentication...');
      const res = await fetch('/api/auth', {
        credentials: 'include',
      });
      
      console.log('Auth check response status:', res.status);
      
      if (res.ok) {
        try {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const userData = await res.json();
            console.log('Auth check successful, user data:', userData);
            setUser(userData.user);
          } else {
            console.error('Auth response is not JSON:', await res.text());
            setUser(null);
          }
        } catch (parseError) {
          console.error('Error parsing auth response:', parseError);
          setUser(null);
        }
      } else {
        console.log('Auth check failed with status:', res.status);
        try {
          const errorText = await res.text();
          console.error('Auth error response:', errorText);
        } catch (e) {
          console.error('Could not read auth error response');
        }
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
      console.log('Attempting login request...');
      const res = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      console.log('Login response status:', res.status);
      console.log('Content-Type:', res.headers.get('Content-Type'));
      
      if (res.ok) {
        const contentType = res.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          const userData = await res.json();
          console.log('Login successful, user data:', userData);
          setUser(userData.user);
          return true;
        } else {
          // Handle non-JSON success response
          console.error('Unexpected content type for success response:', contentType);
          const textResponse = await res.text();
          console.error('Response body:', textResponse);
          toast({
            title: 'خطأ في النظام',
            description: 'تم تسجيل الدخول ولكن رد الخادم غير صحيح',
            variant: 'destructive',
          });
          return false;
        }
      } else {
        // Handle non-JSON responses safely
        let errorMessage = 'اسم المستخدم أو كلمة المرور غير صحيحة';
        
        try {
          const contentType = res.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            // If not JSON, get the text for debugging
            const textResponse = await res.text();
            console.error('Non-JSON error response:', textResponse);
          }
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
