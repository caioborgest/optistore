
import { Notification } from '@/types/database';

export class MockNotificationService {
  private static readonly MOCK_NOTIFICATIONS: Notification[] = [
    {
      id: '1',
      user_id: '1',
      type: 'task_assigned',
      title: 'Nova tarefa atribuída',
      content: 'Você foi atribuído à tarefa "Revisar relatório"',
      is_read: false,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      user_id: '1',
      type: 'task_completed',
      title: 'Tarefa concluída',
      content: 'A tarefa "Atualizar sistema" foi concluída',
      is_read: true,
      read_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '3',
      user_id: '1',
      type: 'message',
      title: 'Nova mensagem',
      content: 'Você recebeu uma nova mensagem no chat',
      is_read: false,
      created_at: new Date(Date.now() - 1800000).toISOString()
    }
  ];

  static async getNotifications(userId: string): Promise<{ notifications: Notification[]; error: any }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const userNotifications = this.MOCK_NOTIFICATIONS.filter(n => n.user_id === userId);
    return { notifications: userNotifications, error: null };
  }

  static async markAsRead(notificationId: string): Promise<{ error: any }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const notification = this.MOCK_NOTIFICATIONS.find(n => n.id === notificationId);
    if (notification) {
      notification.is_read = true;
      notification.read_at = new Date().toISOString();
    }

    return { error: null };
  }

  static async markAllAsRead(userId: string): Promise<{ error: any }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    this.MOCK_NOTIFICATIONS
      .filter(n => n.user_id === userId && !n.is_read)
      .forEach(notification => {
        notification.is_read = true;
        notification.read_at = new Date().toISOString();
      });

    return { error: null };
  }

  static async createNotification(data: Omit<Notification, 'id' | 'created_at'>): Promise<{ notification: Notification | null; error: any }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const newNotification: Notification = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      ...data
    };

    this.MOCK_NOTIFICATIONS.push(newNotification);

    return { notification: newNotification, error: null };
  }
}

export const useMockNotifications = () => {
  const getNotifications = async (userId: string) => {
    return await MockNotificationService.getNotifications(userId);
  };

  const markAsRead = async (notificationId: string) => {
    return await MockNotificationService.markAsRead(notificationId);
  };

  const markAllAsRead = async (userId: string) => {
    return await MockNotificationService.markAllAsRead(userId);
  };

  const createNotification = async (data: Omit<Notification, 'id' | 'created_at'>) => {
    return await MockNotificationService.createNotification(data);
  };

  return {
    getNotifications,
    markAsRead,
    markAllAsRead,
    createNotification
  };
};
