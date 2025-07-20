
// Mock chat service to replace the problematic chatService.ts
export interface Chat {
  id: string;
  name?: string;
  description?: string;
  type: 'direct' | 'group' | 'channel';
  created_by?: string;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id?: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  file_name?: string;
  reply_to?: string;
  is_edited: boolean;
  edited_at?: string;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
}

export class MockChatService {
  static async getChannels(): Promise<{ channels: Chat[] | null; error: any }> {
    // Mock channels data
    const mockChannels: Chat[] = [
      {
        id: '1',
        name: 'Geral',
        description: 'Canal geral da empresa',
        type: 'channel',
        created_by: '1',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return { channels: mockChannels, error: null };
  }

  static async getDirectChats(userId: string): Promise<{ chats: Chat[] | null; error: any }> {
    // Mock direct chats
    const mockChats: Chat[] = [];
    return { chats: mockChats, error: null };
  }

  static async getGroupChats(userId: string): Promise<{ chats: Chat[] | null; error: any }> {
    // Mock group chats
    const mockChats: Chat[] = [];
    return { chats: mockChats, error: null };
  }

  static async getChatMessages(chatId: string): Promise<{ messages: Message[] | null; error: any }> {
    // Mock messages
    const mockMessages: Message[] = [];
    return { messages: mockMessages, error: null };
  }

  static async sendMessage(chatId: string, content: string, senderId: string): Promise<{ message: Message | null; error: any }> {
    const mockMessage: Message = {
      id: Date.now().toString(),
      chat_id: chatId,
      sender_id: senderId,
      content,
      message_type: 'text',
      is_edited: false,
      is_deleted: false,
      created_at: new Date().toISOString()
    };

    return { message: mockMessage, error: null };
  }
}

export const useMockChatService = () => {
  const getChannels = async () => {
    return await MockChatService.getChannels();
  };

  const getDirectChats = async (userId: string) => {
    return await MockChatService.getDirectChats(userId);
  };

  const getGroupChats = async (userId: string) => {
    return await MockChatService.getGroupChats(userId);
  };

  const getChatMessages = async (chatId: string) => {
    return await MockChatService.getChatMessages(chatId);
  };

  const sendMessage = async (chatId: string, content: string, senderId: string) => {
    return await MockChatService.sendMessage(chatId, content, senderId);
  };

  return {
    getChannels,
    getDirectChats,
    getGroupChats,
    getChatMessages,
    sendMessage
  };
};
