
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/database';

export const authService = {
  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      const userProfile: UserProfile = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: 'colaborador',
        is_active: true,
        is_company_admin: profile.is_company_admin,
        avatar_url: profile.avatar_url,
        company_id: profile.company_id,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      return { user: userProfile, session: data.session };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login');
    }
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    company_id?: string;
    is_company_admin?: boolean;
  }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            name: userData.name,
            email: userData.email,
            company_id: userData.company_id,
            is_company_admin: userData.is_company_admin || false,
          })
          .select()
          .single();

        if (profileError) {
          throw profileError;
        }

        const userProfile: UserProfile = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: 'colaborador',
          is_active: true,
          is_company_admin: profile.is_company_admin,
          avatar_url: profile.avatar_url,
          company_id: profile.company_id,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };

        return { user: userProfile, session: data.session };
      }

      throw new Error('Falha ao criar usuário');
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao registrar usuário');
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      const userProfile: UserProfile = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: 'colaborador',
        is_active: true,
        is_company_admin: profile.is_company_admin,
        avatar_url: profile.avatar_url,
        company_id: profile.company_id,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      return userProfile;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao obter usuário atual');
    }
  },

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer logout');
    }
  },

  async updateProfile(updates: Partial<UserProfile>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao atualizar perfil');
    }
  },
};
