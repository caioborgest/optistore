import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/database';

export interface CompanyStats {
  totalUsers: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

export const CompanyService = {
  async updateCompany(companyId: string, updates: Partial<Company>) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', companyId)
        .select()
        .single();

      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async regenerateInviteCode(companyId: string) {
    try {
      const newInviteCode = Math.random().toString(36).substring(2, 15);
      
      const { data, error } = await supabase
        .from('companies')
        .update({ invite_code: newInviteCode })
        .eq('id', companyId)
        .select()
        .single();

      return { inviteCode: newInviteCode, data, error };
    } catch (error: any) {
      return { inviteCode: null, data: null, error };
    }
  },

  async getCompanyUsers(companyId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      return { users: data, error };
    } catch (error: any) {
      return { users: null, error };
    }
  },

  async removeUserFromCompany(userId: string) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ company_id: null })
        .eq('id', userId);

      return { error };
    } catch (error: any) {
      return { error };
    }
  },

  async getCompanyStats(companyId: string): Promise<{ stats: CompanyStats | null; error: any }> {
    try {
      // Buscar total de usuários
      const { count: totalUsers, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);

      if (usersError) {
        return { stats: null, error: usersError };
      }

      // Buscar usuários para pegar suas tarefas
      const { data: users, error: userDataError } = await supabase
        .from('users')
        .select('id')
        .eq('company_id', companyId);

      if (userDataError) {
        return { stats: null, error: userDataError };
      }

      const userIds = users?.map(user => user.id) || [];

      if (userIds.length === 0) {
        return {
          stats: {
            totalUsers: totalUsers || 0,
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0
          },
          error: null
        };
      }

      // Buscar tarefas dos usuários da empresa
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('status')
        .in('assigned_to', userIds);

      if (tasksError) {
        return { stats: null, error: tasksError };
      }

      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(task => task.status === 'completed').length || 0;
      const pendingTasks = tasks?.filter(task => task.status === 'pending').length || 0;

      return {
        stats: {
          totalUsers: totalUsers || 0,
          totalTasks,
          completedTasks,
          pendingTasks
        },
        error: null
      };
    } catch (error: any) {
      return { stats: null, error };
    }
  }
};

// Hook personalizado para usar o CompanyService
export const useCompany = () => {
  return {
    updateCompany: CompanyService.updateCompany,
    regenerateInviteCode: CompanyService.regenerateInviteCode,
    getCompanyUsers: CompanyService.getCompanyUsers,
    removeUserFromCompany: CompanyService.removeUserFromCompany,
    getCompanyStats: CompanyService.getCompanyStats
  };
};