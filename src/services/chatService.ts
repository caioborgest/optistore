import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Chat {
  id: string;
  name?: string;
  type: 'direct' | 'group' | 'sector' | 'task';
  description?: string;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMember {
  id: string;
  chat_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  last_read_at: string;
  user?: {
    id: string;
    name: string;
    avatar_url?: string;
    sector?: string;
  };
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  reply_to?: string;
  edited_at?: string;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  reply_message?: Message;
}

export interface ChatWithDetails extends Chat {
  members: ChatMember[];
  last_message?: Message;
  unread_count: number;
}

export class ChatService {
  private static channels: Map<string, RealtimeChannel> = new Map();

  /**
   * Cria um novo chat
   */
  static async createChat(
    name: string,
    type: Chat['type'],
    memberIds: string[],
    description?: string
  ): Promise<{ data: Chat | null; error: any }> {
    try {
      // Criar o chat
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          name,
          type,
          description,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (chatError) return { data: null, error: chatError };

      // Adicionar membros
      const members = memberIds.map(userId => ({
        chat_id: chat.id,
        user_id: userId,
        role: 'member' as const
      }));

      // Adicionar o criador como admin
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (currentUser && !memberIds.includes(currentUser.id)) {
        members.push({
          chat_id: chat.id,
          user_id: currentUser.id,
          role: 'admin' as const
        });
      }

      const { error: membersError } = await supabase
        .from('chat_members')
        .insert(members);

      if (membersError) {
        // Rollback: deletar o chat se falhou ao adicionar membros
        await supabase.from('chats').delete().eq('id', chat.id);
        return { data: null, error: membersError };
      }

      return { data: chat, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Busca chats do usuário atual
   */
  static async getUserChats(): Promise<{ data: ChatWithDetails[] | null; error: any }> {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return { data: null, error: 'Usuário não autenticado' };

      const { data, error } = await supabase
        .from('chat_members')
        .select(`
          chat_id,
          last_read_at,
          chats!inner (
            id,
            name,
            type,
            description,
            created_by,
            is_active,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', currentUser.id)
        .eq('chats.is_active', true);

      if (error) return { data: null, error };

      // Buscar detalhes adicionais para cada chat
      const chatsWithDetails: ChatWithDetails[] = [];

      for (const item of data || []) {
        const chat = item.chats as Chat;
        
        // Buscar membros
        const { data: members } = await supabase
          .from('chat_members')
          .select(`
            *,
            users!inner (
              id,
              name,
              avatar_url,
              sector
            )
          `)
          .eq('chat_id', chat.id);

        // Buscar última mensagem
        const { data: lastMessage } = await supabase
          .from('messages')
          .select(`
            *,
            users!inner (
              id,
              name,
              avatar_url
            )
          `)
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Contar mensagens não lidas
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chat.id)
          .gt('created_at', item.last_read_at);

        chatsWithDetails.push({
          ...chat,
          members: members?.map(m => ({
            ...m,
            user: m.users
          })) || [],
          last_message: lastMessage ? {
            ...lastMessage,
            sender: lastMessage.users
          } : undefined,
          unread_count: unreadCount || 0
        });
      }

      return { data: chatsWithDetails, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Busca mensagens de um chat
   */
  static async getChatMessages(
    chatId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ data: Message[] | null; error: any }> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        users!inner (
          id,
          name,
          avatar_url
        ),
        reply_message:messages!reply_to (
          id,
          content,
          sender_id,
          users!inner (
            id,
            name
          )
        )
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return { data: null, error };

    const messages: Message[] = data?.map(msg => ({
      ...msg,
      sender: msg.users,
      reply_message: msg.reply_message ? {
        ...msg.reply_message,
        sender: msg.reply_message.users
      } : undefined
    })).reverse() || [];

    return { data: messages, error: null };
  }

  /**
   * Envia uma mensagem
   */
  static async sendMessage(
    chatId: string,
    content: string,
    messageType: Message['message_type'] = 'text',
    replyTo?: string
  ): Promise<{ data: Message | null; error: any }> {
    const currentUser = (await supabase.auth.getUser()).data.user;
    if (!currentUser) return { data: null, error: 'Usuário não autenticado' };

    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: currentUser.id,
        content,
        message_type: messageType,
        reply_to: replyTo
      })
      .select(`
        *,
        users!inner (
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (error) return { data: null, error };

    const message: Message = {
      ...data,
      sender: data.users
    };

    return { data: message, error: null };
  }

  /**
   * Marca mensagens como lidas
   */
  static async markAsRead(chatId: string): Promise<{ error: any }> {
    const currentUser = (await supabase.auth.getUser()).data.user;
    if (!currentUser) return { error: 'Usuário não autenticado' };

    const { error } = await supabase
      .from('chat_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('chat_id', chatId)
      .eq('user_id', currentUser.id);

    return { error };
  }

  /**
   * Adiciona membro ao chat
   */
  static async addMember(
    chatId: string,
    userId: string,
    role: 'admin' | 'member' = 'member'
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from('chat_members')
      .insert({
        chat_id: chatId,
        user_id: userId,
        role
      });

    if (!error) {
      // Enviar mensagem de sistema
      await this.sendMessage(
        chatId,
        `Usuário adicionado ao chat`,
        'system'
      );
    }

    return { error };
  }

  /**
   * Remove membro do chat
   */
  static async removeMember(chatId: string, userId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('chat_members')
      .delete()
      .eq('chat_id', chatId)
      .eq('user_id', userId);

    return { error };
  }

  /**
   * Subscreve para receber mensagens em tempo real
   */
  static subscribeToChat(
    chatId: string,
    onMessage: (message: Message) => void,
    onMemberUpdate?: (member: ChatMember) => void
  ): () => void {
    const channelName = `chat:${chatId}`;
    
    // Remover canal existente se houver
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
      this.channels.delete(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        async (payload) => {
          // Buscar dados completos da mensagem
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              users!inner (
                id,
                name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            onMessage({
              ...data,
              sender: data.users
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_members',
          filter: `chat_id=eq.${chatId}`
        },
        async (payload) => {
          if (onMemberUpdate) {
            const { data } = await supabase
              .from('chat_members')
              .select(`
                *,
                users!inner (
                  id,
                  name,
                  avatar_url,
                  sector
                )
              `)
              .eq('id', payload.new?.id || payload.old?.id)
              .single();

            if (data) {
              onMemberUpdate({
                ...data,
                user: data.users
              });
            }
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    // Retornar função de cleanup
    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  /**
   * Cria chat direto entre dois usuários
   */
  static async createDirectChat(otherUserId: string): Promise<{ data: Chat | null; error: any }> {
    const currentUser = (await supabase.auth.getUser()).data.user;
    if (!currentUser) return { data: null, error: 'Usuário não autenticado' };

    // Verificar se já existe chat direto entre os usuários
    const { data: existingChat } = await supabase
      .from('chats')
      .select(`
        *,
        chat_members!inner (user_id)
      `)
      .eq('type', 'direct')
      .eq('is_active', true);

    // Filtrar chats que têm exatamente os dois usuários
    const directChat = existingChat?.find(chat => {
      const memberIds = chat.chat_members.map((m: any) => m.user_id);
      return memberIds.length === 2 && 
             memberIds.includes(currentUser.id) && 
             memberIds.includes(otherUserId);
    });

    if (directChat) {
      return { data: directChat, error: null };
    }

    // Criar novo chat direto
    return await this.createChat('', 'direct', [otherUserId]);
  }

  /**
   * Cria chat de setor
   */
  static async createSectorChat(sector: string): Promise<{ data: Chat | null; error: any }> {
    // Buscar todos os usuários do setor
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('sector', sector)
      .eq('is_active', true);

    if (!users || users.length === 0) {
      return { data: null, error: 'Nenhum usuário encontrado no setor' };
    }

    const memberIds = users.map(u => u.id);
    return await this.createChat(`Chat ${sector}`, 'sector', memberIds, `Chat oficial do setor ${sector}`);
  }

  /**
   * Cria chat para uma tarefa específica
   */
  static async createTaskChat(taskId: string, taskTitle: string): Promise<{ data: Chat | null; error: any }> {
    // Buscar usuários relacionados à tarefa (criador e responsável)
    const { data: task } = await supabase
      .from('tasks')
      .select('assigned_to, created_by')
      .eq('id', taskId)
      .single();

    if (!task) return { data: null, error: 'Tarefa não encontrada' };

    const memberIds = [task.assigned_to, task.created_by].filter(Boolean);
    const uniqueMemberIds = [...new Set(memberIds)];

    return await this.createChat(
      `Tarefa: ${taskTitle}`,
      'task',
      uniqueMemberIds,
      `Chat para discussão da tarefa: ${taskTitle}`
    );
  }
}

// Hook para usar o serviço de chat
export const useChat = () => {
  const createChat = async (name: string, type: Chat['type'], memberIds: string[], description?: string) => {
    return await ChatService.createChat(name, type, memberIds, description);
  };

  const getUserChats = async () => {
    return await ChatService.getUserChats();
  };

  const getChatMessages = async (chatId: string, limit?: number, offset?: number) => {
    return await ChatService.getChatMessages(chatId, limit, offset);
  };

  const sendMessage = async (chatId: string, content: string, messageType?: Message['message_type'], replyTo?: string) => {
    return await ChatService.sendMessage(chatId, content, messageType, replyTo);
  };

  const markAsRead = async (chatId: string) => {
    return await ChatService.markAsRead(chatId);
  };

  const subscribeToChat = (chatId: string, onMessage: (message: Message) => void, onMemberUpdate?: (member: ChatMember) => void) => {
    return ChatService.subscribeToChat(chatId, onMessage, onMemberUpdate);
  };

  const createDirectChat = async (otherUserId: string) => {
    return await ChatService.createDirectChat(otherUserId);
  };

  const createSectorChat = async (sector: string) => {
    return await ChatService.createSectorChat(sector);
  };

  const createTaskChat = async (taskId: string, taskTitle: string) => {
    return await ChatService.createTaskChat(taskId, taskTitle);
  };

  return {
    createChat,
    getUserChats,
    getChatMessages,
    sendMessage,
    markAsRead,
    subscribeToChat,
    createDirectChat,
    createSectorChat,
    createTaskChat
  };
};