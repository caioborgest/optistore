
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRealTimeChat } from '@/hooks/useRealTimeChat';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Search, 
  Plus,
  MessageSquare,
  Users,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Hash,
  Building,
  CheckCheck,
  Clock,
  Loader2
} from 'lucide-react';

const Chat = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    chats,
    currentChat,
    isLoading,
    isConnected,
    sendMessage: sendChatMessage,
    selectChat,
    markAsRead,
    refreshChats,
    unreadCount
  } = useRealTimeChat({ autoMarkAsRead: true });

  // Auto scroll para novas mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentChat) return;

    try {
      await sendChatMessage(newMessage);
      setNewMessage('');
    } catch (error) {
      toast({
        title: 'Erro ao enviar mensagem',
        description: 'Não foi possível enviar a mensagem',
        variant: 'destructive'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChatIcon = (type: string) => {
    switch (type) {
      case 'group':
        return <Users className="h-6 w-6 text-white" />;
      case 'sector':
        return <Building className="h-6 w-6 text-white" />;
      case 'task':
        return <Hash className="h-6 w-6 text-white" />;
      default:
        return <MessageSquare className="h-6 w-6 text-white" />;
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.members.some(member => 
      member.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-6 h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chat Interno</h1>
          <p className="text-gray-600 mt-1">
            Comunicação em tempo real com a equipe
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500">
                {unreadCount} não lidas
              </Badge>
            )}
          </p>
        </div>
        <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conversa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Conversa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Funcionalidade em desenvolvimento. Em breve você poderá criar novas conversas.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Lista de Chats */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle>Conversas</CardTitle>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Buscar conversas..." className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Carregando conversas...</p>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-4 text-center">
                <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Nenhuma conversa encontrada</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => selectChat(chat.id)}
                    className={`p-4 cursor-pointer border-b hover:bg-gray-50 transition-colors ${
                      currentChat?.id === chat.id ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {chat.type !== 'direct' ? (
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            {getChatIcon(chat.type)}
                          </div>
                        ) : (
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={chat.members[0]?.user?.avatar_url} />
                            <AvatarFallback>
                              {chat.members[0]?.user?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">
                            {chat.name || (chat.type === 'direct' ? chat.members[0]?.user?.name : 'Chat sem nome')}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {chat.last_message ? formatTime(chat.last_message.created_at) : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-600 truncate">
                            {chat.last_message?.content || 'Nenhuma mensagem'}
                          </p>
                          {chat.unread_count > 0 && (
                            <Badge className="bg-red-500 hover:bg-red-600 text-xs">
                              {chat.unread_count}
                            </Badge>
                          )}
                        </div>
                        {chat.type !== 'direct' && (
                          <p className="text-xs text-gray-500 mt-1">
                            {chat.members.length} membros
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Área de Mensagens */}
        <Card className="lg:col-span-2 flex flex-col">
          {currentChat ? (
            <>
              {/* Header do Chat */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {currentChat.type !== 'direct' ? (
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        {getChatIcon(currentChat.type)}
                      </div>
                    ) : (
                      <Avatar>
                        <AvatarImage src={currentChat.members[0]?.user?.avatar_url} />
                        <AvatarFallback>
                          {currentChat.members[0]?.user?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {currentChat.name || (currentChat.type === 'direct' ? currentChat.members[0]?.user?.name : 'Chat sem nome')}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {currentChat.type !== 'direct' 
                          ? `${currentChat.members.length} membros` 
                          : isConnected ? 'Online' : 'Offline'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {isConnected ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Conectado
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Desconectado
                        </>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Mensagens */}
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Nenhuma mensagem ainda</p>
                      <p className="text-xs text-gray-400">Seja o primeiro a enviar uma mensagem!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isCurrentUser = message.sender_id === userProfile?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={message.sender?.avatar_url} />
                            <AvatarFallback>
                              {message.sender?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`flex-1 max-w-xs lg:max-w-md ${isCurrentUser ? 'text-right' : ''}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {isCurrentUser ? 'Você' : message.sender?.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTime(message.created_at)}
                              </span>
                            </div>
                            <div
                              className={`p-3 rounded-lg ${
                                isCurrentUser
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              {message.content}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Input de Mensagem */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                    disabled={!isConnected}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !isConnected}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione uma conversa
                </h3>
                <p className="text-gray-500">
                  Escolha uma conversa da lista para começar a trocar mensagens
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Chat;
