import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
  badge?: number;
  categoryId?: string;
}

export interface LocalNotification extends PushNotification {
  trigger?: {
    seconds?: number;
    date?: Date;
    repeats?: boolean;
  };
}

class NotificationService {
  private pushToken: string | null = null;

  async setupNotifications(): Promise<string | null> {
    try {
      // Verificar se é um dispositivo físico
      if (!Device.isDevice) {
        console.log('Notificações push só funcionam em dispositivos físicos');
        return null;
      }

      // Solicitar permissões
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permissão para notificações negada');
        return null;
      }

      // Obter token push
      const token = await this.getExpoPushToken();
      
      if (token) {
        this.pushToken = token;
        await this.savePushTokenToServer(token);
        await AsyncStorage.setItem('pushToken', token);
      }

      // Configurar canal de notificação para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'OptiFlow',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3B82F6',
          sound: 'default',
        });

        // Canal para tarefas urgentes
        await Notifications.setNotificationChannelAsync('urgent', {
          name: 'Tarefas Urgentes',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#EF4444',
          sound: 'default',
        });

        // Canal para chat
        await Notifications.setNotificationChannelAsync('chat', {
          name: 'Mensagens',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          lightColor: '#10B981',
          sound: 'default',
        });
      }

      // Configurar categorias de notificação
      await this.setupNotificationCategories();

      return token;
    } catch (error) {
      console.error('Erro ao configurar notificações:', error);
      return null;
    }
  }

  private async getExpoPushToken(): Promise<string | null> {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      
      if (!projectId) {
        console.error('Project ID não encontrado');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      return token.data;
    } catch (error) {
      console.error('Erro ao obter token push:', error);
      return null;
    }
  }

  private async savePushTokenToServer(token: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      await supabase
        .from('user_push_tokens')
        .upsert({
          user_id: user.id,
          push_token: token,
          platform: Platform.OS,
          device_info: {
            brand: Device.brand,
            modelName: Device.modelName,
            osName: Device.osName,
            osVersion: Device.osVersion,
          },
          is_active: true,
          updated_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Erro ao salvar token no servidor:', error);
    }
  }

  private async setupNotificationCategories(): Promise<void> {
    await Notifications.setNotificationCategoryAsync('task', [
      {
        identifier: 'view',
        buttonTitle: 'Ver Tarefa',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'complete',
        buttonTitle: 'Concluir',
        options: { opensAppToForeground: false },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('chat', [
      {
        identifier: 'reply',
        buttonTitle: 'Responder',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'mark_read',
        buttonTitle: 'Marcar como Lida',
        options: { opensAppToForeground: false },
      },
    ]);
  }

  async scheduleLocalNotification(notification: LocalNotification): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: notification.sound !== false,
        badge: notification.badge,
        categoryIdentifier: notification.categoryId,
      },
      trigger: notification.trigger || null,
    });

    return notificationId;
  }

  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  // Notificações específicas do OptiFlow
  async notifyTaskAssigned(taskTitle: string, taskId: string, priority: string): Promise<void> {
    const isUrgent = priority === 'urgent' || priority === 'high';
    
    await this.scheduleLocalNotification({
      title: '📋 Nova Tarefa Atribuída',
      body: `Você recebeu uma nova tarefa: ${taskTitle}`,
      data: {
        type: 'task_assigned',
        taskId,
        priority,
      },
      categoryId: 'task',
      sound: true,
      badge: await this.getBadgeCount() + 1,
      trigger: isUrgent ? { seconds: 1 } : { seconds: 5 },
    });
  }

  async notifyTaskDue(taskTitle: string, taskId: string, dueDate: Date): Promise<void> {
    const now = new Date();
    const timeDiff = dueDate.getTime() - now.getTime();
    const hoursUntilDue = Math.floor(timeDiff / (1000 * 60 * 60));

    let message = '';
    if (hoursUntilDue <= 1) {
      message = `A tarefa "${taskTitle}" vence em menos de 1 hora!`;
    } else if (hoursUntilDue <= 24) {
      message = `A tarefa "${taskTitle}" vence em ${hoursUntilDue} horas.`;
    } else {
      const days = Math.floor(hoursUntilDue / 24);
      message = `A tarefa "${taskTitle}" vence em ${days} dia(s).`;
    }

    await this.scheduleLocalNotification({
      title: '⏰ Tarefa Próxima do Vencimento',
      body: message,
      data: {
        type: 'task_due',
        taskId,
        dueDate: dueDate.toISOString(),
      },
      categoryId: 'task',
      sound: true,
      badge: await this.getBadgeCount() + 1,
    });
  }

  async notifyTaskOverdue(taskTitle: string, taskId: string): Promise<void> {
    await this.scheduleLocalNotification({
      title: '🚨 Tarefa Atrasada',
      body: `A tarefa "${taskTitle}" está atrasada e precisa de atenção!`,
      data: {
        type: 'task_overdue',
        taskId,
      },
      categoryId: 'task',
      sound: true,
      badge: await this.getBadgeCount() + 1,
    });
  }

  async notifyNewMessage(senderName: string, message: string, chatId: string): Promise<void> {
    await this.scheduleLocalNotification({
      title: `💬 ${senderName}`,
      body: message.length > 50 ? `${message.substring(0, 50)}...` : message,
      data: {
        type: 'new_message',
        chatId,
        senderName,
      },
      categoryId: 'chat',
      sound: true,
      badge: await this.getBadgeCount() + 1,
    });
  }

  async notifyLocationReminder(taskTitle: string, taskId: string, location: string): Promise<void> {
    await this.scheduleLocalNotification({
      title: '📍 Lembrete de Localização',
      body: `Você está próximo ao local da tarefa "${taskTitle}" em ${location}`,
      data: {
        type: 'location_reminder',
        taskId,
        location,
      },
      categoryId: 'task',
      sound: true,
    });
  }

  async scheduleRecurringTaskReminder(taskTitle: string, taskId: string, schedule: Date): Promise<string> {
    return await this.scheduleLocalNotification({
      title: '🔄 Tarefa Recorrente',
      body: `Lembrete: "${taskTitle}" deve ser executada hoje.`,
      data: {
        type: 'recurring_task',
        taskId,
      },
      categoryId: 'task',
      sound: true,
      trigger: {
        date: schedule,
        repeats: false,
      },
    });
  }

  // Listener para ações de notificação
  setupNotificationListeners() {
    // Resposta a notificações quando o app está em foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificação recebida em foreground:', notification);
    });

    // Resposta a interações com notificações
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { notification, actionIdentifier } = response;
      const data = notification.request.content.data;

      console.log('Interação com notificação:', { actionIdentifier, data });

      // Processar ações específicas
      this.handleNotificationAction(actionIdentifier, data);
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }

  private async handleNotificationAction(actionIdentifier: string, data: any): Promise<void> {
    switch (actionIdentifier) {
      case 'complete':
        if (data.taskId) {
          await this.completeTaskFromNotification(data.taskId);
        }
        break;
      case 'mark_read':
        if (data.chatId) {
          await this.markChatAsReadFromNotification(data.chatId);
        }
        break;
      default:
        // Ação padrão - abrir o app na tela relevante
        break;
    }
  }

  private async completeTaskFromNotification(taskId: string): Promise<void> {
    try {
      await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      await this.scheduleLocalNotification({
        title: '✅ Tarefa Concluída',
        body: 'Tarefa marcada como concluída com sucesso!',
        data: { type: 'task_completed', taskId },
      });
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
    }
  }

  private async markChatAsReadFromNotification(chatId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      await supabase
        .from('chat_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('chat_id', chatId)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Erro ao marcar chat como lido:', error);
    }
  }
}

export const notificationService = new NotificationService();

export async function setupNotifications(): Promise<string | null> {
  return await notificationService.setupNotifications();
}