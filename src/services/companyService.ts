
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  invite_code: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCompany = () => {
  const updateCompany = async (companyId: string, data: Partial<Company>) => {
    try {
      const { data: updatedCompany, error } = await supabase
        .from('companies')
        .update(data)
        .eq('id', companyId)
        .select()
        .single();

      return { company: updatedCompany, error };
    } catch (error: any) {
      return { company: null, error };
    }
  };

  const regenerateInviteCode = async (companyId: string) => {
    try {
      const newInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data, error } = await supabase
        .from('companies')
        .update({ invite_code: newInviteCode })
        .eq('id', companyId)
        .select()
        .single();

      return { inviteCode: newInviteCode, error };
    } catch (error: any) {
      return { inviteCode: null, error };
    }
  };

  const getCompanyUsers = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', companyId);

      return { users: data, error };
    } catch (error: any) {
      return { users: null, error };
    }
  };

  const removeUserFromCompany = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ company_id: null })
        .eq('id', userId);

      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const getCompanyStats = async (companyId: string) => {
    try {
      // Get user count
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);

      // Get task counts
      const { count: totalTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true });

      const { count: completedTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      const { count: pendingTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      return {
        stats: {
          totalUsers: totalUsers || 0,
          totalTasks: totalTasks || 0,
          completedTasks: completedTasks || 0,
          pendingTasks: pendingTasks || 0
        },
        error: null
      };
    } catch (error: any) {
      return { stats: null, error };
    }
  };

  return {
    updateCompany,
    regenerateInviteCode,
    getCompanyUsers,
    removeUserFromCompany,
    getCompanyStats
  };
};
