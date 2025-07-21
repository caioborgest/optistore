
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Plus, Users, MessageCircle, Hash } from 'lucide-react';
import { ChatService } from '@/services/chatService';
import { Chat as ChatType, Message } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Chat = () => {
  const [chats, setChats] = useState<ChatType[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateChatOpen, setIsCreateChatOpen] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatType, setNewChatType] = useState<'direct' | 'group'>('group');
  
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    try {
      setLoading(true);
      
      // Carregar canais/grupos
      const { channels, error: channelsError } = await ChatService.getChannels();
      if (channelsError) {
        console.error('Erro ao carregar canais:', channelsError);
      }
      
      // Carregar chats de grupo do usuário
      if (userProfile?.id) {
        const { chats: groupChats, error: groupError } = await ChatService.getGroupChats(userProfile.id);
        if (groupError) {
          console.error('Erro ao carregar chats de grupo:', groupError);
        }
        
        // Combinar canais e chats de grupo
        const allChats = [...(channels || []), ...(groupChats || [])];
        setChats(allChats);
        
        // Selecionar primeiro chat se disponível
        if (allChats.length > 0 && !selectedChat) {
          setSelectedChat(allChats[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
      toast({
        title: 'Erro ao carregar chats',
        description: 'Ocorreu um erro ao carregar os chats',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const { messages, error } = await ChatService.getChatMessages(chatId);
      
      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        return;
      }
      
      setMessages(messages || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  useEffect(() => {
    loadChats();
  }, [userProfile]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
      
      // Configurar listener para mensagens em tempo real
      const channel = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${selectedChat.id}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !userProfile?.id) return;

    try {
      const { message, error } = await ChatService.sendMessage(
        selectedChat.id,
        newMessage.trim(),
        userProfile.id
      );

      if (error) {
        toast({
          title: 'Erro ao enviar mensagem',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      setNewMessage('');
      // A mensagem será adicionada via realtime
    } catch (error) {
      toast({
        title: 'Erro ao enviar mensagem',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      });
    }
  };

  const handleCreateChat = async () => {
    if (!newChatName.trim()) return;

    try {
      const { chat, error } = await ChatService.createChat(
        newChatName.trim(),
        newChatType,
        [] // Por enquanto, criamos sem membros adicionais
      );

      if (error) {
        toast({
          title: 'Erro ao criar chat',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      setChats([chat, ...chats]);
      setNewChatName('');
      setIsCreateChatOpen(false);
      
      toast({
        title: 'Chat criado',
        description: 'Chat criado com sucesso'
      });
    } catch (error) {
      toast({
        title: 'Erro ao criar chat',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      });
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Sidebar - Lista de Chats */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Conversas</h2>
            
            <Dialog open={isCreateChatOpen} onOpenChange={setIsCreateChatOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Conversa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="chat-name">Nome da Conversa</Label>
                    <Input
                      id="chat-name"
                      value={newChatName}
                      onChange={(e) => setNewChatName(e.target.value)}
                      placeholder="Digite o nome da conversa"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="chat-type">Tipo</Label>
                    <Select value={newChatType} onValueChange={(value: 'direct' | 'group') => setNewChatType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="group">Grupo</SelectItem>
                        <SelectItem value="direct">Direto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleCreateChat} className="flex-1">
                      Criar
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateChatOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2">
            {chats.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma conversa encontrada</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chats.map((chat) => (
                  <Card
                    key={chat.id}
                    className={`cursor-pointer hover:bg-gray-100 transition-colors ${
                      selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={chat.avatar_url} />
                          <AvatarFallback>
                            {chat.type === 'group' ? <Hash className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">
                              {chat.name || 'Conversa sem nome'}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {chat.type === 'group' ? 'Grupo' : 'Direto'}
                            </Badge>
                          </div>
                          {chat.last_message_at && (
                            <p className="text-xs text-gray-500">
                              {formatMessageTime(chat.last_message_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Header da Conversa */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedChat.avatar_url} />
                  <AvatarFallback>
                    {selectedChat.type === 'group' ? <Hash className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedChat.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedChat.type === 'group' ? 'Grupo' : 'Conversa Direta'}
                  </p>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma mensagem ainda</p>
                    <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isCurrentUser = message.sender_id === userProfile?.id;
                    const showDate = index === 0 || 
                      formatMessageDate(message.created_at) !== formatMessageDate(messages[index - 1].created_at);
                    
                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="text-center my-4">
                            <Separator className="mb-2" />
                            <span className="text-xs text-gray-500 bg-white px-2">
                              {formatMessageDate(message.created_at)}
                            </span>
                          </div>
                        )}
                        
                        <div className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          {!isCurrentUser && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {message.sender?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-1' : 'order-2'}`}>
                            <div className={`rounded-lg p-3 ${
                              isCurrentUser 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              {!isCurrentUser && (
                                <p className="text-xs font-medium mb-1 opacity-75">
                                  {message.sender?.name || 'Usuário'}
                                </p>
                              )}
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <p className={`text-xs mt-1 ${
                              isCurrentUser ? 'text-right text-gray-500' : 'text-left text-gray-500'
                            }`}>
                              {formatMessageTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input de Mensagem */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
