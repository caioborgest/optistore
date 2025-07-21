
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, Company } from '@/types/database';

interface AuthResponse {
  user?: any;
  company?: Company;
  error?: string;
}

export const AuthService = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
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

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select(`
          *,
          companies (*)
        `)
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        return { error: 'Erro ao carregar perfil do usuário' };
      }

      return { 
        user: {
          ...profile,
          role: profile.role || 'employee',
          is_active: profile.is_active || true,
        }, 
        company: profile.companies 
      };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async signUp(email: string, password: string, name: string): Promise<AuthResponse> {
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
        return { error: error.message };
      }

      if (!data.user) {
        return { error: 'Falha no cadastro' };
      }

      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            name,
            email,
            role: 'employee',
            is_active: true,
            is_company_admin: false,
          },
        ])
        .select()
        .single();

      if (profileError) {
        return { error: 'Erro ao criar perfil do usuário' };
      }

      return { user: profile };
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

  async getCurrentUser(): Promise<{ user?: UserProfile; company?: Company; error?: string }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        return { error: error.message };
      }

      if (!user) {
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
        return { error: 'Erro ao carregar perfil do usuário' };
      }

      return { 
        user: {
          ...profile,
          role: profile.role || 'employee',
          is_active: profile.is_active || true,
        }, 
        company: profile.companies 
      };
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

      const { data: profile, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { user: profile };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async registerCompany(companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<AuthResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return { error: 'Usuário não autenticado' };
      }

      const { data: company, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // Update user to be company admin
      const { error: updateError } = await supabase
        .from('users')
        .update({
          company_id: company.id,
          is_company_admin: true,
          role: 'admin',
        })
        .eq('id', user.id);

      if (updateError) {
        return { error: updateError.message };
      }

      return { company };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async registerWithInvite(inviteCode: string): Promise<AuthResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return { error: 'Usuário não autenticado' };
      }

      // Find company by invite code
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (companyError) {
        return { error: 'Código de convite inválido' };
      }

      // Update user with company
      const { error: updateError } = await supabase
        .from('users')
        .update({
          company_id: company.id,
          role: 'employee',
        })
        .eq('id', user.id);

      if (updateError) {
        return { error: updateError.message };
      }

      return { company };
    } catch (error: any) {
      return { error: error.message };
    }
  },
};
