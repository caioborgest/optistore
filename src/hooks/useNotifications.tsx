import { useState, useEffect } from 'react';
import { NotificationService } from '@/services/notificationService';
import type { Notification } from '@/types/database';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await NotificationService.getNotifications();
    
    if (error) {
      setError(error.message);
    } else {
      setNotifications(data || []);
    }
    
    setLoading(false);
  };

  const fetchUnreadCount = async () => {
    const { count, error } = await NotificationService.getUnreadCount();
    
    if (!error) {
      setUnreadCount(count);
    }
  };

  const markAsRead = async (notificationId: string) => {
    const { error } = await NotificationService.markAsRead(notificationId);
    
    if (!error) {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    return { error };
  };

  const markAllAsRead = async () => {
    const { error } = await NotificationService.markAllAsRead();
    
    if (!error) {
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      );
      setUnreadCount(0);
    }
    
    return { error };
  };

  const deleteNotification = async (notificationId: string) => {
    const { error } = await NotificationService.deleteNotification(notificationId);
    
    if (!error) {
      const wasUnread = notifications.find(n => n.id === notificationId && !n.is_read);
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
    
    return { error };
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.is_read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const createNotification = async (data: Omit<Notification, 'id' | 'created_at'>) => {
    const { data: notification, error } = await NotificationService.createNotification(data);
    
    if (!error && notification) {
      addNotification(notification);
    }
    
    return { data: notification, error };
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  // Subscrever a notificações em tempo real
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = NotificationService.subscribeToNotifications(
      user.id,
      (notification) => {
        addNotification(notification);
        
        // Mostrar notificação do navegador se permitido
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.content,
            icon: '/icon-192x192.png'
          });
        }
      }
    );

    return unsubscribe;
  }, [user?.id]);

  // Solicitar permissão para notificações
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refetch: fetchNotifications,
    refresh: fetchNotifications,
    addNotification,
  };
};