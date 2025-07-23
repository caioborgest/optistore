import { supabase } from "@/integrations/supabase/client";
import { UserProfile, Company } from "@/types/database";

export const authService = {
  async getCurrentUser() {
    try {
      // Verificar se há um usuário de teste
      const testUserStr = localStorage.getItem('optiflow_test_user');
      const testCompanyStr = localStorage.getItem('optiflow_test_company');
      
      if (testUserStr && testCompanyStr) {
        console.log('Usando usuário de teste');
        const testUser = JSON.parse(testUserStr);
        const testCompany = JSON.parse(testCompanyStr);
        return { user: testUser, company: testCompany, error: null };
      }
      
      // Verificar usuário do Supabase
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.log(
          "Usuário não autenticado:",
          authError?.message || "Sem sessão ativa"
        );
        return { user: null, company: null, error: "Usuário não autenticado" };
      }

      // Verificar se o usuário existe na tabela users
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.log("Perfil não encontrado:", profileError.message);
        // Fazer logout se o perfil não existir
        await supabase.auth.signOut();
        return {
          user: null,
          company: null,
          error: "Perfil de usuário não encontrado",
        };
      }

      if (!profile) {
        console.log("Perfil não encontrado (vazio)");
        // Fazer logout se o perfil não existir
        await supabase.auth.signOut();
        return {
          user: null,
          company: null,
          error: "Perfil de usuário não encontrado",
        };
      }

      const userProfile: UserProfile = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role || "colaborador", // Use o papel do banco de dados
        sector: profile.sector,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        is_active: profile.is_active !== false, // Default para true se não definido
        is_company_admin: profile.is_company_admin || false,
        company_id: profile.company_id,
        last_login: profile.last_login,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      // Atualizar último login
      await supabase
        .from("users")
        .update({
          last_login: new Date().toISOString(),
        })
        .eq("id", user.id);

      let company = null;
      if (profile.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("id", profile.company_id)
          .single();

        if (companyError) {
          console.log("Erro ao buscar empresa:", companyError.message);
        } else {
          company = companyData;
        }
      }

      return { user: userProfile, company, error: null };
    } catch (error: any) {
      console.error("Erro ao verificar autenticação:", error);
      return { user: null, company: null, error: error.message };
    }
  },

  async signIn(email: string, password: string) {
    try {
      console.log('Attempting to sign in with:', email);
      
      // Usuário de teste para desenvolvimento
      if (email === 'admin@optiflow.com' && password === 'password123') {
        console.log('Using test user credentials');
        
        // Criar um usuário de teste
        const testUser: UserProfile = {
          id: 'test-user-id',
          name: 'Administrador',
          email: 'admin@optiflow.com',
          role: 'gerente',
          sector: 'Administração',
          phone: '(11) 99999-9999',
          avatar_url: null,
          is_active: true,
          is_company_admin: true,
          company_id: 'test-company-id',
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const testCompany = {
          id: 'test-company-id',
          name: 'OptiFlow Teste',
          email: 'contato@optiflow.com',
          logo_url: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          invite_code: 'TEST123'
        };
        
        // Simular login bem-sucedido
        localStorage.setItem('optiflow_test_user', JSON.stringify(testUser));
        localStorage.setItem('optiflow_test_company', JSON.stringify(testCompany));
        
        return { user: testUser, company: testCompany, error: null };
      }
      
      // Login normal com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase auth error:', error);
        return { user: null, company: null, error: error.message };
      }

      return await this.getCurrentUser();
    } catch (error: any) {
      console.error('Sign in error:', error);
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
        const { error: profileError } = await supabase.from("users").insert([
          {
            id: data.user.id,
            name,
            email,
            is_company_admin: false,
          },
        ]);

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
    // Limpar usuário de teste
    localStorage.removeItem('optiflow_test_user');
    localStorage.removeItem('optiflow_test_company');
    
    // Logout do Supabase
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async updateProfile(updates: Partial<UserProfile>) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { user: null, error: "Usuário não autenticado" };
      }

      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        return { user: null, error: error.message };
      }

      const userProfile: UserProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: "colaborador",
        sector: undefined,
        phone: undefined,
        avatar_url: data.avatar_url,
        is_active: true,
        is_company_admin: data.is_company_admin || false,
        company_id: data.company_id,
        last_login: undefined,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return { user: userProfile, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  async registerCompany(
    companyData: Omit<Company, "id" | "created_at" | "updated_at">
  ) {
    try {
      const { data, error } = await supabase
        .from("companies")
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

  async registerWithInvite(
    inviteCode: string,
    userData?: { name: string; email: string; password: string }
  ) {
    return { user: null, company: null, error: "Função não implementada" };
  },
};
