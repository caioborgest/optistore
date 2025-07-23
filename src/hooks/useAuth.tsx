
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, Company } from '@/types/database';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: UserProfile | null;
  userProfile: UserProfile | null;
  company: Company | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  registerCompany: (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error?: string }>;
  registerWithInvite: (inviteCode: string, userData?: { name: string; email: string; password: string }) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const { user, company, error } = await authService.getCurrentUser();
      
      if (error) {
        console.log('Usuário não autenticado:', error);
        setUser(null);
        setCompany(null);
      } else if (user) {
        setUser(user);
        setCompany(company || null);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setUser(null);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user, company, error } = await authService.signIn(email, password);
      
      if (error) {
        return { error };
      }

      setUser(user || null);
      setCompany(company || null);

      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { user, error } = await authService.signUp(email, password, name);
      
      if (error) {
        return { error };
      }

      setUser(user || null);
      
      toast({
        title: 'Cadastro realizado com sucesso',
        description: 'Sua conta foi criada!'
      });

      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setCompany(null);
      
      toast({
        title: 'Logout realizado',
        description: 'Até logo!'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer logout',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const { user, error } = await authService.updateProfile(updates);
      
      if (error) {
        toast({
          title: 'Erro ao atualizar perfil',
          description: error,
          variant: 'destructive'
        });
        return;
      }

      setUser(user || null);
      
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const registerCompany = async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { company, error } = await authService.registerCompany(companyData);
      
      if (error) {
        return { error };
      }

      setCompany(company || null);
      
      toast({
        title: 'Empresa registrada',
        description: 'Sua empresa foi registrada com sucesso!'
      });

      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const registerWithInvite = async (inviteCode: string, userData?: { name: string; email: string; password: string }) => {
    try {
      const { user, company, error } = await authService.registerWithInvite(inviteCode, userData);
      
      if (error) {
        return { error };
      }

      setUser(user || null);
      setCompany(company || null);
      
      toast({
        title: 'Convite aceito',
        description: 'Você foi adicionado à empresa!'
      });

      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const value: AuthContextType = {
    user,
    userProfile: user,
    company,
    isAuthenticated: !!user,
    loading,
    signIn,
    signUp,
    logout,
    updateProfile,
    registerCompany,
    registerWithInvite,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
