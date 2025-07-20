
export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: string;
  maxOccurrences?: number;
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

export class MockRecurringTaskService {
  static async generateRecurringTasks(): Promise<void> {
    console.log('Gerando tarefas recorrentes...');
    // Mock implementation
  }

  static async createRecurringTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Task | null; error: any }> {
    try {
      // Mock creation
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Tarefa recorrente criada:', newTask);
      return { data: newTask, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async updateRecurrencePattern(
    taskId: string, 
    pattern: RecurrencePattern
  ): Promise<{ error: any }> {
    console.log('Padrão de recorrência atualizado:', taskId, pattern);
    return { error: null };
  }

  static async stopRecurrence(taskId: string): Promise<{ error: any }> {
    console.log('Recorrência parada:', taskId);
    return { error: null };
  }

  static async getRecurringTaskSeries(parentTaskId: string): Promise<{ data: Task[] | null; error: any }> {
    // Mock data
    const mockTasks: Task[] = [{
      id: parentTaskId,
      title: 'Tarefa Recorrente Exemplo',
      status: 'pending',
      priority: 'medium',
      sector: 'Geral',
      assigned_to: '1',
      created_by: '1',
      due_date: new Date().toISOString(),
      is_recurring: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }];

    return { data: mockTasks, error: null };
  }
}

export const useRecurringTasks = () => {
  const generateTasks = async () => {
    await MockRecurringTaskService.generateRecurringTasks();
  };

  const createRecurringTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    return await MockRecurringTaskService.createRecurringTask(taskData);
  };

  const updateRecurrencePattern = async (taskId: string, pattern: RecurrencePattern) => {
    return await MockRecurringTaskService.updateRecurrencePattern(taskId, pattern);
  };

  const stopRecurrence = async (taskId: string) => {
    return await MockRecurringTaskService.stopRecurrence(taskId);
  };

  const getTaskSeries = async (parentTaskId: string) => {
    return await MockRecurringTaskService.getRecurringTaskSeries(parentTaskId);
  };

  return {
    generateTasks,
    createRecurringTask,
    updateRecurrencePattern,
    stopRecurrence,
    getTaskSeries
  };
};
