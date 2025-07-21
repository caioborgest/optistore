
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/database';

export class NotificationService {
  /**
   * Buscar notificações do usuário
   */
  static async getNotifications(userId: string): Promise<{ notifications: Notification[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      return { notifications: data || [], error };
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return { notifications: [], error };
    }
  }

  /**
   * Marcar notificação como lida
   */
  static async markAsRead(notificationId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

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
  static async createNotification(data: Omit<Notification, 'id' | 'created_at'>): Promise<{ notification: Notification | null; error: any }> {
    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert(data)
        .select()
        .single();

      return { notification, error };
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      return { notification: null, error };
    }
  }

  /**
   * Deletar notificação
   */
  static async deleteNotification(notificationId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      return { error };
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      return { error };
    }
  }

  /**
   * Buscar notificações não lidas
   */
  static async getUnreadNotifications(userId: string): Promise<{ notifications: Notification[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      return { notifications: data || [], error };
    } catch (error) {
      console.error('Erro ao buscar notificações não lidas:', error);
      return { notifications: [], error };
    }
  }
}

export const useNotifications = () => {
  const getNotifications = async (userId: string) => {
    return await NotificationService.getNotifications(userId);
  };

  const markAsRead = async (notificationId: string) => {
    return await NotificationService.markAsRead(notificationId);
  };

  const markAllAsRead = async (userId: string) => {
    return await NotificationService.markAllAsRead(userId);
  };

  const createNotification = async (data: Omit<Notification, 'id' | 'created_at'>) => {
    return await NotificationService.createNotification(data);
  };

  const deleteNotification = async (notificationId: string) => {
    return await NotificationService.deleteNotification(notificationId);
  };

  const getUnreadNotifications = async (userId: string) => {
    return await NotificationService.getUnreadNotifications(userId);
  };

  return {
    getNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
    getUnreadNotifications
  };
};
