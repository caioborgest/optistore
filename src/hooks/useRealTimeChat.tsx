import { useState, useEffect, useCallback, useRef } from 'react';
import { useChat, Message, ChatWithDetails } from '@/services/chatService';
import { useToast } from '@/hooks/use-toast';

interface UseRealTimeChatProps {
  chatId?: string;
  autoMarkAsRead?: boolean;
}

interface UseRealTimeChatReturn {
  // Estado
  messages: Message[];
  chats: ChatWithDetails[];
  currentChat: ChatWithDetails | null;
  isLoading: boolean;
  isConnected: boolean;
  
  // Ações
  sendMessage: (content: string, messageType?: Message['message_type'], replyTo?: string) => Promise<void>;
  selectChat: (chatId: string) => void;
  markAsRead: (chatId?: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  refreshChats: () => Promise<void>;
  
  // Estado da UI
  typingUsers: string[];
  unreadCount: number;
}

export const useRealTimeChat = ({ 
  chatId, 
  autoMarkAsRead = true 
}: UseRealTimeChatProps = {}): UseRealTimeChatReturn => {
  const { toast } = useToast();
  const {
    getUserChats,
    getChatMessages,
    sendMessage: sendChatMessage,
    markAsRead: markChatAsRead,
    subscribeToChat
  } = useChat();

  // Estado
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<ChatWithDetails[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [messageOffset, setMessageOffset] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  // Refs
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastReadMessageRef = useRef<string | null>(null);

  // Carregar chats do usuário
  const loadChats = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await getUserChats();
      
      if (error) {
        toast({
          title: 'Erro ao carregar chats',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      if (data) {
        setChats(data);
        
        // Se há um chatId específico, selecionar automaticamente
        if (chatId) {
          const targetChat = data.find(chat => chat.id === chatId);
          if (targetChat) {
            setCurrentChat(targetChat);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [chatId, getUserChats, toast]);

  // Carregar mensagens de um chat
  const loadMessages = useCallback(async (targetChatId: string, offset = 0) => {
    try {
      const { data, error } = await getChatMessages(targetChatId, 50, offset);
      
      if (error) {
        toast({
          title: 'Erro ao carregar mensagens',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      if (data) {
        if (offset === 0) {
          setMessages(data);
          setMessageOffset(data.length);
        } else {
          setMessages(prev => [...data, ...prev]);
          setMessageOffset(prev => prev + data.length);
        }
        
        setHasMoreMessages(data.length === 50);
        
        // Auto scroll para a última mensagem (apenas no carregamento inicial)
        if (offset === 0) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  }, [getChatMessages, toast]);

  // Selecionar chat
  const selectChat = useCallback(async (targetChatId: string) => {
    const targetChat = chats.find(chat => chat.id === targetChatId);
    if (!targetChat) return;

    // Limpar subscrição anterior
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    setCurrentChat(targetChat);
    setMessages([]);
    setMessageOffset(0);
    
    // Carregar mensagens
    await loadMessages(targetChatId);
    
    // Marcar como lido se habilitado
    if (autoMarkAsRead) {
      await markChatAsRead(targetChatId);
    }

    // Subscrever para novas mensagens
    const unsubscribe = subscribeToChat(
      targetChatId,
      (newMessage) => {
        setMessages(prev => {
          // Evitar duplicatas
          if (prev.some(msg => msg.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });

        // Auto scroll para nova mensagem
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        // Marcar como lido automaticamente se o chat está ativo
        if (autoMarkAsRead && targetChatId === newMessage.chat_id) {
          markChatAsRead(targetChatId);
        }

        // Atualizar contador de não lidas nos chats
        setChats(prev => prev.map(chat => {
          if (chat.id === newMessage.chat_id) {
            return {
              ...chat,
              last_message: newMessage,
              unread_count: autoMarkAsRead && chat.id === targetChatId ? 0 : chat.unread_count + 1
            };
          }
          return chat;
        }));
      },
      (member) => {
        // Atualizar informações do membro se necessário
        console.log('Membro atualizado:', member);
      }
    );

    unsubscribeRef.current = unsubscribe;
    setIsConnected(true);
  }, [chats, loadMessages, autoMarkAsRead, markChatAsRead, subscribeToChat]);

  // Enviar mensagem
  const sendMessage = useCallback(async (
    content: string, 
    messageType: Message['message_type'] = 'text',
    replyTo?: string
  ) => {
    if (!currentChat || !content.trim()) return;

    try {
      const { data, error } = await sendChatMessage(currentChat.id, content, messageType, replyTo);
      
      if (error) {
        toast({
          title: 'Erro ao enviar mensagem',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      // A mensagem será adicionada automaticamente via subscription
      // Mas podemos adicionar otimisticamente para melhor UX
      if (data) {
        setMessages(prev => {
          if (prev.some(msg => msg.id === data.id)) {
            return prev;
          }
          return [...prev, data];
        });
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: 'Erro inesperado',
        description: 'Não foi possível enviar a mensagem',
        variant: 'destructive'
      });
    }
  }, [currentChat, sendChatMessage, toast]);

  // Marcar como lido
  const markAsRead = useCallback(async (targetChatId?: string) => {
    const chatToMark = targetChatId || currentChat?.id;
    if (!chatToMark) return;

    try {
      const { error } = await markChatAsRead(chatToMark);
      
      if (!error) {
        // Atualizar contador local
        setChats(prev => prev.map(chat => 
          chat.id === chatToMark 
            ? { ...chat, unread_count: 0 }
            : chat
        ));
      }
    } catch (error) {
      console.error('Erro ao marcar como lido:', error);
    }
  }, [currentChat, markChatAsRead]);

  // Carregar mais mensagens (paginação)
  const loadMoreMessages = useCallback(async () => {
    if (!currentChat || !hasMoreMessages || isLoading) return;

    setIsLoading(true);
    await loadMessages(currentChat.id, messageOffset);
    setIsLoading(false);
  }, [currentChat, hasMoreMessages, isLoading, loadMessages, messageOffset]);

  // Atualizar lista de chats
  const refreshChats = useCallback(async () => {
    await loadChats();
  }, [loadChats]);

  // Calcular total de mensagens não lidas
  const unreadCount = chats.reduce((total, chat) => total + chat.unread_count, 0);

  // Efeitos
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (chatId && chats.length > 0) {
      selectChat(chatId);
    }
  }, [chatId, chats, selectChat]);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Auto-scroll para mensagens não lidas
  useEffect(() => {
    if (messages.length > 0 && autoMarkAsRead && currentChat) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.id !== lastReadMessageRef.current) {
        lastReadMessageRef.current = lastMessage.id;
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [messages, autoMarkAsRead, currentChat]);

  return {
    // Estado
    messages,
    chats,
    currentChat,
    isLoading,
    isConnected,
    
    // Ações
    sendMessage,
    selectChat,
    markAsRead,
    loadMoreMessages,
    refreshChats,
    
    // Estado da UI
    typingUsers,
    unreadCount
  };
};

// Hook específico para notificações de chat
export const useChatNotifications = () => {
  const [notifications, setNotifications] = useState<Message[]>([]);
  const { toast } = useToast();

  const addNotification = useCallback((message: Message) => {
    setNotifications(prev => [...prev, message]);
    
    // Mostrar toast de notificação
    toast({
      title: `Nova mensagem de ${message.sender?.name}`,
      description: message.content.length > 50 
        ? `${message.content.substring(0, 50)}...` 
        : message.content,
    });
  }, [toast]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((messageId: string) => {
    setNotifications(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  return {
    notifications,
    addNotification,
    clearNotifications,
    removeNotification
  };
};