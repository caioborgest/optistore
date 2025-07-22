import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/services/supabaseClient';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'gerente' | 'supervisor' | 'colaborador';
  sector?: string;
  avatar_url?: string;
  is_company_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão existente
    checkSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao carregar perfil:', error);
        return;
      }

      setUser(profile);
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
      }

      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ error?: string }> => {
    try {
      if (!user) {
        return { error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      setUser(data);
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}