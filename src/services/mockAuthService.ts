
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/database';

export type UserRole = 'admin' | 'manager' | 'employee';

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

    // Try to get from users table first
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userData) {
      const profile: UserProfile = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        avatar_url: userData.avatar_url,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        company_id: userData.company_id,
        role: 'employee',
        sector: 'Geral',
        is_active: true,
        is_company_admin: userData.is_company_admin || false
      };
      return { profile, error: null };
    }

    // Fallback to mock profile from user metadata
    const mockProfile: UserProfile = {
      id: user.id,
      name: user.user_metadata?.name || user.email || 'Usuário',
      email: user.email || '',
      avatar_url: user.user_metadata?.avatar_url,
      role: (user.user_metadata?.role as UserRole) || 'employee',
      sector: user.user_metadata?.sector || 'Geral',
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at,
      company_id: '1',
      is_active: true,
      is_company_admin: false
    };

    return { profile: mockProfile, error: null };
  }

  static async getUsers(): Promise<{ users: UserProfile[] | null; error: Error | null }> {
    // Mock users data
    const mockUsers: UserProfile[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@exemplo.com',
        role: 'manager',
        sector: 'Vendas',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        company_id: '1',
        is_active: true,
        is_company_admin: false
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@exemplo.com',
        role: 'employee',
        sector: 'Estoque',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        company_id: '1',
        is_active: true,
        is_company_admin: false
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
