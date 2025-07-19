import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 'task_assigned' | 'task_due' | 'task_completed' | 'task_overdue' | 'message' | 'system' | 'reminder';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content?: string;
  type: NotificationType;
  reference_id?: string;
  reference_type?: string;
  is_read: boolean;
  read_at?: string;
  expires_at?: string;
  created_at: string;
}

export class NotificationService {
  /**
   * Cria uma nova notificação
   */
  static async createNotification(
    userId: string,
    title: string,
    content: string,
    type: NotificationType,
    referenceId?: string,
    referenceType?: string
  ): Promise<{ data: Notification | null; error: any }> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        content,
        type,
        reference_id: referenceId,
        reference_type: referenceType
      })
      .select()
      .single();

    if (!error && data) {
      // Enviar notificação em tempo real
      await supabase
        .channel(`user:${userId}`)
        .send({
          type: 'broadcast',
          event: 'notification',
          payload: data
        });
    }

    return { data, error };
  }

  /**
   * Busca notificações do usuário
   */
  static async getUserNotifications(
    userId: string,
    limit: number = 50,
    onlyUnread: boolean = false
  ): Promise<{ data: Notification[] | null; error: any }> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (onlyUnread) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;
    return { data, error };
  }

  /**
   * Marca notificação como lida
   */
  static async markAsRead(notificationId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    return { error };
  }

  /**
   * Marca todas as notificações como lidas
   */
  static async markAllAsRead(userId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    return { error };
  }

  /**
   * Conta notificações não lidas
   */
  static async getUnreadCount(userId: string): Promise<{ count: number; error: any }> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    return { count: count || 0, error };
  }

  /**
   * Remove notificação
   */
  static async deleteNotification(notificationId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    return { error };
  }

  /**
   * Subscreve para notificações em tempo real
   */
  static subscribeToNotifications(
    userId: string,
    onNotification: (notification: Notification) => void
  ): () => void {
    const channel = supabase
      .channel(`user:${userId}`)
      .on('broadcast', { event: 'notification' }, ({ payload }) => {
        onNotification(payload);
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        ({ new: notification }) => {
          onNotification(notification as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Cria notificação para tarefa atribuída
   */
  static async notifyTaskAssigned(
    taskId: string,
    taskTitle: string,
    assignedUserId: string,
    assignedByUserId: string
  ): Promise<void> {
    // Buscar nome do usuário que atribuiu
    const { data: assignedByUser } = await supabase
      .from('users')
      .select('name')
      .eq('id', assignedByUserId)
      .single();

    await this.createNotification(
      assignedUserId,
      'Nova tarefa atribuída',
      `${assignedByUser?.name || 'Alguém'} atribuiu a tarefa "${taskTitle}" para você.`,
      'task_assigned',
      taskId,
      'task'
    );
  }

  /**
   * Cria notificação para tarefa próxima do vencimento
   */
  static async notifyTaskDue(
    taskId: string,
    taskTitle: string,
    assignedUserId: string,
    dueDate: string
  ): Promise<void> {
    const dueDateFormatted = new Date(dueDate).toLocaleDateString('pt-BR');
    
    await this.createNotification(
      assignedUserId,
      'Tarefa próxima do vencimento',
      `A tarefa "${taskTitle}" vence em ${dueDateFormatted}.`,
      'task_due',
      taskId,
      'task'
    );
  }

  /**
   * Cria notificação para tarefa concluída
   */
  static async notifyTaskCompleted(
    taskId: string,
    taskTitle: string,
    completedByUserId: string,
    supervisorUserId?: string
  ): Promise<void> {
    if (!supervisorUserId) return;

    // Buscar nome do usuário que concluiu
    const { data: completedByUser } = await supabase
      .from('users')
      .select('name')
      .eq('id', completedByUserId)
      .single();

    await this.createNotification(
      supervisorUserId,
      'Tarefa concluída',
      `${completedByUser?.name || 'Alguém'} concluiu a tarefa "${taskTitle}".`,
      'task_completed',
      taskId,
      'task'
    );
  }

  /**
   * Cria notificação para nova mensagem
   */
  static async notifyNewMessage(
    chatId: string,
    chatName: string,
    senderUserId: string,
    senderName: string,
    content: string,
    recipientUserIds: string[]
  ): Promise<void> {
    const truncatedContent = content.length > 50 
      ? `${content.substring(0, 50)}...` 
      : content;

    for (const recipientId of recipientUserIds) {
      if (recipientId !== senderUserId) {
        await this.createNotification(
          recipientId,
          `Nova mensagem de ${senderName}`,
          `${chatName}: ${truncatedContent}`,
          'message',
          chatId,
          'chat'
        );
      }
    }
  }

  /**
   * Limpa notificações antigas
   */
  static async cleanupOldNotifications(daysOld: number = 30): Promise<{ error: any }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('is_read', true)
      .lt('created_at', cutoffDate.toISOString());

    return { error };
  }
}

// Hook para usar o serviço de notificações
export const useNotifications = () => {
  const createNotification = async (
    userId: string,
    title: string,
    content: string,
    type: NotificationType,
    referenceId?: string,
    referenceType?: string
  ) => {
    return await NotificationService.createNotification(userId, title, content, type, referenceId, referenceType);
  };

  const getUserNotifications = async (userId: string, limit?: number, onlyUnread?: boolean) => {
    return await NotificationService.getUserNotifications(userId, limit, onlyUnread);
  };

  const markAsRead = async (notificationId: string) => {
    return await NotificationService.markAsRead(notificationId);
  };

  const markAllAsRead = async (userId: string) => {
    return await NotificationService.markAllAsRead(userId);
  };

  const getUnreadCount = async (userId: string) => {
    return await NotificationService.getUnreadCount(userId);
  };

  const deleteNotification = async (notificationId: string) => {
    return await NotificationService.deleteNotification(notificationId);
  };

  const subscribeToNotifications = (userId: string, onNotification: (notification: Notification) => void) => {
    return NotificationService.subscribeToNotifications(userId, onNotification);
  };

  return {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification,
    subscribeToNotifications
  };
};