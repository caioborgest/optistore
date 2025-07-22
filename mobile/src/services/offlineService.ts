import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from './supabaseClient';
import { notificationService } from './notificationService';

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  userId: string;
}

export interface OfflineData {
  tasks: any[];
  messages: any[];
  users: any[];
  lastSync: number;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

class OfflineService {
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private pendingActions: OfflineAction[] = [];
  private offlineData: OfflineData = {
    tasks: [],
    messages: [],
    users: [],
    lastSync: 0,
  };

  constructor() {
    this.initializeNetworkListener();
    this.loadOfflineData();
    this.loadPendingActions();
  }

  private initializeNetworkListener(): void {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      console.log('Status da conexão:', this.isOnline ? 'Online' : 'Offline');

      // Se voltou online, tentar sincronizar
      if (wasOffline && this.isOnline) {
        this.handleBackOnline();
      }
    });
  }

  private async handleBackOnline(): Promise<void> {
    await notificationService.scheduleLocalNotification({
      title: '🌐 Conexão Restaurada',
      body: 'Sincronizando dados offline...',
      data: { type: 'back_online' },
    });

    await this.syncPendingActions();
    await this.syncOfflineData();
  }

  async isConnected(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  }

  // ===== GESTÃO DE DADOS OFFLINE =====

  async saveOfflineData(key: keyof OfflineData, data: any[]): Promise<void> {
    try {
      this.offlineData[key] = data;
      this.offlineData.lastSync = Date.now();
      
      await AsyncStorage.setItem('offlineData', JSON.stringify(this.offlineData));
    } catch (error) {
      console.error('Erro ao salvar dados offline:', error);
    }
  }

  async loadOfflineData(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('offlineData');
      if (stored) {
        this.offlineData = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar dados offline:', error);
    }
  }

  async getOfflineData(key: keyof OfflineData): Promise<any[]> {
    return this.offlineData[key] || [];
  }

  // ===== GESTÃO DE AÇÕES PENDENTES =====

  async addPendingAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): Promise<void> {
    const pendingAction: OfflineAction = {
      ...action,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.pendingActions.push(pendingAction);
    await this.savePendingActions();

    console.log('Ação adicionada à fila offline:', pendingAction);
  }

  private async savePendingActions(): Promise<void> {
    try {
      await AsyncStorage.setItem('pendingActions', JSON.stringify(this.pendingActions));
    } catch (error) {
      console.error('Erro ao salvar ações pendentes:', error);
    }
  }

  private async loadPendingActions(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('pendingActions');
      if (stored) {
        this.pendingActions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar ações pendentes:', error);
    }
  }

  async getPendingActionsCount(): Promise<number> {
    return this.pendingActions.length;
  }

  // ===== SINCRONIZAÇÃO =====

  async syncPendingActions(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return { success: false, synced: 0, failed: 0, errors: ['Sincronização já em andamento'] };
    }

    this.syncInProgress = true;
    const result: SyncResult = { success: true, synced: 0, failed: 0, errors: [] };

    try {
      const isOnline = await this.isConnected();
      if (!isOnline) {
        throw new Error('Sem conexão com a internet');
      }

      console.log(`Sincronizando ${this.pendingActions.length} ações pendentes...`);

      for (const action of [...this.pendingActions]) {
        try {
          await this.executePendingAction(action);
          
          // Remover ação da lista após sucesso
          this.pendingActions = this.pendingActions.filter(a => a.id !== action.id);
          result.synced++;
        } catch (error: any) {
          console.error('Erro ao executar ação pendente:', error);
          result.failed++;
          result.errors.push(`${action.type} ${action.table}: ${error.message}`);
        }
      }

      await this.savePendingActions();

      if (result.synced > 0) {
        await notificationService.scheduleLocalNotification({
          title: '✅ Sincronização Concluída',
          body: `${result.synced} ação(ões) sincronizada(s) com sucesso`,
          data: { type: 'sync_complete', result },
        });
      }

    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
    } finally {
      this.syncInProgress = false;
    }

    return result;
  }

  private async executePendingAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'create':
        await this.executeCreate(action);
        break;
      case 'update':
        await this.executeUpdate(action);
        break;
      case 'delete':
        await this.executeDelete(action);
        break;
      default:
        throw new Error(`Tipo de ação não suportado: ${action.type}`);
    }
  }

  private async executeCreate(action: OfflineAction): Promise<void> {
    const { error } = await supabase
      .from(action.table)
      .insert(action.data);

    if (error) {
      throw error;
    }
  }

  private async executeUpdate(action: OfflineAction): Promise<void> {
    const { id, ...updateData } = action.data;
    
    const { error } = await supabase
      .from(action.table)
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  private async executeDelete(action: OfflineAction): Promise<void> {
    const { error } = await supabase
      .from(action.table)
      .delete()
      .eq('id', action.data.id);

    if (error) {
      throw error;
    }
  }

  async syncOfflineData(): Promise<void> {
    try {
      const isOnline = await this.isConnected();
      if (!isOnline) return;

      console.log('Sincronizando dados para uso offline...');

      // Sincronizar tarefas
      await this.syncTasks();
      
      // Sincronizar usuários
      await this.syncUsers();
      
      // Sincronizar mensagens recentes
      await this.syncRecentMessages();

      this.offlineData.lastSync = Date.now();
      await AsyncStorage.setItem('offlineData', JSON.stringify(this.offlineData));

      console.log('Dados offline sincronizados com sucesso');
    } catch (error) {
      console.error('Erro ao sincronizar dados offline:', error);
    }
  }

  private async syncTasks(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:users!assigned_to(name, email),
        creator:users!created_by(name, email)
      `)
      .or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Últimos 30 dias
      .order('created_at', { ascending: false });

    if (!error && tasks) {
      await this.saveOfflineData('tasks', tasks);
    }
  }

  private async syncUsers(): Promise<void> {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, sector, avatar_url')
      .eq('is_active', true);

    if (!error && users) {
      await this.saveOfflineData('users', users);
    }
  }

  private async syncRecentMessages(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Buscar chats do usuário
    const { data: userChats } = await supabase
      .from('chat_members')
      .select('chat_id')
      .eq('user_id', user.id);

    if (!userChats) return;

    const chatIds = userChats.map(uc => uc.chat_id);

    // Buscar mensagens recentes
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(name, email, avatar_url)
      `)
      .in('chat_id', chatIds)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Últimos 7 dias
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(500);

    if (!error && messages) {
      await this.saveOfflineData('messages', messages);
    }
  }

  // ===== OPERAÇÕES OFFLINE ESPECÍFICAS =====

  async createTaskOffline(taskData: any): Promise<string> {
    const offlineId = `offline_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task = {
      ...taskData,
      id: offlineId,
      created_at: new Date().toISOString(),
      status: 'pending',
      offline: true,
    };

    // Adicionar à lista offline
    const tasks = await this.getOfflineData('tasks');
    tasks.unshift(task);
    await this.saveOfflineData('tasks', tasks);

    // Adicionar à fila de sincronização
    await this.addPendingAction({
      type: 'create',
      table: 'tasks',
      data: { ...taskData, created_at: task.created_at },
      userId: taskData.created_by || taskData.assigned_to,
    });

    return offlineId;
  }

  async updateTaskOffline(taskId: string, updates: any): Promise<void> {
    // Atualizar dados offline
    const tasks = await this.getOfflineData('tasks');
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex >= 0) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates, updated_at: new Date().toISOString() };
      await this.saveOfflineData('tasks', tasks);
    }

    // Adicionar à fila de sincronização
    await this.addPendingAction({
      type: 'update',
      table: 'tasks',
      data: { id: taskId, ...updates, updated_at: new Date().toISOString() },
      userId: updates.assigned_to || updates.created_by,
    });
  }

  async sendMessageOffline(chatId: string, content: string, senderId: string): Promise<string> {
    const offlineId = `offline_message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const message = {
      id: offlineId,
      chat_id: chatId,
      sender_id: senderId,
      content,
      message_type: 'text',
      created_at: new Date().toISOString(),
      offline: true,
      sender: await this.getUserById(senderId),
    };

    // Adicionar à lista offline
    const messages = await this.getOfflineData('messages');
    messages.unshift(message);
    await this.saveOfflineData('messages', messages);

    // Adicionar à fila de sincronização
    await this.addPendingAction({
      type: 'create',
      table: 'messages',
      data: {
        chat_id: chatId,
        sender_id: senderId,
        content,
        message_type: 'text',
        created_at: message.created_at,
      },
      userId: senderId,
    });

    return offlineId;
  }

  private async getUserById(userId: string): Promise<any> {
    const users = await this.getOfflineData('users');
    return users.find(u => u.id === userId) || { id: userId, name: 'Usuário', email: '' };
  }

  // ===== UTILITÁRIOS =====

  async clearOfflineData(): Promise<void> {
    this.offlineData = {
      tasks: [],
      messages: [],
      users: [],
      lastSync: 0,
    };
    
    await AsyncStorage.removeItem('offlineData');
    await AsyncStorage.removeItem('pendingActions');
    this.pendingActions = [];
  }

  async getOfflineStats(): Promise<{
    tasksCount: number;
    messagesCount: number;
    usersCount: number;
    pendingActions: number;
    lastSync: Date | null;
  }> {
    return {
      tasksCount: this.offlineData.tasks.length,
      messagesCount: this.offlineData.messages.length,
      usersCount: this.offlineData.users.length,
      pendingActions: this.pendingActions.length,
      lastSync: this.offlineData.lastSync ? new Date(this.offlineData.lastSync) : null,
    };
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  async forceSync(): Promise<SyncResult> {
    await this.syncOfflineData();
    return await this.syncPendingActions();
  }
}

export const offlineService = new OfflineService();