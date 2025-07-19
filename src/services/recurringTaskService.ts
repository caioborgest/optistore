import { supabase } from '@/integrations/supabase/client';

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number; // A cada X dias/semanas/meses
  daysOfWeek?: number[]; // Para semanal: [1,2,3,4,5] = seg-sex (0=domingo)
  dayOfMonth?: number; // Para mensal: dia específico do mês
  endDate?: string; // Data limite para recorrência
  maxOccurrences?: number; // Número máximo de ocorrências
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sector: string;
  assigned_to: string;
  created_by: string;
  due_date: string;
  is_recurring: boolean;
  recurrence_pattern?: RecurrencePattern;
  parent_task_id?: string;
  created_at: string;
  updated_at: string;
}

export class RecurringTaskService {
  /**
   * Gera próximas tarefas recorrentes baseadas nas tarefas concluídas
   */
  static async generateRecurringTasks(): Promise<void> {
    try {
      // Buscar tarefas recorrentes concluídas que precisam gerar próxima ocorrência
      const { data: completedRecurringTasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_recurring', true)
        .eq('status', 'completed')
        .is('parent_task_id', null); // Apenas tarefas principais, não as geradas

      if (error) {
        console.error('Erro ao buscar tarefas recorrentes:', error);
        return;
      }

      for (const task of completedRecurringTasks || []) {
        await this.createNextRecurrence(task);
      }
    } catch (error) {
      console.error('Erro no processo de geração de tarefas recorrentes:', error);
    }
  }

  /**
   * Cria a próxima ocorrência de uma tarefa recorrente
   */
  private static async createNextRecurrence(task: Task): Promise<void> {
    if (!task.recurrence_pattern) return;

    const nextDueDate = this.calculateNextDueDate(
      task.due_date,
      task.recurrence_pattern
    );

    if (!nextDueDate) return;

    // Verificar se já existe uma tarefa futura para esta recorrência
    const { data: existingTask } = await supabase
      .from('tasks')
      .select('id')
      .eq('parent_task_id', task.id)
      .eq('due_date', nextDueDate)
      .single();

    if (existingTask) return; // Já existe

    // Criar nova tarefa recorrente
    const { error } = await supabase.from('tasks').insert({
      title: task.title,
      description: task.description,
      sector: task.sector,
      assigned_to: task.assigned_to,
      created_by: task.created_by,
      due_date: nextDueDate,
      priority: task.priority,
      is_recurring: true,
      recurrence_pattern: task.recurrence_pattern,
      parent_task_id: task.id,
      status: 'pending'
    });

    if (error) {
      console.error('Erro ao criar tarefa recorrente:', error);
    } else {
      console.log(`Nova tarefa recorrente criada: ${task.title} para ${nextDueDate}`);
    }
  }

  /**
   * Calcula a próxima data de vencimento baseada no padrão de recorrência
   */
  private static calculateNextDueDate(
    lastDueDate: string,
    pattern: RecurrencePattern
  ): string | null {
    const lastDate = new Date(lastDueDate);
    const now = new Date();

    // Verificar se ainda está dentro do período de recorrência
    if (pattern.endDate && new Date(pattern.endDate) < now) {
      return null;
    }

    let nextDate = new Date(lastDate);

    switch (pattern.type) {
      case 'daily':
        nextDate = this.calculateDailyRecurrence(nextDate, pattern);
        break;
      case 'weekly':
        nextDate = this.calculateWeeklyRecurrence(nextDate, pattern);
        break;
      case 'monthly':
        nextDate = this.calculateMonthlyRecurrence(nextDate, pattern);
        break;
    }

    // Garantir que a próxima data seja no futuro
    while (nextDate <= now) {
      switch (pattern.type) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + pattern.interval);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + (pattern.interval * 7));
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + pattern.interval);
          break;
      }
    }

    return nextDate.toISOString();
  }

  private static calculateDailyRecurrence(date: Date, pattern: RecurrencePattern): Date {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + pattern.interval);
    return nextDate;
  }

  private static calculateWeeklyRecurrence(date: Date, pattern: RecurrencePattern): Date {
    const nextDate = new Date(date);
    
    if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
      // Encontrar o próximo dia da semana válido
      const currentDay = nextDate.getDay();
      const sortedDays = pattern.daysOfWeek.sort((a, b) => a - b);
      
      let nextDay = sortedDays.find(day => day > currentDay);
      
      if (!nextDay) {
        // Se não há próximo dia nesta semana, ir para o primeiro dia da próxima semana
        nextDay = sortedDays[0];
        nextDate.setDate(nextDate.getDate() + (7 * pattern.interval));
      }
      
      const daysToAdd = nextDay - currentDay;
      nextDate.setDate(nextDate.getDate() + daysToAdd);
    } else {
      // Recorrência semanal simples
      nextDate.setDate(nextDate.getDate() + (pattern.interval * 7));
    }
    
    return nextDate;
  }

  private static calculateMonthlyRecurrence(date: Date, pattern: RecurrencePattern): Date {
    const nextDate = new Date(date);
    
    if (pattern.dayOfMonth) {
      // Dia específico do mês
      nextDate.setMonth(nextDate.getMonth() + pattern.interval);
      nextDate.setDate(pattern.dayOfMonth);
      
      // Ajustar se o dia não existe no mês (ex: 31 de fevereiro)
      if (nextDate.getDate() !== pattern.dayOfMonth) {
        nextDate.setDate(0); // Último dia do mês anterior
      }
    } else {
      // Mesmo dia do mês
      const originalDay = date.getDate();
      nextDate.setMonth(nextDate.getMonth() + pattern.interval);
      
      // Ajustar se o dia não existe no novo mês
      const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
      if (originalDay > lastDayOfMonth) {
        nextDate.setDate(lastDayOfMonth);
      } else {
        nextDate.setDate(originalDay);
      }
    }
    
    return nextDate;
  }

  /**
   * Cria uma nova tarefa recorrente
   */
  static async createRecurringTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Task | null; error: any }> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        is_recurring: true
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Atualiza padrão de recorrência de uma tarefa
   */
  static async updateRecurrencePattern(
    taskId: string, 
    pattern: RecurrencePattern
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from('tasks')
      .update({ 
        recurrence_pattern: pattern,
        is_recurring: true 
      })
      .eq('id', taskId);

    return { error };
  }

  /**
   * Para a recorrência de uma tarefa
   */
  static async stopRecurrence(taskId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('tasks')
      .update({ 
        is_recurring: false,
        recurrence_pattern: null 
      })
      .eq('id', taskId);

    return { error };
  }

  /**
   * Busca todas as tarefas de uma série recorrente
   */
  static async getRecurringTaskSeries(parentTaskId: string): Promise<{ data: Task[] | null; error: any }> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .or(`id.eq.${parentTaskId},parent_task_id.eq.${parentTaskId}`)
      .order('due_date', { ascending: true });

    return { data, error };
  }
}

// Hook para usar o serviço de tarefas recorrentes
export const useRecurringTasks = () => {
  const generateTasks = async () => {
    await RecurringTaskService.generateRecurringTasks();
  };

  const createRecurringTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    return await RecurringTaskService.createRecurringTask(taskData);
  };

  const updateRecurrencePattern = async (taskId: string, pattern: RecurrencePattern) => {
    return await RecurringTaskService.updateRecurrencePattern(taskId, pattern);
  };

  const stopRecurrence = async (taskId: string) => {
    return await RecurringTaskService.stopRecurrence(taskId);
  };

  const getTaskSeries = async (parentTaskId: string) => {
    return await RecurringTaskService.getRecurringTaskSeries(parentTaskId);
  };

  return {
    generateTasks,
    createRecurringTask,
    updateRecurrencePattern,
    stopRecurrence,
    getTaskSeries
  };
};