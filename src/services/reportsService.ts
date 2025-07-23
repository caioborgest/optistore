
import { Task } from '@/types/database';

// Mock data for reports
const mockReportData = {
  taskMetrics: {
    totalTasks: 150,
    completedTasks: 125,
    pendingTasks: 20,
    overdueTasks: 5,
    completionRate: 83.3
  },
  userMetrics: {
    totalUsers: 25,
    activeUsers: 23,
    inactiveUsers: 2
  },
  performanceData: [
    { month: 'Jan', completed: 45, pending: 12, overdue: 3 },
    { month: 'Fev', completed: 52, pending: 8, overdue: 2 },
    { month: 'Mar', completed: 48, pending: 15, overdue: 5 },
    { month: 'Abr', completed: 61, pending: 10, overdue: 1 },
    { month: 'Mai', completed: 55, pending: 18, overdue: 4 }
  ],
  sectorData: [
    { sector: 'Vendas', taskCount: 45, completionRate: 92 },
    { sector: 'Marketing', taskCount: 32, completionRate: 88 },
    { sector: 'TI', taskCount: 28, completionRate: 95 },
    { sector: 'RH', taskCount: 18, completionRate: 85 }
  ]
};

export const reportsService = {
  async getTaskMetrics(startDate?: string, endDate?: string) {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: mockReportData.taskMetrics,
      error: null
    };
  },

  async getUserMetrics(startDate?: string, endDate?: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: mockReportData.userMetrics,
      error: null
    };
  },

  async getPerformanceData(startDate?: string, endDate?: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: mockReportData.performanceData,
      error: null
    };
  },

  async getSectorData(startDate?: string, endDate?: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: mockReportData.sectorData,
      error: null
    };
  },

  async getCompletionTrends(period: 'week' | 'month' | 'quarter' = 'month') {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: mockReportData.performanceData,
      error: null
    };
  },

  async getProductivityMetrics(userId?: string, sector?: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: {
        averageCompletionTime: 2.4,
        tasksPerDay: 3.2,
        qualityScore: 89,
        efficiencyRate: 92
      },
      error: null
    };
  },

  async exportReport(reportType: string, format: 'pdf' | 'excel' | 'csv' = 'pdf') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular geração de relatório
    return {
      data: {
        downloadUrl: `/reports/export-${reportType}-${Date.now()}.${format}`,
        filename: `report-${reportType}-${new Date().toISOString().split('T')[0]}.${format}`
      },
      error: null
    };
  }
};
