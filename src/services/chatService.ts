
import { supabase } from '@/integrations/supabase/client';
import { Chat, Message } from '@/types/database';

export const ChatService = {
  async getChats(): Promise<{ data?: Chat[]; error?: { message: string } }> {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('type', 'group')
        .order('created_at', { ascending: false });

      if (error) {
        return { error: { message: error.message } };
      }

      const chats: Chat[] = data?.map(chat => ({
        ...chat,
        type: chat.type as Chat['type'],
      })) || [];

      return { data: chats };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async getDirectChats(userId: string): Promise<{ data?: Chat[]; error?: { message: string } }> {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          chat_members!inner (
            user_id,
            users (name, email, avatar_url)
          )
        `)
        .eq('type', 'direct')
        .eq('chat_members.user_id', userId)
        .order('last_message_at', { ascending: false });

      if (error) {
        return { error: { message: error.message } };
      }

      const chats: Chat[] = data?.map(chat => ({
        ...chat,
        type: chat.type as Chat['type'],
      })) || [];

      return { data: chats };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async getGroupChats(userId: string): Promise<{ data?: Chat[]; error?: { message: string } }> {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          chat_members!inner (
            user_id,
            users (name, email, avatar_url)
          )
        `)
        .eq('type', 'group')
        .eq('chat_members.user_id', userId)
        .order('last_message_at', { ascending: false });

      if (error) {
        return { error: { message: error.message } };
      }

      const chats: Chat[] = data?.map(chat => ({
        ...chat,
        type: chat.type as Chat['type'],
      })) || [];

      return { data: chats };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async getMessages(chatId: string): Promise<{ data?: Message[]; error?: { message: string } }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(name, email, avatar_url)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        return { error: { message: error.message } };
      }

      const messages: Message[] = data?.map(msg => ({
        ...msg,
        message_type: msg.message_type as Message['message_type'],
        sender: msg.sender ? {
          name: msg.sender.name,
          email: msg.sender.email,
          avatar_url: msg.sender.avatar_url,
        } : undefined,
      })) || [];

      return { data: messages };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async sendMessage(chatId: string, content: string, userId: string): Promise<{ data?: Message; error?: { message: string } }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          sender_id: userId,
          content,
          message_type: 'text',
        }])
        .select(`
          *,
          sender:users!messages_sender_id_fkey(name, email, avatar_url)
        `)
        .single();

      if (error) {
        return { error: { message: error.message } };
      }

      // Update chat last message time
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chatId);

      const message: Message = {
        ...data,
        message_type: data.message_type as Message['message_type'],
        sender: data.sender ? {
          name: data.sender.name,
          email: data.sender.email,
          avatar_url: data.sender.avatar_url,
        } : undefined,
      };

      return { data: message };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async createChat(name: string, type: Chat['type'], memberIds: string[]): Promise<{ data?: Chat; error?: { message: string } }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return { error: { message: 'Usuário não autenticado' } };
      }

      const { data, error } = await supabase
        .from('chats')
        .insert([{
          name,
          type,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) {
        return { error: { message: error.message } };
      }

      // Add creator as admin
      await supabase
        .from('chat_members')
        .insert([{
          chat_id: data.id,
          user_id: user.id,
          role: 'admin',
        }]);

      return { data: data as Chat };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async addMemberToChat(chatId: string, userId: string): Promise<{ error?: { message: string } }> {
    try {
      const { error } = await supabase
        .from('chat_members')
        .insert([{
          chat_id: chatId,
          user_id: userId,
          role: 'member',
        }]);

      if (error) {
        return { error: { message: error.message } };
      }

      return {};
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async removeMemberFromChat(chatId: string, userId: string): Promise<{ error?: { message: string } }> {
    try {
      const { error } = await supabase
        .from('chat_members')
        .delete()
        .eq('chat_id', chatId)
        .eq('user_id', userId);

      if (error) {
        return { error: { message: error.message } };
      }

      return {};
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },
};
