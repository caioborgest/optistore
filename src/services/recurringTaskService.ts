
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/database';

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: string;
  maxOccurrences?: number;
}

export const RecurringTaskService = {
  async createRecurringTask(taskData: Partial<Task> & { recurrencePattern: RecurrencePattern }) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          is_recurring: true,
          recurrence_pattern: JSON.stringify(taskData.recurrencePattern),
          sector: taskData.sector || 'Geral',
          title: taskData.title || 'Tarefa Recorrente'
        }])
        .select()
        .single();

      if (error) throw error;

      await this.generateNextOccurrences(data);

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async generateNextOccurrences(parentTask: Task, count: number = 3) {
    if (!parentTask.recurrence_pattern || !parentTask.due_date) return;

    const pattern = JSON.parse(parentTask.recurrence_pattern as string) as RecurrencePattern;
    const nextDates = this.calculateNextDates(parentTask.due_date, pattern, count);

    const nextTasks = nextDates.map(date => ({
      title: parentTask.title,
      description: parentTask.description,
      sector: parentTask.sector,
      assigned_to: parentTask.assigned_to,
      created_by: parentTask.created_by,
      company_id: parentTask.company_id,
      due_date: date,
      priority: parentTask.priority,
      status: 'pending' as const,
      is_recurring: true,
      recurrence_pattern: parentTask.recurrence_pattern,
      parent_task_id: parentTask.id,
      tags: parentTask.tags,
      estimated_hours: parentTask.estimated_hours
    }));

    const { error } = await supabase
      .from('tasks')
      .insert(nextTasks);

    return { error };
  },

  calculateNextDates(startDate: string, pattern: RecurrencePattern, count: number): string[] {
    const dates: string[] = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < count; i++) {
      switch (pattern.type) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + pattern.interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (pattern.interval * 7));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + pattern.interval);
          break;
      }

      if (pattern.endDate && currentDate > new Date(pattern.endDate)) {
        break;
      }

      dates.push(currentDate.toISOString());
    }

    return dates;
  },

  async getRecurringTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_recurring', true)
        .is('parent_task_id', null)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async updateRecurrencePattern(taskId: string, pattern: RecurrencePattern) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ recurrence_pattern: JSON.stringify(pattern) })
        .eq('id', taskId)
        .select()
        .single();

      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async stopRecurrence(taskId: string) {
    try {
      const { error: cancelError } = await supabase
        .from('tasks')
        .update({ status: 'cancelled' })
        .eq('parent_task_id', taskId)
        .gt('due_date', new Date().toISOString());

      if (cancelError) throw cancelError;

      const { data, error } = await supabase
        .from('tasks')
        .update({ is_recurring: false })
        .eq('id', taskId)
        .select()
        .single();

      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  }
};
