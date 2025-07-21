import { supabase } from "@/integrations/supabase/client";
import { UserProfile, Company } from "@/types/database";

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
        return { error: "Falha na autenticação" };
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        return { error: "Erro ao carregar perfil do usuário" };
      }

      // Get company if user has one
      let company = null;
      if (profile.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("id", profile.company_id)
          .single();

        if (!companyError) {
          company = companyData;
        }
      }

      return {
        user: profile,
        company,
      };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async signUp(
    email: string,
    password: string,
    name: string
  ): Promise<AuthResponse> {
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
        return { error: "Falha no cadastro" };
      }

      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .insert([
          {
            id: data.user.id,
            name,
            email,
            is_company_admin: false,
          },
        ])
        .select()
        .single();

      if (profileError) {
        return { error: "Erro ao criar perfil do usuário" };
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

  async getCurrentUser(): Promise<{
    user?: UserProfile;
    company?: Company;
    error?: string;
  }> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Auth error:", error);
        return { error: error.message };
      }

      if (!user) {
        return { error: "Usuário não autenticado" };
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        // Se o perfil não existe, criar um básico
        if (profileError.code === "PGRST116") {
          const basicProfile = {
            id: user.id,
            name: user.email?.split("@")[0] || "Usuário",
            email: user.email || "",
            is_company_admin: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          return { user: basicProfile };
        }
        return { error: "Erro ao carregar perfil do usuário" };
      }

      // Get company if user has one
      let company = null;
      if (profile.company_id) {
        try {
          const { data: companyData, error: companyError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", profile.company_id)
            .single();

          if (!companyError) {
            company = companyData;
          }
        } catch (companyErr) {
          console.error("Company fetch error:", companyErr);
          // Continue without company data
        }
      }

      return {
        user: profile,
        company,
      };
    } catch (error: any) {
      console.error("getCurrentUser error:", error);
      return { error: error.message || "Erro desconhecido" };
    }
  },

  async updateProfile(
    updates: Partial<UserProfile>
  ): Promise<{ user?: UserProfile; error?: string }> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { error: "Usuário não autenticado" };
      }

      const { data: profile, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id)
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

  async registerCompany(
    companyData: Omit<Company, "id" | "created_at" | "updated_at">
  ): Promise<AuthResponse> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { error: "Usuário não autenticado" };
      }

      // Generate unique invite code
      const inviteCode = Math.random().toString(36).substring(2, 15);

      const { data: company, error } = await supabase
        .from("companies")
        .insert([
          {
            ...companyData,
            invite_code: inviteCode,
          },
        ])
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // Update user to be company admin
      const { error: updateError } = await supabase
        .from("users")
        .update({
          company_id: company.id,
          is_company_admin: true,
        })
        .eq("id", user.id);

      if (updateError) {
        return { error: updateError.message };
      }

      return { company };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async registerWithInvite(
    inviteCode: string,
    userData?: { name: string; email: string; password: string }
  ): Promise<AuthResponse> {
    try {
      // Find company by invite code first
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("invite_code", inviteCode)
        .single();

      if (companyError) {
        return { error: "Código de convite inválido" };
      }

      let user: any;

      if (userData) {
        // Create new user account
        const { data: authData, error: signUpError } =
          await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
              data: {
                name: userData.name,
              },
            },
          });

        if (signUpError) {
          return { error: signUpError.message };
        }

        if (!authData.user) {
          return { error: "Falha no cadastro" };
        }

        // Create user profile with company
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .insert([
            {
              id: authData.user.id,
              name: userData.name,
              email: userData.email,
              company_id: company.id,
              is_company_admin: false,
            },
          ])
          .select()
          .single();

        if (profileError) {
          return { error: "Erro ao criar perfil do usuário" };
        }

        user = profile;
      } else {
        // Update existing authenticated user
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          return { error: "Usuário não autenticado" };
        }

        // Update user with company
        const { data: profile, error: updateError } = await supabase
          .from("users")
          .update({
            company_id: company.id,
          })
          .eq("id", authUser.id)
          .select()
          .single();

        if (updateError) {
          return { error: updateError.message };
        }

        user = profile;
      }

      return { user, company };
    } catch (error: any) {
      return { error: error.message };
    }
  },
};
