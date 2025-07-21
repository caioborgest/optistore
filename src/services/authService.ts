
import { supabase } from '@/integrations/supabase/client';
import type { UserProfile, Company } from '@/types/database';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'employee';
  sector?: string;
  companyId?: string;
}

export class AuthService {
  /**
   * Fazer login do usuário
   */
  static async signIn(email: string, password: string): Promise<{ user: any; userProfile: UserProfile | null; company: Company | null; error: any }> {
    try {
      console.log('🔑 Tentando fazer login com:', email);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.log('❌ Erro de autenticação:', authError);
        return { user: null, userProfile: null, company: null, error: authError };
      }

      if (!authData.user) {
        return { user: null, userProfile: null, company: null, error: { message: 'Usuário não encontrado' } };
      }

      // Buscar perfil do usuário
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.log('❌ Erro ao buscar perfil:', profileError);
        return { user: authData.user, userProfile: null, company: null, error: profileError };
      }

      // Buscar empresa do usuário
      let company = null;
      if (userProfile?.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', userProfile.company_id)
          .single();

        if (!companyError) {
          company = companyData;
        }
      }

      // Atualizar último login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authData.user.id);

      console.log('✅ Login realizado com sucesso');
      return { user: authData.user, userProfile, company, error: null };

    } catch (error) {
      console.error('💥 Erro geral no login:', error);
      return { user: null, userProfile: null, company: null, error };
    }
  }

  /**
   * Registrar novo usuário
   */
  static async signUp(data: RegisterData): Promise<{ user: any; userProfile: UserProfile | null; company: Company | null; error: any }> {
    try {
      console.log('📝 Registrando usuário:', data);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name
          }
        }
      });

      if (authError) {
        console.log('❌ Erro ao registrar:', authError);
        return { user: null, userProfile: null, company: null, error: authError };
      }

      if (!authData.user) {
        return { user: null, userProfile: null, company: null, error: { message: 'Falha ao criar usuário' } };
      }

      // Criar perfil do usuário
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: data.name,
          email: data.email,
          role: data.role || 'employee',
          sector: data.sector || 'Geral',
          company_id: data.companyId,
          is_active: true,
          is_company_admin: data.role === 'admin'
        })
        .select()
        .single();

      if (profileError) {
        console.log('❌ Erro ao criar perfil:', profileError);
        return { user: authData.user, userProfile: null, company: null, error: profileError };
      }

      // Buscar empresa se fornecida
      let company = null;
      if (data.companyId) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('id', data.companyId)
          .single();

        company = companyData;
      }

      console.log('✅ Usuário registrado com sucesso');
      return { user: authData.user, userProfile, company, error: null };

    } catch (error) {
      console.error('💥 Erro geral no registro:', error);
      return { user: null, userProfile: null, company: null, error };
    }
  }

  /**
   * Fazer logout
   */
  static async signOut(): Promise<{ error: any }> {
    try {
      console.log('🚪 Fazendo logout');
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('💥 Erro no logout:', error);
      return { error };
    }
  }

  /**
   * Obter usuário atual
   */
  static async getCurrentUser(): Promise<{ user: any; userProfile: UserProfile | null; company: Company | null; error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { user: null, userProfile: null, company: null, error: authError };
      }

      // Buscar perfil do usuário
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        return { user, userProfile: null, company: null, error: profileError };
      }

      // Buscar empresa do usuário
      let company = null;
      if (userProfile?.company_id) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('id', userProfile.company_id)
          .single();

        company = companyData;
      }

      return { user, userProfile, company, error: null };

    } catch (error) {
      console.error('💥 Erro ao obter usuário atual:', error);
      return { user: null, userProfile: null, company: null, error };
    }
  }

  /**
   * Atualizar perfil do usuário
   */
  static async updateProfile(updates: Partial<UserProfile>): Promise<{ userProfile: UserProfile | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { userProfile: null, error: { message: 'Usuário não autenticado' } };
      }

      const { data: userProfile, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      return { userProfile, error };

    } catch (error) {
      console.error('💥 Erro ao atualizar perfil:', error);
      return { userProfile: null, error };
    }
  }
}
