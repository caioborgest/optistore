
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, Company } from '@/types/database';

export const AuthService = {
  async getCurrentUser(): Promise<{ user?: UserProfile; company?: Company; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return { error: 'Usuário não autenticado' };
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select(`
          *,
          companies (*)
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        return { error: profileError.message };
      }

      const userProfile: UserProfile = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        company_id: profile.company_id,
        is_company_admin: profile.is_company_admin,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      };

      return { 
        user: userProfile, 
        company: profile.companies 
      };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async signIn(email: string, password: string): Promise<{ user?: UserProfile; company?: Company; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (!data.user) {
        return { error: 'Falha na autenticação' };
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select(`
          *,
          companies (*)
        `)
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        return { error: profileError.message };
      }

      const userProfile: UserProfile = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        company_id: profile.company_id,
        is_company_admin: profile.is_company_admin,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      };

      return { 
        user: userProfile, 
        company: profile.companies 
      };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async signUp(email: string, password: string, name: string): Promise<{ user?: UserProfile; error?: string }> {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        return { error: error.message };
      }

      if (!data.user) {
        return { error: 'Falha no cadastro' };
      }

      const userProfile: UserProfile = {
        id: data.user.id,
        name: name,
        email: email,
        avatar_url: '',
        company_id: '',
        is_company_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return { user: userProfile };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<{ user?: UserProfile; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return { error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      const userProfile: UserProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        avatar_url: data.avatar_url,
        company_id: data.company_id,
        is_company_admin: data.is_company_admin,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return { user: userProfile };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async registerCompany(companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<{ company?: Company; error?: string }> {
    try {
      // Criar a empresa
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyData.name,
          email: companyData.email,
          phone: companyData.phone,
          address: companyData.address,
          is_active: companyData.is_active,
          invite_code: companyData.invite_code
        })
        .select()
        .single();

      if (companyError) {
        return { error: companyError.message };
      }

      return { company };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async registerWithInvite(inviteCode: string, userData?: { name: string; email: string; password: string }): Promise<{ user?: UserProfile; company?: Company; error?: string }> {
    try {
      // Verificar se o código de convite existe
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('invite_code', inviteCode)
        .eq('is_active', true)
        .single();

      if (companyError || !company) {
        return { error: 'Código de convite inválido ou expirado' };
      }

      if (userData) {
        // Criar novo usuário
        const redirectUrl = `${window.location.origin}/`;
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
            },
            emailRedirectTo: redirectUrl
          }
        });

        if (authError) {
          return { error: authError.message };
        }

        if (!authData.user) {
          return { error: 'Falha no cadastro' };
        }

        // Atualizar o perfil do usuário com a empresa
        const { error: updateError } = await supabase
          .from('users')
          .update({
            company_id: company.id,
            is_company_admin: false
          })
          .eq('id', authData.user.id);

        if (updateError) {
          return { error: updateError.message };
        }

        const userProfile: UserProfile = {
          id: authData.user.id,
          name: userData.name,
          email: userData.email,
          avatar_url: '',
          company_id: company.id,
          is_company_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        return { user: userProfile, company };
      }

      return { company };
    } catch (error: any) {
      return { error: error.message };
    }
  },
};
