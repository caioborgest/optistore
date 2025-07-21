
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/database';

export const TaskService = {
  async getTasks(): Promise<{ data?: Task[]; error?: { message: string } }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          created_user:users!tasks_created_by_fkey(name, email, avatar_url),
          assigned_user:users!tasks_assigned_to_fkey(name, email, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        return { error: { message: error.message } };
      }

      // Map database types to our Task interface
      const tasks: Task[] = data?.map(task => ({
        ...task,
        status: task.status as Task['status'],
        priority: task.priority as Task['priority'],
      })) || [];

      return { data: tasks };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<{ data?: Task; error?: { message: string } }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return { error: { message: 'Usuário não autenticado' } };
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) {
        return { error: { message: error.message } };
      }

      return { data: data as Task };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<{ data?: Task; error?: { message: string } }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        return { error: { message: error.message } };
      }

      return { data: data as Task };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async deleteTask(taskId: string): Promise<{ error?: { message: string } }> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        return { error: { message: error.message } };
      }

      return {};
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async completeTask(taskId: string): Promise<{ error?: { message: string } }> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) {
        return { error: { message: error.message } };
      }

      return {};
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async getTasksByUser(userId: string): Promise<{ data?: Task[]; error?: { message: string } }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { error: { message: error.message } };
      }

      return { data: data as Task[] };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async getTasksBySector(sector: string): Promise<{ data?: Task[]; error?: { message: string } }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('sector', sector)
        .order('created_at', { ascending: false });

      if (error) {
        return { error: { message: error.message } };
      }

      return { data: data as Task[] };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },
};
