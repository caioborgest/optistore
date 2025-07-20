
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MockAuthService, LoginCredentials, RegisterData } from '@/services/mockAuthService';
import { UserProfile, Company } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  company: Company | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, sector: string, role?: 'admin' | 'manager' | 'employee') => Promise<{ error: Error | null }>;
  registerCompany: (companyData: any) => Promise<{ error: Error | null }>;
  registerWithInvite: (inviteData: any) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  hasPermission: (resource: string, action: 'create' | 'read' | 'update' | 'delete', targetUserId?: string, targetSector?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadUserProfile = async (userId: string) => {
    try {
      const { profile } = await MockAuthService.getCurrentUserProfile();
      if (profile) {
        setUserProfile(profile);
        
        // Mock company data
        const mockCompany: Company = {
          id: '1',
          name: 'Empresa Exemplo',
          email: 'contato@exemplo.com',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          phone: '(11) 99999-9999',
          address: 'Rua Exemplo, 123',
          invite_code: 'ABC12345'
        };
        setCompany(mockCompany);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
          setCompany(null);
        }
        
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await MockAuthService.signIn({ email, password });

    if (error) {
      toast({
        title: "Erro ao entrar",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } else {
      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso.",
      });
      return { error: null };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    sector: string, 
    role: 'admin' | 'manager' | 'employee' = 'employee'
  ) => {
    const { error } = await MockAuthService.signUp({
      email,
      password,
      name,
      role
    });

    if (error) {
      toast({
        title: "Erro ao cadastrar",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } else {
      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu email para confirmar a conta.",
      });
      return { error: null };
    }
  };

  const logout = async () => {
    const { error } = await MockAuthService.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Até logo!",
        description: "Logout realizado com sucesso.",
      });
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return { error: new Error('Usuário não autenticado') };

    setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram atualizadas com sucesso.",
    });
    return { error: null };
  };

  const hasPermission = (
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete',
    targetUserId?: string,
    targetSector?: string
  ): boolean => {
    if (!userProfile) return false;
    
    // Mock permission logic
    if (userProfile.role === 'admin') return true;
    if (userProfile.role === 'manager' && action !== 'delete') return true;
    if (action === 'read') return true;
    
    return false;
  };

  const registerCompany = async (companyData: any) => {
    // Mock implementation
    toast({
      title: "Empresa registrada!",
      description: "Sua empresa foi criada com sucesso.",
    });
    return { error: null };
  };

  const registerWithInvite = async (inviteData: any) => {
    // Mock implementation
    toast({
      title: "Cadastro realizado!",
      description: "Bem-vindo à equipe!",
    });
    return { error: null };
  };

  const value = {
    user,
    session,
    userProfile,
    company,
    isAuthenticated: !!user,
    loading,
    signIn,
    signUp,
    registerCompany,
    registerWithInvite,
    logout,
    updateProfile,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
