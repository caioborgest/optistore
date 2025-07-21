import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { useNotifications } from '@/hooks/useNotifications';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  AlertTriangle,
  CheckCheck,
  Trash2,
  Loader2
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  // Versão simplificada para evitar erros
  const notifications: any[] = [];
  const unreadCount = 0;
  const loading = false;
  
  const markAsRead = (id: string) => {
    // Placeholder function
  };
  
  const markAllAsRead = () => {
    // Placeholder function
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          <span>Notificações</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="text-center py-8">
          <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Nenhuma notificação</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};