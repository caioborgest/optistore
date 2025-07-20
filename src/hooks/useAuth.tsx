
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { MockAuthService } from '@/services/mockAuthService';
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

// Helper function to create a mock User object that matches Supabase User type
const createMockUser = (id: string, email: string): User => ({
  id,
  email,
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString()
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadCurrentUser = async () => {
    try {
      const { user, userProfile, company } = await MockAuthService.getCurrentUser();
      if (user && userProfile && company) {
        setUser(createMockUser(user.id, user.email));
        setUserProfile(userProfile);
        setCompany(company);
        console.log('✅ Usuário carregado:', userProfile.name);
      } else {
        setUser(null);
        setUserProfile(null);
        setCompany(null);
        console.log('❌ Nenhum usuário autenticado');
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setUser(null);
      setUserProfile(null);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Tentando fazer login...');
    setLoading(true);
    
    try {
      const { user, userProfile, company, error } = await MockAuthService.signIn(email, password);

      if (error) {
        toast({
          title: "Erro ao entrar",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      setUser(createMockUser(user.id, user.email));
      setUserProfile(userProfile);
      setCompany(company);
      
      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso.",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro ao entrar",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    sector: string, 
    role: 'admin' | 'manager' | 'employee' = 'employee'
  ) => {
    setLoading(true);
    
    try {
      const { user, userProfile, company, error } = await MockAuthService.signUp({
        email,
        password,
        name,
        role,
        sector
      });

      if (error) {
        toast({
          title: "Erro ao cadastrar",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      setUser(createMockUser(user.id, user.email));
      setUserProfile(userProfile);
      setCompany(company);
      
      toast({
        title: "Cadastro realizado!",
        description: "Conta criada com sucesso.",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      toast({
        title: "Erro ao cadastrar",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      await MockAuthService.signOut();
      setUser(null);
      setUserProfile(null);
      setCompany(null);
      
      toast({
        title: "Até logo!",
        description: "Logout realizado com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro no logout:', error);
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return { error: new Error('Usuário não autenticado') };

    try {
      const { userProfile: updatedProfile, error } = await MockAuthService.updateProfile(updates);
      
      if (error) {
        toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      setUserProfile(updatedProfile);
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      return { error };
    }
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
    setLoading(true);
    
    try {
      const { company, adminUser, error } = await MockAuthService.registerCompany(companyData);
      
      if (error) {
        toast({
          title: "Erro ao registrar empresa",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Fazer login automático do admin
      setUser(createMockUser(adminUser!.id, adminUser!.email));
      setUserProfile(adminUser);
      setCompany(company);
      
      toast({
        title: "Empresa registrada!",
        description: `${company!.name} foi criada com sucesso. Você já está logado como administrador.`,
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Erro no registro da empresa:', error);
      toast({
        title: "Erro ao registrar empresa",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
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
