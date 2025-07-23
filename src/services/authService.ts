
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, Company } from '@/types/database';

export const authService = {
  async getCurrentUser() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { user: null, company: null, error: 'Usuário não autenticado' };
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        return { user: null, company: null, error: profileError.message };
      }

      const userProfile: UserProfile = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role || 'colaborador',
        sector: profile.sector,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        is_active: profile.is_active !== false,
        is_company_admin: profile.is_company_admin || false,
        company_id: profile.company_id,
        last_login: profile.last_login,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      };

      let company = null;
      if (profile.company_id) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single();
        
        company = companyData;
      }

      return { user: userProfile, company, error: null };
    } catch (error: any) {
      return { user: null, company: null, error: error.message };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, company: null, error: error.message };
      }

      return await this.getCurrentUser();
    } catch (error: any) {
      return { user: null, company: null, error: error.message };
    }
  },

  async signUp(email: string, password: string, name: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            name,
            email,
            role: 'colaborador',
            is_active: true,
            is_company_admin: false
          }]);

        if (profileError) {
          return { user: null, error: profileError.message };
        }
      }

      return await this.getCurrentUser();
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async updateProfile(updates: Partial<UserProfile>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { user: null, error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { user: null, error: error.message };
      }

      const userProfile: UserProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role || 'colaborador',
        sector: data.sector,
        phone: data.phone,
        avatar_url: data.avatar_url,
        is_active: data.is_active !== false,
        is_company_admin: data.is_company_admin || false,
        company_id: data.company_id,
        last_login: data.last_login,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return { user: userProfile, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  async registerCompany(companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (error) {
        return { company: null, error: error.message };
      }

      return { company: data, error: null };
    } catch (error: any) {
      return { company: null, error: error.message };
    }
  },

  async registerWithInvite(inviteCode: string, userData?: { name: string; email: string; password: string }) {
    // Implementação básica - pode ser expandida conforme necessário
    return { user: null, company: null, error: 'Função não implementada' };
  }
};
