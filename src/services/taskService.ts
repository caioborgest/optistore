import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/database';

export const TaskService = {
  async getTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async createTask(taskData: Partial<Task>) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async updateTask(id: string, taskData: Partial<Task>) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async deleteTask(id: string) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error: any) {
      return { error };
    }
  },

  async getTaskById(id: string) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  }
};