import { supabase } from '@/integrations/supabase/client';

export interface TimeEntry {
  id: string;
  user_id: string;
  task_id?: string;
  clock_in: string;
  clock_out?: string;
  break_start?: string;
  break_end?: string;
  total_hours?: number;
  break_hours?: number;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  notes?: string;
  is_approved: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkSchedule {
  id: string;
  user_id: string;
  day_of_week: number; // 0-6 (domingo-sábado)
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  break_duration: number; // minutos
  is_active: boolean;
}

export interface TimeReport {
  user_id: string;
  user_name: string;
  period_start: string;
  period_end: string;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  break_hours: number;
  days_worked: number;
  tasks_completed: number;
  productivity_score: number;
}

export class TimeTrackingService {
  /**
   * Registra entrada (clock in)
   */
  static async clockIn(
    location?: { lat: number; lng: number; address?: string },
    taskId?: string
  ): Promise<{ data: TimeEntry | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Usuário não autenticado' };

      // Verificar se já há entrada em aberto
      const { data: openEntry } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .is('clock_out', null)
        .single();

      if (openEntry) {
        return { data: null, error: 'Já existe um registro de entrada em aberto' };
      }

      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          user_id: user.id,
          task_id: taskId,
          clock_in: new Date().toISOString(),
          location: location ? JSON.stringify(location) : null
        })
        .select()
        .single();

      if (!error && data) {
        // Registrar atividade
        await this.logActivity(user.id, 'clock_in', data.id, {
          location,
          task_id: taskId
        });
      }

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Registra saída (clock out)
   */
  static async clockOut(
    notes?: string,
    location?: { lat: number; lng: number; address?: string }
  ): Promise<{ data: TimeEntry | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Usuário não autenticado' };

      // Buscar entrada em aberto
      const { data: openEntry } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .is('clock_out', null)
        .single();

      if (!openEntry) {
        return { data: null, error: 'Nenhuma entrada em aberto encontrada' };
      }

      const clockOut = new Date();
      const clockIn = new Date(openEntry.clock_in);
      const totalHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);

      // Calcular horas de pausa se houver
      let breakHours = 0;
      if (openEntry.break_start && openEntry.break_end) {
        const breakStart = new Date(openEntry.break_start);
        const breakEnd = new Date(openEntry.break_end);
        breakHours = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60);
      }

      const { data, error } = await supabase
        .from('time_entries')
        .update({
          clock_out: clockOut.toISOString(),
          total_hours: totalHours,
          break_hours: breakHours,
          notes,
          location: location ? JSON.stringify(location) : openEntry.location,
          updated_at: new Date().toISOString()
        })
        .eq('id', openEntry.id)
        .select()
        .single();

      if (!error && data) {
        // Registrar atividade
        await this.logActivity(user.id, 'clock_out', data.id, {
          total_hours: totalHours,
          location,
          notes
        });

        // Se estava vinculado a uma tarefa, atualizar horas reais
        if (data.task_id) {
          await supabase
            .from('tasks')
            .update({
              actual_hours: (await this.getTaskTotalHours(data.task_id)),
              updated_at: new Date().toISOString()
            })
            .eq('id', data.task_id);
        }
      }

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Inicia pausa
   */
  static async startBreak(): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Usuário não autenticado' };

      const { error } = await supabase
        .from('time_entries')
        .update({
          break_start: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .is('clock_out', null);

      if (!error) {
        await this.logActivity(user.id, 'break_start');
      }

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Finaliza pausa
   */
  static async endBreak(): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Usuário não autenticado' };

      const { error } = await supabase
        .from('time_entries')
        .update({
          break_end: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .is('clock_out', null);

      if (!error) {
        await this.logActivity(user.id, 'break_end');
      }

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Busca entrada atual do usuário
   */
  static async getCurrentEntry(): Promise<{ data: TimeEntry | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Usuário não autenticado' };

      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          tasks (
            id,
            title,
            sector
          )
        `)
        .eq('user_id', user.id)
        .is('clock_out', null)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Busca histórico de entradas do usuário
   */
  static async getTimeHistory(
    startDate?: string,
    endDate?: string,
    limit: number = 50
  ): Promise<{ data: TimeEntry[] | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Usuário não autenticado' };

      let query = supabase
        .from('time_entries')
        .select(`
          *,
          tasks (
            id,
            title,
            sector
          )
        `)
        .eq('user_id', user.id)
        .order('clock_in', { ascending: false })
        .limit(limit);

      if (startDate) {
        query = query.gte('clock_in', startDate);
      }

      if (endDate) {
        query = query.lte('clock_in', endDate);
      }

      const { data, error } = await query;

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Gera relatório de horas trabalhadas
   */
  static async generateTimeReport(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{ data: TimeReport | null; error: any }> {
    try {
      // Buscar entradas do período
      const { data: entries, error: entriesError } = await supabase
        .from('time_entries')
        .select(`
          *,
          users!inner (
            id,
            name
          ),
          tasks (
            id,
            status
          )
        `)
        .eq('user_id', userId)
        .gte('clock_in', startDate)
        .lte('clock_in', endDate)
        .not('clock_out', 'is', null);

      if (entriesError) return { data: null, error: entriesError };

      if (!entries || entries.length === 0) {
        return { data: null, error: 'Nenhuma entrada encontrada no período' };
      }

      // Calcular estatísticas
      const totalHours = entries.reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
      const breakHours = entries.reduce((sum, entry) => sum + (entry.break_hours || 0), 0);
      const daysWorked = new Set(entries.map(entry => 
        new Date(entry.clock_in).toDateString()
      )).size;

      // Buscar horário padrão do usuário (assumindo 8h/dia)
      const standardHoursPerDay = 8;
      const expectedHours = daysWorked * standardHoursPerDay;
      const regularHours = Math.min(totalHours, expectedHours);
      const overtimeHours = Math.max(0, totalHours - expectedHours);

      // Contar tarefas concluídas no período
      const tasksCompleted = entries.filter(entry => 
        entry.tasks && entry.tasks.status === 'completed'
      ).length;

      // Calcular score de produtividade (simplificado)
      const productivityScore = Math.min(100, Math.round(
        (tasksCompleted / Math.max(1, daysWorked)) * 20 + 
        (regularHours / Math.max(1, expectedHours)) * 80
      ));

      const report: TimeReport = {
        user_id: userId,
        user_name: entries[0].users.name,
        period_start: startDate,
        period_end: endDate,
        total_hours: Math.round(totalHours * 100) / 100,
        regular_hours: Math.round(regularHours * 100) / 100,
        overtime_hours: Math.round(overtimeHours * 100) / 100,
        break_hours: Math.round(breakHours * 100) / 100,
        days_worked: daysWorked,
        tasks_completed: tasksCompleted,
        productivity_score: productivityScore
      };

      return { data: report, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Aprova entrada de tempo (para supervisores/gerentes)
   */
  static async approveTimeEntry(entryId: string): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Usuário não autenticado' };

      const { error } = await supabase
        .from('time_entries')
        .update({
          is_approved: true,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (!error) {
        await this.logActivity(user.id, 'time_approved', entryId);
      }

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Busca entradas pendentes de aprovação
   */
  static async getPendingApprovals(sector?: string): Promise<{ data: TimeEntry[] | null; error: any }> {
    try {
      let query = supabase
        .from('time_entries')
        .select(`
          *,
          users!inner (
            id,
            name,
            sector
          ),
          tasks (
            id,
            title
          )
        `)
        .eq('is_approved', false)
        .not('clock_out', 'is', null)
        .order('clock_in', { ascending: false });

      if (sector) {
        query = query.eq('users.sector', sector);
      }

      const { data, error } = await query;

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Configura horário de trabalho do usuário
   */
  static async setWorkSchedule(schedule: Omit<WorkSchedule, 'id'>[]): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Usuário não autenticado' };

      // Remover horários existentes
      await supabase
        .from('work_schedules')
        .delete()
        .eq('user_id', user.id);

      // Inserir novos horários
      const { error } = await supabase
        .from('work_schedules')
        .insert(schedule.map(s => ({ ...s, user_id: user.id })));

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Busca total de horas trabalhadas em uma tarefa
   */
  private static async getTaskTotalHours(taskId: string): Promise<number> {
    const { data } = await supabase
      .from('time_entries')
      .select('total_hours')
      .eq('task_id', taskId)
      .not('clock_out', 'is', null);

    return data?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;
  }

  /**
   * Registra atividade no log
   */
  private static async logActivity(
    userId: string,
    action: string,
    resourceId?: string,
    details?: any
  ): Promise<void> {
    try {
      await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          action,
          resource_type: 'time_entry',
          resource_id: resourceId,
          details: details ? JSON.stringify(details) : null
        });
    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
    }
  }

  /**
   * Valida se o usuário pode registrar ponto na localização atual
   */
  static async validateLocation(
    lat: number,
    lng: number,
    allowedRadius: number = 100 // metros
  ): Promise<{ isValid: boolean; distance?: number }> {
    try {
      // Coordenadas da loja (exemplo - deve ser configurável)
      const storeLocation = {
        lat: -23.5505, // São Paulo - exemplo
        lng: -46.6333
      };

      const distance = this.calculateDistance(lat, lng, storeLocation.lat, storeLocation.lng);
      const isValid = distance <= allowedRadius;

      return { isValid, distance };
    } catch (error) {
      return { isValid: false };
    }
  }

  /**
   * Calcula distância entre duas coordenadas (fórmula de Haversine)
   */
  private static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
}

// Hook para usar o serviço de controle de ponto
export const useTimeTracking = () => {
  const clockIn = async (location?: { lat: number; lng: number; address?: string }, taskId?: string) => {
    return await TimeTrackingService.clockIn(location, taskId);
  };

  const clockOut = async (notes?: string, location?: { lat: number; lng: number; address?: string }) => {
    return await TimeTrackingService.clockOut(notes, location);
  };

  const startBreak = async () => {
    return await TimeTrackingService.startBreak();
  };

  const endBreak = async () => {
    return await TimeTrackingService.endBreak();
  };

  const getCurrentEntry = async () => {
    return await TimeTrackingService.getCurrentEntry();
  };

  const getTimeHistory = async (startDate?: string, endDate?: string, limit?: number) => {
    return await TimeTrackingService.getTimeHistory(startDate, endDate, limit);
  };

  const generateTimeReport = async (userId: string, startDate: string, endDate: string) => {
    return await TimeTrackingService.generateTimeReport(userId, startDate, endDate);
  };

  const approveTimeEntry = async (entryId: string) => {
    return await TimeTrackingService.approveTimeEntry(entryId);
  };

  const getPendingApprovals = async (sector?: string) => {
    return await TimeTrackingService.getPendingApprovals(sector);
  };

  const validateLocation = async (lat: number, lng: number, allowedRadius?: number) => {
    return await TimeTrackingService.validateLocation(lat, lng, allowedRadius);
  };

  return {
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    getCurrentEntry,
    getTimeHistory,
    generateTimeReport,
    approveTimeEntry,
    getPendingApprovals,
    validateLocation
  };
};