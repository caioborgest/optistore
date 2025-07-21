
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '@/services/authService';
import { UserProfile, Company } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: any;
  userProfile: UserProfile | null;
  company: Company | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();

  const loadCurrentUser = async () => {
    try {
      const { user, userProfile, company, error } = await AuthService.getCurrentUser();
      
      if (error) {
        console.error('Erro ao carregar usuário:', error);
        setUser(null);
        setUserProfile(null);
        setCompany(null);
      } else {
        setUser(user);
        setUserProfile(userProfile);
        setCompany(company);
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
    try {
      setLoading(true);
      const { user, userProfile, company, error } = await AuthService.signIn(email, password);
      
      if (error) {
        toast({
          title: 'Erro no login',
          description: error.message || 'Credenciais inválidas',
          variant: 'destructive'
        });
        return;
      }

      setUser(user);
      setUserProfile(userProfile);
      setCompany(company);

      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo(a), ${userProfile?.name}!`
      });
    } catch (error) {
      toast({
        title: 'Erro no login',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: any) => {
    try {
      setLoading(true);
      const { user, userProfile, company, error } = await AuthService.signUp(data);
      
      if (error) {
        toast({
          title: 'Erro no cadastro',
          description: error.message || 'Erro ao criar conta',
          variant: 'destructive'
        });
        return;
      }

      setUser(user);
      setUserProfile(userProfile);
      setCompany(company);

      toast({
        title: 'Conta criada com sucesso',
        description: `Bem-vindo(a), ${userProfile?.name}!`
      });
    } catch (error) {
      toast({
        title: 'Erro no cadastro',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await AuthService.signOut();
      setUser(null);
      setUserProfile(null);
      setCompany(null);
      
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso'
      });
    } catch (error) {
      toast({
        title: 'Erro no logout',
        description: 'Ocorreu um erro ao sair',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const { userProfile, error } = await AuthService.updateProfile(updates);
      
      if (error) {
        toast({
          title: 'Erro ao atualizar perfil',
          description: error.message || 'Erro ao salvar alterações',
          variant: 'destructive'
        });
        return;
      }

      setUserProfile(userProfile);
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso'
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar perfil',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      });
    }
  };

  const value = {
    user,
    userProfile,
    company,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
