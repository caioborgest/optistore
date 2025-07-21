
import { useState, useEffect } from 'react';
import { Chat, Message } from '@/types/database';

export const useRealTimeChat = (chatId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock real-time functionality
  useEffect(() => {
    if (!chatId) return;

    // Simulate loading messages
    setLoading(true);
    
    const mockMessages: Message[] = [
      {
        id: '1',
        chat_id: chatId,
        sender_id: '1',
        content: 'Olá pessoal!',
        message_type: 'text',
        is_edited: false,
        is_deleted: false,
        created_at: new Date().toISOString()
      }
    ];

    setTimeout(() => {
      setMessages(mockMessages);
      setLoading(false);
    }, 500);
  }, [chatId]);

  const sendMessage = async (content: string, senderId: string) => {
    if (!chatId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      chat_id: chatId,
      sender_id: senderId,
      content,
      message_type: 'text',
      is_edited: false,
      is_deleted: false,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
  };

  return {
    messages,
    loading,
    sendMessage
  };
};
