
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/database';

export class NotificationService {
  /**
   * Buscar notificações do usuário
   */
  static async getNotifications(userId: string): Promise<{ notifications: Notification[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { notifications: data, error };
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return { notifications: null, error };
    }
  }

  /**
   * Marcar notificação como lida
   */
  static async markAsRead(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return { error };
    }
  }

  /**
   * Marcar todas as notificações como lidas
   */
  static async markAllAsRead(userId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      return { error };
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      return { error };
    }
  }

  /**
   * Criar nova notificação
   */
  static async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<{ notification: Notification | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      return { notification: data, error };
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      return { notification: null, error };
    }
  }

  /**
   * Deletar notificação
   */
  static async deleteNotification(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      return { error };
    }
  }

  /**
   * Buscar notificações não lidas
   */
  static async getUnreadNotifications(userId: string): Promise<{ notifications: Notification[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      return { notifications: data, error };
    } catch (error) {
      console.error('Erro ao buscar notificações não lidas:', error);
      return { notifications: null, error };
    }
  }
}
