
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/database';

export const NotificationService = {
  async getNotifications(): Promise<{ data?: Notification[]; error?: { message: string } }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return { error: { message: 'Usuário não autenticado' } };
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { error: { message: error.message } };
      }

      const notifications: Notification[] = data?.map(notification => ({
        ...notification,
        type: notification.type as Notification['type'],
      })) || [];

      return { data: notifications };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async markAsRead(notificationId: string): Promise<{ error?: { message: string } }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      if (error) {
        return { error: { message: error.message } };
      }

      return {};
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async markAllAsRead(): Promise<{ error?: { message: string } }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return { error: { message: 'Usuário não autenticado' } };
      }

      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        return { error: { message: error.message } };
      }

      return {};
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<{ data?: Notification; error?: { message: string } }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();

      if (error) {
        return { error: { message: error.message } };
      }

      return { data: data as Notification };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async deleteNotification(notificationId: string): Promise<{ error?: { message: string } }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        return { error: { message: error.message } };
      }

      return {};
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async getUnreadCount(): Promise<{ data?: number; error?: { message: string } }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return { error: { message: 'Usuário não autenticado' } };
      }

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        return { error: { message: error.message } };
      }

      return { data: count || 0 };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },
};
