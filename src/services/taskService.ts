
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/database';

export class TaskService {
  /**
   * Buscar todas as tarefas
   */
  static async getTasks(): Promise<{ data: Task[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:users!tasks_assigned_to_fkey(name, email),
          created_user:users!tasks_created_by_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      return { data: null, error };
    }
  }

  /**
   * Criar nova tarefa
   */
  static async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Task | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: { message: 'Usuário não autenticado' } };
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          created_by: user.id,
          status: task.status || 'pending'
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      return { data: null, error };
    }
  }

  /**
   * Atualizar tarefa
   */
  static async updateTask(id: string, updates: Partial<Task>): Promise<{ data: Task | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      return { data: null, error };
    }
  }

  /**
   * Deletar tarefa
   */
  static async deleteTask(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      return { error };
    }
  }

  /**
   * Buscar tarefas do usuário
   */
  static async getUserTasks(userId: string): Promise<{ data: Task[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar tarefas do usuário:', error);
      return { data: null, error };
    }
  }

  /**
   * Buscar tarefas por setor
   */
  static async getTasksBySector(sector: string): Promise<{ data: Task[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('sector', sector)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar tarefas por setor:', error);
      return { data: null, error };
    }
  }

  /**
   * Marcar tarefa como concluída
   */
  static async completeTask(id: string): Promise<{ data: Task | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao completar tarefa:', error);
      return { data: null, error };
    }
  }
}
