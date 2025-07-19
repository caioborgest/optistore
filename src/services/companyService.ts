import { supabase } from '@/integrations/supabase/client';

export interface Company {
  id: string;
  name: string;
  email: string;
  invite_code: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyRegistration {
  name: string;
  email: string;
  adminName: string;
  adminEmail: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface UserInvite {
  inviteCode: string;
  name: string;
  email: string;
  password: string;
  sector: string;
  role: 'gerente' | 'supervisor' | 'colaborador';
  phone?: string;
}

export class CompanyService {
  /**
   * Gera um código de convite único
   */
  private static generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Registra uma nova empresa
   */
  static async registerCompany(data: CompanyRegistration): Promise<{ company: Company | null; error: any }> {
    try {
      console.log('🚀 Iniciando registro de empresa:', { 
        name: data.name, 
        email: data.email, 
        adminEmail: data.adminEmail 
      });

      // Teste de conexão com Supabase
      const { data: testConnection, error: testError } = await supabase
        .from('companies')
        .select('count')
        .limit(1);
      
      console.log('🔗 Teste de conexão:', { testConnection, testError });

      if (testError) {
        console.error('❌ Erro de conexão com Supabase:', testError);
        return { company: null, error: testError };
      }

      // Gerar código de convite único
      let inviteCode = this.generateInviteCode();
      let isUnique = false;
      let attempts = 0;

      console.log('🎲 Gerando código de convite:', inviteCode);

      // Garantir que o código seja único
      while (!isUnique && attempts < 10) {
        const { data: existing, error: checkError } = await supabase
          .from('companies')
          .select('id')
          .eq('invite_code', inviteCode)
          .single();

        console.log('🔍 Verificando código único:', { inviteCode, existing, checkError });

        if (checkError && checkError.code === 'PGRST116') {
          // Código não encontrado, é único
          isUnique = true;
        } else if (!existing) {
          isUnique = true;
        } else {
          inviteCode = this.generateInviteCode();
          attempts++;
          console.log('🔄 Tentativa', attempts, 'novo código:', inviteCode);
        }
      }

      if (!isUnique) {
        console.error('❌ Não foi possível gerar código único após 10 tentativas');
        return { company: null, error: new Error('Não foi possível gerar um código único') };
      }

      console.log('✅ Código único gerado:', inviteCode);

      // Criar empresa
      const companyInsertData = {
        name: data.name,
        email: data.email,
        invite_code: inviteCode,
        phone: data.phone || null,
        address: data.address || null
      };

      console.log('📝 Inserindo empresa:', companyInsertData);

      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert(companyInsertData)
        .select()
        .single();

      console.log('🏢 Resultado inserção empresa:', { company, companyError });

      if (companyError) {
        console.error('❌ Erro ao criar empresa:', companyError);
        return { company: null, error: companyError };
      }

      console.log('✅ Empresa criada com sucesso:', company.id);

      // Criar usuário administrador da empresa
      const authData = {
        email: data.adminEmail,
        password: data.password,
        options: {
          data: {
            name: data.adminName,
            company_id: company.id,
            is_company_admin: true
          }
        }
      };

      console.log('👤 Criando usuário administrador:', { 
        email: authData.email, 
        metadata: authData.options.data 
      });

      const { data: authUser, error: authError } = await supabase.auth.signUp(authData);

      console.log('🔐 Resultado criação usuário:', { 
        user: authUser.user?.id, 
        session: !!authUser.session,
        error: authError 
      });

      if (authError) {
        console.error('❌ Erro ao criar usuário, fazendo rollback da empresa');
        // Rollback: deletar empresa se falhou ao criar usuário
        await supabase.from('companies').delete().eq('id', company.id);
        return { company: null, error: authError };
      }

      // Criar perfil do usuário administrador
      if (authUser.user) {
        const profileData = {
          id: authUser.user.id,
          company_id: company.id,
          email: data.adminEmail,
          name: data.adminName,
          role: 'gerente' as const,
          sector: 'Administração',
          is_company_admin: true
        };

        console.log('📋 Criando perfil do usuário:', profileData);

        const { error: profileError } = await supabase
          .from('users')
          .insert(profileData);

        console.log('👤 Resultado criação perfil:', { profileError });

        if (profileError) {
          console.error('⚠️ Erro ao criar perfil do administrador:', profileError);
          // Não fazemos rollback aqui pois o usuário foi criado com sucesso
        }
      }

      console.log('🎉 Registro de empresa concluído com sucesso!');
      return { company, error: null };
    } catch (error) {
      console.error('💥 Erro geral no registro de empresa:', error);
      return { company: null, error };
    }
  }

  /**
   * Valida código de convite
   */
  static async validateInviteCode(inviteCode: string): Promise<{ company: Company | null; error: any }> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .eq('is_active', true)
      .single();

    return { company: data, error };
  }

  /**
   * Registra usuário com código de convite
   */
  static async registerUserWithInvite(data: UserInvite): Promise<{ user: any; error: any }> {
    try {
      // Validar código de convite
      const { company, error: companyError } = await this.validateInviteCode(data.inviteCode);
      
      if (companyError || !company) {
        return { user: null, error: 'Código de convite inválido ou empresa não encontrada' };
      }

      // Verificar se email já existe na empresa
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('company_id', company.id)
        .eq('email', data.email)
        .single();

      if (existingUser) {
        return { user: null, error: 'Este email já está cadastrado nesta empresa' };
      }

      // Criar usuário no Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            company_id: company.id,
            role: data.role,
            sector: data.sector
          }
        }
      });

      if (authError) {
        return { user: null, error: authError };
      }

      // Criar perfil do usuário
      if (authUser.user) {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .insert({
            id: authUser.user.id,
            company_id: company.id,
            email: data.email,
            name: data.name,
            role: data.role,
            sector: data.sector,
            phone: data.phone
          })
          .select()
          .single();

        if (profileError) {
          return { user: null, error: profileError };
        }

        return { user: { ...authUser.user, profile: userProfile }, error: null };
      }

      return { user: authUser.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  /**
   * Busca empresa do usuário atual
   */
  static async getCurrentUserCompany(): Promise<{ company: Company | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { company: null, error: 'Usuário não autenticado' };
      }

      const { data: userProfile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!userProfile?.company_id) {
        return { company: null, error: 'Usuário não vinculado a uma empresa' };
      }

      const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', userProfile.company_id)
        .single();

      return { company, error };
    } catch (error) {
      return { company: null, error };
    }
  }

  /**
   * Atualiza informações da empresa
   */
  static async updateCompany(companyId: string, updates: Partial<Company>): Promise<{ error: any }> {
    const { error } = await supabase
      .from('companies')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId);

    return { error };
  }

  /**
   * Gera novo código de convite
   */
  static async regenerateInviteCode(companyId: string): Promise<{ inviteCode: string | null; error: any }> {
    try {
      let newInviteCode = this.generateInviteCode();
      let isUnique = false;
      let attempts = 0;

      // Garantir que o código seja único
      while (!isUnique && attempts < 10) {
        const { data: existing } = await supabase
          .from('companies')
          .select('id')
          .eq('invite_code', newInviteCode)
          .single();

        if (!existing) {
          isUnique = true;
        } else {
          newInviteCode = this.generateInviteCode();
          attempts++;
        }
      }

      if (!isUnique) {
        return { inviteCode: null, error: 'Não foi possível gerar um código único' };
      }

      const { error } = await supabase
        .from('companies')
        .update({ 
          invite_code: newInviteCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId);

      if (error) {
        return { inviteCode: null, error };
      }

      return { inviteCode: newInviteCode, error: null };
    } catch (error) {
      return { inviteCode: null, error };
    }
  }

  /**
   * Lista usuários da empresa
   */
  static async getCompanyUsers(companyId: string): Promise<{ users: any[] | null; error: any }> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');

    return { users: data, error };
  }

  /**
   * Remove usuário da empresa (apenas admins)
   */
  static async removeUserFromCompany(userId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('users')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    return { error };
  }

  /**
   * Verifica se usuário é admin da empresa
   */
  static async isCompanyAdmin(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('users')
      .select('is_company_admin')
      .eq('id', userId)
      .single();

    return data?.is_company_admin || false;
  }

  /**
   * Busca estatísticas da empresa
   */
  static async getCompanyStats(companyId: string): Promise<{ stats: any | null; error: any }> {
    try {
      // Contar usuários ativos
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('is_active', true);

      // Contar tarefas por status
      const { data: taskStats } = await supabase
        .from('tasks')
        .select('status')
        .in('assigned_to', 
          supabase
            .from('users')
            .select('id')
            .eq('company_id', companyId)
        );

      const stats = {
        totalUsers: userCount || 0,
        totalTasks: taskStats?.length || 0,
        completedTasks: taskStats?.filter(t => t.status === 'completed').length || 0,
        pendingTasks: taskStats?.filter(t => t.status === 'pending').length || 0,
        overdueTasks: taskStats?.filter(t => t.status === 'overdue').length || 0
      };

      return { stats, error: null };
    } catch (error) {
      return { stats: null, error };
    }
  }
}

// Hook para usar o serviço de empresas
export const useCompany = () => {
  const registerCompany = async (data: CompanyRegistration) => {
    return await CompanyService.registerCompany(data);
  };

  const validateInviteCode = async (inviteCode: string) => {
    return await CompanyService.validateInviteCode(inviteCode);
  };

  const registerUserWithInvite = async (data: UserInvite) => {
    return await CompanyService.registerUserWithInvite(data);
  };

  const getCurrentUserCompany = async () => {
    return await CompanyService.getCurrentUserCompany();
  };

  const updateCompany = async (companyId: string, updates: Partial<Company>) => {
    return await CompanyService.updateCompany(companyId, updates);
  };

  const regenerateInviteCode = async (companyId: string) => {
    return await CompanyService.regenerateInviteCode(companyId);
  };

  const getCompanyUsers = async (companyId: string) => {
    return await CompanyService.getCompanyUsers(companyId);
  };

  const removeUserFromCompany = async (userId: string) => {
    return await CompanyService.removeUserFromCompany(userId);
  };

  const isCompanyAdmin = async (userId: string) => {
    return await CompanyService.isCompanyAdmin(userId);
  };

  const getCompanyStats = async (companyId: string) => {
    return await CompanyService.getCompanyStats(companyId);
  };

  return {
    registerCompany,
    validateInviteCode,
    registerUserWithInvite,
    getCurrentUserCompany,
    updateCompany,
    regenerateInviteCode,
    getCompanyUsers,
    removeUserFromCompany,
    isCompanyAdmin,
    getCompanyStats
  };
};