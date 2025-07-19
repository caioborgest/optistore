import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { NotificationService, Notification } from '@/services/notificationService';
import { useToast } from './use-toast';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar notificações
  const loadNotifications = useCallback(async () => {
    if (!userProfile) return;

    try {
      setIsLoading(true);
      const { data, error } = await NotificationService.getUserNotifications(userProfile.id, 50);
      
      if (error) {
        console.error('Erro ao carregar notificações:', error);
        return;
      }

      if (data) {
        setNotifications(data);
        const unread = data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userProfile]);

  // Marcar como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await NotificationService.markAsRead(notificationId);
      
      if (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível marcar a notificação como lida',
          variant: 'destructive'
        });
        return;
      }

      // Atualizar estado local
      setNotifications(prev => prev.map(n => 
        n.id === notificationId 
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }, [toast]);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    if (!userProfile) return;

    try {
      const { error } = await NotificationService.markAllAsRead(userProfile.id);
      
      if (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível marcar todas as notificações como lidas',
          variant: 'destructive'
        });
        return;
      }

      // Atualizar estado local
      const now = new Date().toISOString();
      setNotifications(prev => prev.map(n => ({ 
        ...n, 
        is_read: true, 
        read_at: n.read_at || now 
      })));
      
      setUnreadCount(0);

      toast({
        title: 'Sucesso',
        description: 'Todas as notificações foram marcadas como lidas'
      });
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  }, [userProfile, toast]);

  // Deletar notificação
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await NotificationService.deleteNotification(notificationId);
      
      if (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível remover a notificação',
          variant: 'destructive'
        });
        return;
      }

      // Atualizar estado local
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      toast({
        title: 'Sucesso',
        description: 'Notificação removida'
      });
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  }, [notifications, toast]);

  // Atualizar notificações
  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  // Carregar notificações ao montar o componente
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Subscrever para notificações em tempo real
  useEffect(() => {
    if (!userProfile) return;

    const unsubscribe = NotificationService.subscribeToNotifications(
      userProfile.id,
      (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        
        if (!newNotification.is_read) {
          setUnreadCount(prev => prev + 1);
        }

        // Mostrar toast para notificações importantes
        if (['task_assigned', 'task_due', 'task_overdue'].includes(newNotification.type)) {
          toast({
            title: newNotification.title,
            description: newNotification.content,
          });
        }
      }
    );

    return unsubscribe;
  }, [userProfile, toast]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  };
};