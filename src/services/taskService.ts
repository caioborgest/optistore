
import { supabase } from '@/integrations/supabase/client';

export interface SimpleTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  sector: string;
  assignee_name?: string;
  due_date?: string;
  created_at: string;
  completed_at?: string;
}

// Mock data para demonstração até que a tabela tasks seja criada corretamente
const mockTasks: SimpleTask[] = [
  {
    id: '1',
    title: 'Verificar estoque de cimentos',
    description: 'Conferir quantidade disponível de cimento Portland',
    status: 'pending',
    priority: 'high',
    sector: 'Estoque',
    assignee_name: 'João Silva',
    due_date: '2024-01-25',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Atualizar preços de materiais',
    description: 'Revisar tabela de preços dos materiais de construção',
    status: 'in_progress',
    priority: 'medium',
    sector: 'Vendas',
    assignee_name: 'Maria Santos',
    due_date: '2024-01-24',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Organizar depósito de ferramentas',
    description: 'Reorganizar e catalogar ferramentas no depósito',
    status: 'completed',
    priority: 'low',
    sector: 'Organização',
    assignee_name: 'Pedro Costa',
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  }
];

export class TaskService {
  static async getTasks(): Promise<SimpleTask[]> {
    // Por enquanto retorna dados mock, futuramente conectará com Supabase
    return mockTasks;
  }

  static async updateTaskStatus(taskId: string, status: SimpleTask['status']): Promise<void> {
    // Simulação de atualização
    const taskIndex = mockTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      mockTasks[taskIndex].status = status;
      if (status === 'completed') {
        mockTasks[taskIndex].completed_at = new Date().toISOString();
      }
    }
  }

  static async createTask(task: Omit<SimpleTask, 'id' | 'created_at'>): Promise<SimpleTask> {
    const newTask: SimpleTask = {
      ...task,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    mockTasks.push(newTask);
    return newTask;
  }
}
