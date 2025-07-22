import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ProductivityMetrics {
  period: string;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  tasksBySector: Array<{
    sector: string;
    total: number;
    completed: number;
    rate: number;
  }>;
}

export interface SectorComparison {
  sector: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageHours: number;
  efficiency: number;
  trend: 'up' | 'down' | 'stable';
}

export interface UserPerformance {
  userId: string;
  userName: string;
  sector: string;
  tasksCompleted: number;
  averageRating: number;
  efficiency: number;
  hoursWorked: number;
  rank: number;
}

export interface TimeSeriesData {
  date: string;
  completed: number;
  created: number;
  overdue: number;
}

export const ReportsService = {
  // Métricas de produtividade por período
  async getProductivityMetrics(
    startDate: Date,
    endDate: Date,
    sector?: string
  ): Promise<{ data?: ProductivityMetrics; error?: any }> {
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:users!assigned_to(name, sector),
          creator:users!created_by(name, sector)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (sector) {
        query = query.eq('sector', sector);
      }

      const { data: tasks, error } = await query;

      if (error) throw error;

      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
      const overdueTasks = tasks?.filter(t => t.status === 'overdue').length || 0;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Calcular tempo médio de conclusão
      const completedTasksWithTime = tasks?.filter(t => 
        t.status === 'completed' && t.completed_at && t.created_at
      ) || [];
      
      const averageCompletionTime = completedTasksWithTime.length > 0 
        ? completedTasksWithTime.reduce((acc, task) => {
            const created = new Date(task.created_at);
            const completed = new Date(task.completed_at);
            return acc + (completed.getTime() - created.getTime());
          }, 0) / completedTasksWithTime.length / (1000 * 60 * 60) // em horas
        : 0;

      // Tarefas por prioridade
      const tasksByPriority = {
        low: tasks?.filter(t => t.priority === 'low').length || 0,
        medium: tasks?.filter(t => t.priority === 'medium').length || 0,
        high: tasks?.filter(t => t.priority === 'high').length || 0,
        urgent: tasks?.filter(t => t.priority === 'urgent').length || 0,
      };

      // Tarefas por setor
      const sectorGroups = tasks?.reduce((acc, task) => {
        const sector = task.sector;
        if (!acc[sector]) {
          acc[sector] = { total: 0, completed: 0 };
        }
        acc[sector].total++;
        if (task.status === 'completed') {
          acc[sector].completed++;
        }
        return acc;
      }, {} as Record<string, { total: number; completed: number }>) || {};

      const tasksBySector = Object.entries(sectorGroups).map(([sector, data]) => ({
        sector,
        total: data.total,
        completed: data.completed,
        rate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
      }));

      const metrics: ProductivityMetrics = {
        period: `${format(startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${format(endDate, 'dd/MM/yyyy', { locale: ptBR })}`,
        totalTasks,
        completedTasks,
        overdueTasks,
        completionRate,
        averageCompletionTime,
        tasksByPriority,
        tasksBySector,
      };

      return { data: metrics };
    } catch (error) {
      return { error };
    }
  },

  // Comparativo entre setores
  async getSectorComparison(
    startDate: Date,
    endDate: Date
  ): Promise<{ data?: SectorComparison[]; error?: any }> {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      // Obter dados do período anterior para comparação de tendência
      const previousStartDate = subMonths(startDate, 1);
      const previousEndDate = subMonths(endDate, 1);

      const { data: previousTasks } = await supabase
        .from('tasks')
        .select('*')
        .gte('created_at', previousStartDate.toISOString())
        .lte('created_at', previousEndDate.toISOString());

      const sectorData = tasks?.reduce((acc, task) => {
        const sector = task.sector;
        if (!acc[sector]) {
          acc[sector] = {
            totalTasks: 0,
            completedTasks: 0,
            totalHours: 0,
            completedHours: 0,
          };
        }
        acc[sector].totalTasks++;
        acc[sector].totalHours += task.estimated_hours || 0;
        
        if (task.status === 'completed') {
          acc[sector].completedTasks++;
          acc[sector].completedHours += task.actual_hours || task.estimated_hours || 0;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      const previousSectorData = previousTasks?.reduce((acc, task) => {
        const sector = task.sector;
        if (!acc[sector]) {
          acc[sector] = { completedTasks: 0, totalTasks: 0 };
        }
        acc[sector].totalTasks++;
        if (task.status === 'completed') {
          acc[sector].completedTasks++;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      const comparison: SectorComparison[] = Object.entries(sectorData).map(([sector, data]) => {
        const completionRate = data.totalTasks > 0 ? (data.completedTasks / data.totalTasks) * 100 : 0;
        const averageHours = data.completedTasks > 0 ? data.completedHours / data.completedTasks : 0;
        const efficiency = data.totalHours > 0 ? (data.completedHours / data.totalHours) * 100 : 0;

        // Calcular tendência
        const previousRate = previousSectorData[sector] 
          ? (previousSectorData[sector].completedTasks / previousSectorData[sector].totalTasks) * 100 
          : 0;
        
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (completionRate > previousRate + 5) trend = 'up';
        else if (completionRate < previousRate - 5) trend = 'down';

        return {
          sector,
          totalTasks: data.totalTasks,
          completedTasks: data.completedTasks,
          completionRate,
          averageHours,
          efficiency,
          trend,
        };
      });

      return { data: comparison.sort((a, b) => b.completionRate - a.completionRate) };
    } catch (error) {
      return { error };
    }
  },

  // Performance individual dos usuários
  async getUserPerformance(
    startDate: Date,
    endDate: Date,
    sector?: string
  ): Promise<{ data?: UserPerformance[]; error?: any }> {
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:users!assigned_to(id, name, sector)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('assigned_to', 'is', null);

      if (sector) {
        query = query.eq('sector', sector);
      }

      const { data: tasks, error } = await query;

      if (error) throw error;

      const userStats = tasks?.reduce((acc, task) => {
        const userId = task.assigned_to;
        const user = task.assigned_user;
        
        if (!userId || !user) return acc;

        if (!acc[userId]) {
          acc[userId] = {
            userId,
            userName: user.name,
            sector: user.sector,
            totalTasks: 0,
            completedTasks: 0,
            totalHours: 0,
            actualHours: 0,
          };
        }

        acc[userId].totalTasks++;
        acc[userId].totalHours += task.estimated_hours || 0;
        
        if (task.status === 'completed') {
          acc[userId].completedTasks++;
          acc[userId].actualHours += task.actual_hours || task.estimated_hours || 0;
        }

        return acc;
      }, {} as Record<string, any>) || {};

      const performance: UserPerformance[] = Object.values(userStats).map((user: any, index) => {
        const completionRate = user.totalTasks > 0 ? (user.completedTasks / user.totalTasks) * 100 : 0;
        const efficiency = user.totalHours > 0 ? (user.actualHours / user.totalHours) * 100 : 0;
        
        return {
          userId: user.userId,
          userName: user.userName,
          sector: user.sector,
          tasksCompleted: user.completedTasks,
          averageRating: completionRate,
          efficiency,
          hoursWorked: user.actualHours,
          rank: index + 1,
        };
      });

      // Ordenar por performance e atribuir ranking
      performance.sort((a, b) => b.averageRating - a.averageRating);
      performance.forEach((user, index) => {
        user.rank = index + 1;
      });

      return { data: performance };
    } catch (error) {
      return { error };
    }
  },

  // Dados de série temporal para gráficos
  async getTimeSeriesData(
    startDate: Date,
    endDate: Date,
    sector?: string
  ): Promise<{ data?: TimeSeriesData[]; error?: any }> {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (sector) {
        query = query.eq('sector', sector);
      }

      const { data: tasks, error } = await query;

      if (error) throw error;

      // Agrupar por dia
      const dailyData = tasks?.reduce((acc, task) => {
        const date = format(new Date(task.created_at), 'yyyy-MM-dd');
        
        if (!acc[date]) {
          acc[date] = { created: 0, completed: 0, overdue: 0 };
        }

        acc[date].created++;
        
        if (task.status === 'completed') {
          const completedDate = format(new Date(task.completed_at || task.created_at), 'yyyy-MM-dd');
          if (!acc[completedDate]) {
            acc[completedDate] = { created: 0, completed: 0, overdue: 0 };
          }
          acc[completedDate].completed++;
        }
        
        if (task.status === 'overdue') {
          acc[date].overdue++;
        }

        return acc;
      }, {} as Record<string, any>) || {};

      const timeSeriesData: TimeSeriesData[] = Object.entries(dailyData).map(([date, data]) => ({
        date,
        created: data.created,
        completed: data.completed,
        overdue: data.overdue,
      }));

      return { data: timeSeriesData.sort((a, b) => a.date.localeCompare(b.date)) };
    } catch (error) {
      return { error };
    }
  },

  // Exportar dados para Excel/CSV
  async exportToCSV(data: any[], filename: string): Promise<{ success: boolean; error?: string }> {
    try {
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Gerar relatório PDF (usando jsPDF)
  async exportToPDF(
    metrics: ProductivityMetrics,
    sectorComparison: SectorComparison[],
    filename: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Implementação básica - pode ser expandida com jsPDF
      const reportData = {
        title: 'Relatório de Produtividade - OptiFlow',
        period: metrics.period,
        summary: {
          totalTasks: metrics.totalTasks,
          completedTasks: metrics.completedTasks,
          completionRate: `${metrics.completionRate.toFixed(1)}%`,
          averageTime: `${metrics.averageCompletionTime.toFixed(1)}h`,
        },
        sectors: sectorComparison,
        generatedAt: format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      };

      // Por enquanto, exportar como JSON estruturado
      // Em produção, usar jsPDF para gerar PDF real
      const jsonContent = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Métricas em tempo real para dashboard
  async getRealTimeMetrics(): Promise<{ data?: any; error?: any }> {
    try {
      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const endOfToday = new Date(today.setHours(23, 59, 59, 999));

      const { data: todayTasks, error } = await supabase
        .from('tasks')
        .select('*')
        .gte('created_at', startOfToday.toISOString())
        .lte('created_at', endOfToday.toISOString());

      if (error) throw error;

      const metrics = {
        today: {
          created: todayTasks?.length || 0,
          completed: todayTasks?.filter(t => t.status === 'completed').length || 0,
          pending: todayTasks?.filter(t => t.status === 'pending').length || 0,
          overdue: todayTasks?.filter(t => t.status === 'overdue').length || 0,
        },
        lastUpdate: new Date().toISOString(),
      };

      return { data: metrics };
    } catch (error) {
      return { error };
    }
  },
};