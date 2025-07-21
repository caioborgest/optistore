
import { supabase } from '@/integrations/supabase/client';
import { Chat, Message } from '@/types/database';

export class ChatService {
  /**
   * Buscar canais da empresa
   */
  static async getChannels(): Promise<{ channels: Chat[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('type', 'group')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      return { channels: data, error };
    } catch (error) {
      console.error('Erro ao buscar canais:', error);
      return { channels: null, error };
    }
  }

  /**
   * Buscar chats diretos do usuário
   */
  static async getDirectChats(userId: string): Promise<{ chats: Chat[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          chat_members(
            user_id,
            users(name, email)
          )
        `)
        .eq('type', 'direct')
        .eq('is_active', true)
        .eq('chat_members.user_id', userId)
        .order('last_message_at', { ascending: false });

      return { chats: data, error };
    } catch (error) {
      console.error('Erro ao buscar chats diretos:', error);
      return { chats: null, error };
    }
  }

  /**
   * Buscar chats de grupo do usuário
   */
  static async getGroupChats(userId: string): Promise<{ chats: Chat[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          chat_members(
            user_id,
            users(name, email)
          )
        `)
        .eq('type', 'group')
        .eq('is_active', true)
        .eq('chat_members.user_id', userId)
        .order('last_message_at', { ascending: false });

      return { chats: data, error };
    } catch (error) {
      console.error('Erro ao buscar chats de grupo:', error);
      return { chats: null, error };
    }
  }

  /**
   * Buscar mensagens de um chat
   */
  static async getChatMessages(chatId: string): Promise<{ messages: Message[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(name, email, avatar_url)
        `)
        .eq('chat_id', chatId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      return { messages: data, error };
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      return { messages: null, error };
    }
  }

  /**
   * Enviar mensagem
   */
  static async sendMessage(chatId: string, content: string, senderId: string): Promise<{ message: Message | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: senderId,
          content,
          message_type: 'text'
        })
        .select(`
          *,
          sender:users!messages_sender_id_fkey(name, email, avatar_url)
        `)
        .single();

      // Atualizar timestamp da última mensagem do chat
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chatId);

      return { message: data, error };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return { message: null, error };
    }
  }

  /**
   * Criar novo chat
   */
  static async createChat(name: string, type: 'direct' | 'group', members: string[]): Promise<{ chat: Chat | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { chat: null, error: { message: 'Usuário não autenticado' } };
      }

      // Criar o chat
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          name,
          type,
          created_by: user.id,
          is_active: true
        })
        .select()
        .single();

      if (chatError) {
        return { chat: null, error: chatError };
      }

      // Adicionar membros ao chat
      const membersToAdd = [...members, user.id];
      const { error: membersError } = await supabase
        .from('chat_members')
        .insert(
          membersToAdd.map(userId => ({
            chat_id: chat.id,
            user_id: userId,
            role: userId === user.id ? 'admin' : 'member'
          }))
        );

      if (membersError) {
        return { chat: null, error: membersError };
      }

      return { chat, error: null };
    } catch (error) {
      console.error('Erro ao criar chat:', error);
      return { chat: null, error };
    }
  }

  /**
   * Adicionar membro ao chat
   */
  static async addMemberToChat(chatId: string, userId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('chat_members')
        .insert({
          chat_id: chatId,
          user_id: userId,
          role: 'member'
        });

      return { error };
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      return { error };
    }
  }

  /**
   * Remover membro do chat
   */
  static async removeMemberFromChat(chatId: string, userId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('chat_members')
        .delete()
        .eq('chat_id', chatId)
        .eq('user_id', userId);

      return { error };
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      return { error };
    }
  }
}

export const useChat = () => {
  const getChannels = async () => {
    return await ChatService.getChannels();
  };

  const getDirectChats = async (userId: string) => {
    return await ChatService.getDirectChats(userId);
  };

  const getGroupChats = async (userId: string) => {
    return await ChatService.getGroupChats(userId);
  };

  const getChatMessages = async (chatId: string) => {
    return await ChatService.getChatMessages(chatId);
  };

  const sendMessage = async (chatId: string, content: string, senderId: string) => {
    return await ChatService.sendMessage(chatId, content, senderId);
  };

  const createChat = async (name: string, type: 'direct' | 'group', members: string[]) => {
    return await ChatService.createChat(name, type, members);
  };

  const addMemberToChat = async (chatId: string, userId: string) => {
    return await ChatService.addMemberToChat(chatId, userId);
  };

  const removeMemberFromChat = async (chatId: string, userId: string) => {
    return await ChatService.removeMemberFromChat(chatId, userId);
  };

  return {
    getChannels,
    getDirectChats,
    getGroupChats,
    getChatMessages,
    sendMessage,
    createChat,
    addMemberToChat,
    removeMemberFromChat
  };
};
