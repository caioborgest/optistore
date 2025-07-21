import { supabase } from '@/integrations/supabase/client';
import { Chat, Message } from '@/types/database';

export const ChatService = {
  async getChats() {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('is_active', true)
        .order('last_message_at', { ascending: false });

      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async getGroupChats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          chat_members!inner(user_id)
        `)
        .eq('chat_members.user_id', userId)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false });

      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async getMessages(chatId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(name, email, avatar_url)
        `)
        .eq('chat_id', chatId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async sendMessage(chatId: string, content: string, senderId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          sender_id: senderId,
          content: content,
          message_type: 'text'
        }])
        .select(`
          *,
          sender:users!sender_id(name, email, avatar_url)
        `)
        .single();

      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async createChat(name: string, type: 'direct' | 'group' | 'sector' | 'task', memberIds: string[] = []) {
    try {
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert([{
          name,
          type,
          is_active: true
        }])
        .select()
        .single();

      if (chatError) {
        return { data: null, error: chatError };
      }

      // Adicionar membros ao chat se fornecidos
      if (memberIds.length > 0) {
        const members = memberIds.map(userId => ({
          chat_id: chatData.id,
          user_id: userId,
          role: 'member' as const
        }));

        const { error: membersError } = await supabase
          .from('chat_members')
          .insert(members);

        if (membersError) {
          // Se falhar ao adicionar membros, remover o chat criado
          await supabase.from('chats').delete().eq('id', chatData.id);
          return { data: null, error: membersError };
        }
      }

      return { data: chatData, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async deleteMessage(messageId: string) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', messageId);

      return { error };
    } catch (error: any) {
      return { error };
    }
  }
};