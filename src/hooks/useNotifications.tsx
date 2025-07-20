
import { useState, useEffect } from 'react';
import { useMockNotifications } from '@/services/mockNotificationService';
import { Notification } from '@/types/database';

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    createNotification
  } = useMockNotifications();

  const loadNotifications = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { notifications: data, error } = await getNotifications(userId);
      if (error) {
        setError(error.message);
      } else {
        setNotifications(data || []);
      }
    } catch (err) {
      setError('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { error } = await markAsRead(notificationId);
      if (!error) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        );
      }
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;

    try {
      const { error } = await markAllAsRead(userId);
      if (!error) {
        setNotifications(prev => 
          prev.map(n => ({ 
            ...n, 
            is_read: true, 
            read_at: new Date().toISOString() 
          }))
        );
      }
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
    }
  };

  const handleCreateNotification = async (data: Omit<Notification, 'id' | 'created_at'>) => {
    try {
      const { notification, error } = await createNotification(data);
      if (!error && notification) {
        setNotifications(prev => [notification, ...prev]);
      }
    } catch (err) {
      console.error('Erro ao criar notificação:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    createNotification: handleCreateNotification,
    refresh: loadNotifications
  };
};
