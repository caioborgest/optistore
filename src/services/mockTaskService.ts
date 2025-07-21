import { Task } from '@/types/database';

export class MockTaskService {
  private static mockTasks: Task[] = [
    {
      id: '1',
      title: 'Revisar relatório mensal',
      description: 'Revisar o relatório de vendas do mês',
      status: 'pending',
      priority: 'high',
      sector: 'Vendas',
      assigned_to: '1',
      created_by: '1',
      due_date: new Date(Date.now() + 86400000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Atualizar sistema',
      description: 'Atualizar o sistema para a nova versão',
      status: 'in_progress',
      priority: 'medium',
      sector: 'TI',
      assigned_to: '2',
      created_by: '1',
      due_date: new Date(Date.now() + 172800000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  static async getTasks(): Promise<{ data: Task[] | null; error: any }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: this.mockTasks, error: null };
  }

  static async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Task | null; error: any }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newTask: Task = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...task
    };

    this.mockTasks.push(newTask);
    return { data: newTask, error: null };
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<{ data: Task | null; error: any }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const taskIndex = this.mockTasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return { data: null, error: { message: 'Tarefa não encontrada' } };
    }

    this.mockTasks[taskIndex] = {
      ...this.mockTasks[taskIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return { data: this.mockTasks[taskIndex], error: null };
  }

  static async deleteTask(id: string): Promise<{ error: any }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const taskIndex = this.mockTasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return { error: { message: 'Tarefa não encontrada' } };
    }

    this.mockTasks.splice(taskIndex, 1);
    return { error: null };
  }
}

export const useMockTasks = () => {
  const getTasks = async () => {
    return await MockTaskService.getTasks();
  };

  const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    return await MockTaskService.createTask(task);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    return await MockTaskService.updateTask(id, updates);
  };

  const deleteTask = async (id: string) => {
    return await MockTaskService.deleteTask(id);
  };

  return {
    getTasks,
    createTask,
    updateTask,
    deleteTask
  };
};