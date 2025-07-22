import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { offlineService, SyncResult } from '@/services/offlineService';

interface OfflineContextType {
  isOnline: boolean;
  pendingActions: number;
  lastSync: Date | null;
  syncInProgress: boolean;
  syncData: () => Promise<SyncResult>;
  createTaskOffline: (taskData: any) => Promise<string>;
  updateTaskOffline: (taskId: string, updates: any) => Promise<void>;
  sendMessageOffline: (chatId: string, content: string, senderId: string) => Promise<string>;
  getOfflineData: (key: 'tasks' | 'messages' | 'users') => Promise<any[]>;
  clearOfflineData: () => Promise<void>;
  offlineStats: {
    tasksCount: number;
    messagesCount: number;
    usersCount: number;
    pendingActions: number;
    lastSync: Date | null;
  };
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

interface OfflineProviderProps {
  children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [offlineStats, setOfflineStats] = useState({
    tasksCount: 0,
    messagesCount: 0,
    usersCount: 0,
    pendingActions: 0,
    lastSync: null as Date | null,
  });

  useEffect(() => {
    // Inicializar estado
    updateOfflineStatus();
    updateOfflineStats();

    // Verificar status periodicamente
    const interval = setInterval(() => {
      updateOfflineStatus();
      updateOfflineStats();
    }, 30000); // A cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const updateOfflineStatus = async () => {
    const online = offlineService.getIsOnline();
    const pending = await offlineService.getPendingActionsCount();
    
    setIsOnline(online);
    setPendingActions(pending);
  };

  const updateOfflineStats = async () => {
    const stats = await offlineService.getOfflineStats();
    setOfflineStats(stats);
    setLastSync(stats.lastSync);
  };

  const syncData = async (): Promise<SyncResult> => {
    setSyncInProgress(true);
    try {
      const result = await offlineService.forceSync();
      await updateOfflineStatus();
      await updateOfflineStats();
      return result;
    } finally {
      setSyncInProgress(false);
    }
  };

  const createTaskOffline = async (taskData: any): Promise<string> => {
    const taskId = await offlineService.createTaskOffline(taskData);
    await updateOfflineStatus();
    await updateOfflineStats();
    return taskId;
  };

  const updateTaskOffline = async (taskId: string, updates: any): Promise<void> => {
    await offlineService.updateTaskOffline(taskId, updates);
    await updateOfflineStatus();
    await updateOfflineStats();
  };

  const sendMessageOffline = async (chatId: string, content: string, senderId: string): Promise<string> => {
    const messageId = await offlineService.sendMessageOffline(chatId, content, senderId);
    await updateOfflineStatus();
    await updateOfflineStats();
    return messageId;
  };

  const getOfflineData = async (key: 'tasks' | 'messages' | 'users'): Promise<any[]> => {
    return await offlineService.getOfflineData(key);
  };

  const clearOfflineData = async (): Promise<void> => {
    await offlineService.clearOfflineData();
    await updateOfflineStatus();
    await updateOfflineStats();
  };

  const value: OfflineContextType = {
    isOnline,
    pendingActions,
    lastSync,
    syncInProgress,
    syncData,
    createTaskOffline,
    updateTaskOffline,
    sendMessageOffline,
    getOfflineData,
    clearOfflineData,
    offlineStats,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline(): OfflineContextType {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}