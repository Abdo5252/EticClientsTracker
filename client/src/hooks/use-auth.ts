import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface User {
  id: string;
  username: string;
  displayName: string;
  role: string;
  email?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Convert Firebase user to our User format
  const transformFirebaseUser = (firebaseUser: FirebaseUser): User => {
    return {
      id: firebaseUser.uid,
      username: firebaseUser.email?.split('@')[0] || '',
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
      email: firebaseUser.email || '',
      role: 'user' // Default role, could be fetched from Firestore if needed
    };
  };

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        console.log('User is authenticated:', firebaseUser.email);
        setUser(transformFirebaseUser(firebaseUser));
      } else {
        console.log('User is not authenticated');
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Attempting login with Firebase...');

      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth, 
        email, 
        password
      );

      console.log('Login successful, user:', userCredential.user.email);

      // User will be set by the onAuthStateChanged listener
      return true;
    } catch (error: any) {
      console.error('Login error:', error);

      let errorMessage = 'حدث خطأ أثناء محاولة تسجيل الدخول';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'تم تعطيل الحساب مؤقتًا بسبب العديد من محاولات تسجيل الدخول الفاشلة';
      }

      toast({
        title: 'خطأ في تسجيل الدخول',
        description: errorMessage,
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
      await signOut(auth);
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

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}