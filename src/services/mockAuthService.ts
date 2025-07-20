
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'manager' | 'employee';

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  sector?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export class MockAuthService {
  static async signIn(credentials: LoginCredentials): Promise<{ user: User | null; error: Error | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    if (error) {
      return { user: null, error: new Error(this.translateAuthError(error.message)) };
    }

    return { user: data.user, error: null };
  }

  static async signUp(userData: RegisterData): Promise<{ user: User | null; error: Error | null }> {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          role: userData.role || 'employee'
        }
      }
    });

    if (error) {
      return { user: null, error: new Error(this.translateAuthError(error.message)) };
    }

    return { user: data.user, error: null };
  }

  static async signOut(): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  static async getCurrentUserProfile(): Promise<{ profile: UserProfile | null; error: Error | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { profile: null, error: new Error('Usuário não autenticado') };
    }

    // Try to get from profiles table, fallback to user metadata
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileData) {
      return { profile: profileData, error: null };
    }

    // Fallback to mock profile from user metadata
    const mockProfile: UserProfile = {
      id: user.id,
      user_id: user.id,
      name: user.user_metadata?.name || user.email || 'Usuário',
      avatar_url: user.user_metadata?.avatar_url,
      role: (user.user_metadata?.role as UserRole) || 'employee',
      sector: user.user_metadata?.sector,
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at
    };

    return { profile: mockProfile, error: null };
  }

  static async getUsers(): Promise<{ users: UserProfile[] | null; error: Error | null }> {
    // Mock users data
    const mockUsers: UserProfile[] = [
      {
        id: '1',
        user_id: '1',
        name: 'João Silva',
        role: 'manager',
        sector: 'Vendas',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        user_id: '2',
        name: 'Maria Santos',
        role: 'employee',
        sector: 'Estoque',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return { users: mockUsers, error: null };
  }

  private static translateAuthError(errorMessage: string): string {
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
  }
}

export const useMockAuthService = () => {
  const signIn = async (credentials: LoginCredentials) => {
    return await MockAuthService.signIn(credentials);
  };

  const signUp = async (userData: RegisterData) => {
    return await MockAuthService.signUp(userData);
  };

  const signOut = async () => {
    return await MockAuthService.signOut();
  };

  const getCurrentUserProfile = async () => {
    return await MockAuthService.getCurrentUserProfile();
  };

  const getUsers = async () => {
    return await MockAuthService.getUsers();
  };

  return {
    signIn,
    signUp,
    signOut,
    getCurrentUserProfile,
    getUsers
  };
};
