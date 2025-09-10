import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Check if we're in development mode with mock Supabase
const isDevelopment = import.meta.env.VITE_SUPABASE_URL === 'https://example.supabase.co';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDevelopment) {
      // In development mode, check for mock user in localStorage
      const mockUser = localStorage.getItem('mockUser');
      if (mockUser) {
        setUser(JSON.parse(mockUser));
      }
      setLoading(false);
    } else {
      // In production, use Supabase auth
      // Check for existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isDevelopment) {
        // Mock sign up for development
        console.log('Development mode: Mock sign up with', email);
        // Create a mock user
        const mockUser = {
          id: '123456',
          email: email,
          user_metadata: { name: 'Dev User' },
        } as User;
        setUser(mockUser);
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        return { success: true };
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return { success: true };
      }
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isDevelopment) {
        // Mock authentication for development
        console.log('Development mode: Mock sign in with', email);
        // Create a mock user
        const mockUser = {
          id: '123456',
          email: email,
          user_metadata: { name: 'Dev User' },
        } as User;
        setUser(mockUser);
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        return { success: true };
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return { success: true };
      }
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (isDevelopment) {
        // Mock sign out for development
        console.log('Development mode: Mock sign out');
        setUser(null);
        localStorage.removeItem('mockUser');
      } else {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}