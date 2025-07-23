
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/database';

export interface TaskMetrics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

export interface PerformanceData {
  month: string;
  completed: number;
  pending: number;
  overdue: number;
}

export interface SectorData {
  sector: string;
  taskCount: number;
  completionRate: number;
}

export interface ProductivityMetrics {
  averageCompletionTime: number;
  tasksPerDay: number;
  qualityScore: number;
  efficiencyRate: number;
}

export const reportsService = {
  async getTaskMetrics(startDate?: string, endDate?: string): Promise<{ data?: TaskMetrics; error?: { message: string } }> {
    try {
      // Construir query com filtros de data
      let query = supabase
        .from('tasks')
        .select('*');
      
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Calcular métricas
      const totalTasks = data.length;
      const completedTasks = data.filter(task => task.status === 'completed').length;
      const pendingTasks = data.filter(task => task.status === 'pending').length;
      const overdueTasks = data.filter(task => task.status === 'overdue').length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      return {
        data: {
          totalTasks,
          completedTasks,
          pendingTasks,
          overdueTasks,
          completionRate: parseFloat(completionRate.toFixed(1))
        }
      };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async getUserMetrics(startDate?: string, endDate?: string): Promise<{ data?: UserMetrics; error?: { message: string } }> {
    try {
      // Buscar usuários
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      const totalUsers = data.length;
      const activeUsers = data.filter(user => user.is_active).length;
      const inactiveUsers = totalUsers - activeUsers;
      
      return {
        data: {
          totalUsers,
          activeUsers,
          inactiveUsers
        }
      };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async getPerformanceData(startDate?: string, endDate?: string): Promise<{ data?: PerformanceData[]; error?: { message: string } }> {
    try {
      // Buscar dados de performance por mês
      const { data, error } = await supabase
        .rpc('get_monthly_performance', { 
          start_date: startDate, 
          end_date: endDate 
        });
      
      if (error) {
        throw error;
      }
      
      return { data };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async getSectorData(startDate?: string, endDate?: string): Promise<{ data?: SectorData[]; error?: { message: string } }> {
    try {
      // Buscar dados por setor
      const { data, error } = await supabase
        .rpc('get_sector_performance', { 
          start_date: startDate, 
          end_date: endDate 
        });
      
      if (error) {
        throw error;
      }
      
      return { data };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async getCompletionTrends(period: 'week' | 'month' | 'quarter' = 'month'): Promise<{ data?: PerformanceData[]; error?: { message: string } }> {
    try {
      // Buscar tendências de conclusão
      const { data, error } = await supabase
        .rpc('get_completion_trends', { period_type: period });
      
      if (error) {
        throw error;
      }
      
      return { data };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async getProductivityMetrics(userId?: string, sector?: string): Promise<{ data?: ProductivityMetrics; error?: { message: string } }> {
    try {
      // Buscar métricas de produtividade
      let params: any = {};
      if (userId) params.user_id = userId;
      if (sector) params.sector = sector;
      
      const { data, error } = await supabase
        .rpc('get_productivity_metrics', params);
      
      if (error) {
        throw error;
      }
      
      return { data };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async exportReport(reportType: string, format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<{ data?: { downloadUrl: string; filename: string }; error?: { message: string } }> {
    try {
      // Gerar relatório para exportação
      const { data, error } = await supabase
        .rpc('generate_report_export', { 
          report_type: reportType,
          export_format: format
        });
      
      if (error) {
        throw error;
      }
      
      return { 
        data: {
          downloadUrl: data.download_url,
          filename: data.filename
        }
      };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }
};
