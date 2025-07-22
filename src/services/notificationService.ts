
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
          read_at: new Date().toISOString()
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

      const createdNotification: Notification = {
        ...data,
        type: data.type as Notification['type'],
      };

      return { data: createdNotification };
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
          read_at: new Date().toISOString()
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

  async getUnreadCount(): Promise<{ count: number; error?: { message: string } }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return { count: 0, error: { message: 'Usuário não autenticado' } };
      }

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        return { count: 0, error: { message: error.message } };
      }

      return { count: count || 0 };
    } catch (error: any) {
      return { count: 0, error: { message: error.message } };
    }
  },

  async createTaskNotification(taskId: string, assignedUserId: string, type: 'task_assigned' | 'task_due' | 'task_overdue', taskTitle: string) {
    const titles = {
      task_assigned: 'Nova Tarefa Atribuída',
      task_due: 'Tarefa Próxima do Vencimento',
      task_overdue: 'Tarefa Atrasada'
    };

    const contents = {
      task_assigned: `Você recebeu uma nova tarefa: "${taskTitle}"`,
      task_due: `A tarefa "${taskTitle}" vence em breve`,
      task_overdue: `A tarefa "${taskTitle}" está atrasada`
    };

    return this.createNotification({
      user_id: assignedUserId,
      title: titles[type],
      content: contents[type],
      type,
      reference_id: taskId,
      reference_type: 'task',
      is_read: false,
      read_at: undefined,
      expires_at: undefined
    });
  },

  async createMessageNotification(messageId: string, userId: string, senderName: string, chatName?: string) {
    return this.createNotification({
      user_id: userId,
      title: 'Nova Mensagem',
      content: `${senderName} enviou uma mensagem${chatName ? ` em ${chatName}` : ''}`,
      type: 'message',
      reference_id: messageId,
      reference_type: 'message',
      is_read: false,
      read_at: undefined,
      expires_at: undefined
    });
  },

  // Subscrever a notificações em tempo real
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
