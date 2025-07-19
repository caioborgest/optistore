import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string, sector: string, role?: 'gerente' | 'supervisor' | 'colaborador') => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  hasPermission: (resource: string, action: 'create' | 'read' | 'update' | 'delete', targetUserId?: string, targetSector?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar perfil do usuário
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setUserProfile(data);
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
          // Carregar perfil do usuário
          await loadUserProfile(session.user.id);
          
          // Atualizar último login
          await supabase
            .from('users')
            .update({ 
              last_login: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Verificar sessão atual
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const errorMessage = translateAuthError(error.message);
      toast({
        title: "Erro ao entrar",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso.",
      });
    }

    return { error };
  };

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    sector: string, 
    role: 'gerente' | 'supervisor' | 'colaborador' = 'colaborador'
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          sector,
          role
        }
      }
    });

    if (error) {
      const errorMessage = translateAuthError(error.message);
      toast({
        title: "Erro ao cadastrar",
        description: errorMessage,
        variant: "destructive",
      });
    } else if (data.user) {
      // Criar perfil na tabela users
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email,
          name,
          sector,
          role
        });

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
      }

      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu email para confirmar a conta.",
      });
    }

    return { error };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
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
    if (!user) return { error: 'Usuário não autenticado' };

    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (!error) {
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    }

    return { error };
  };

  const hasPermission = (
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete',
    targetUserId?: string,
    targetSector?: string
  ): boolean => {
    if (!userProfile) return false;

    const { role, sector, id: userId } = userProfile;

    // Gerente tem acesso total
    if (role === 'gerente') return true;

    switch (resource) {
      case 'tasks':
        return checkTaskPermission(role, sector, action, targetUserId, targetSector, userId);
      case 'users':
        return checkUserPermission(role, sector, action, targetUserId, targetSector);
      case 'chats':
        return checkChatPermission(role, action);
      case 'reports':
        return checkReportPermission(role, sector, targetSector);
      default:
        return false;
    }
  };

  // Funções auxiliares para verificação de permissões
  const checkTaskPermission = (
    role: string,
    userSector: string,
    action: string,
    targetUserId?: string,
    targetSector?: string,
    userId?: string
  ): boolean => {
    switch (action) {
      case 'create':
        return role === 'supervisor';
      case 'read':
        if (targetUserId === userId) return true;
        if (role === 'supervisor' && targetSector === userSector) return true;
        return false;
      case 'update':
        if (targetUserId === userId) return true;
        if (role === 'supervisor' && targetSector === userSector) return true;
        return false;
      case 'delete':
        return role === 'supervisor' && targetSector === userSector;
      default:
        return false;
    }
  };

  const checkUserPermission = (
    role: string,
    userSector: string,
    action: string,
    targetUserId?: string,
    targetSector?: string
  ): boolean => {
    switch (action) {
      case 'create':
        return role === 'gerente';
      case 'read':
        if (role === 'supervisor' && targetSector === userSector) return true;
        return true; // Todos podem ver informações básicas
      case 'update':
        if (role === 'supervisor' && targetSector === userSector) return true;
        return false;
      case 'delete':
        return role === 'gerente';
      default:
        return false;
    }
  };

  const checkChatPermission = (role: string, action: string): boolean => {
    switch (action) {
      case 'create':
      case 'read':
      case 'update':
        return true;
      case 'delete':
        return role === 'supervisor' || role === 'gerente';
      default:
        return false;
    }
  };

  const checkReportPermission = (
    role: string,
    userSector: string,
    targetSector?: string
  ): boolean => {
    if (role === 'gerente') return true;
    if (role === 'supervisor' && targetSector === userSector) return true;
    return false;
  };

  const translateAuthError = (errorMessage: string): string => {
    const translations: { [key: string]: string } = {
      'Invalid login credentials': 'Email ou senha incorretos',
      'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
      'User already registered': 'Usuário já cadastrado com este email',
      'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
      'Unable to validate email address: invalid format': 'Formato de email inválido',
      'Signup is disabled': 'Cadastro desabilitado',
      'Email rate limit exceeded': 'Muitas tentativas. Tente novamente mais tarde.'
    };

    return translations[errorMessage] || errorMessage;
  };

  const value = {
    user,
    session,
    userProfile,
    isAuthenticated: !!user,
    loading,
    signIn,
    signUp,
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