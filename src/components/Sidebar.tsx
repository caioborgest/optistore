
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Settings,
  LogOut,
  Building2,
  Users,
  Crown,
  Menu,
  X,
  Zap,
  Bell,
  Search,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserProfile } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationCenter } from './NotificationCenter';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNotifications } from '@/hooks/useNotifications';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';

interface SidebarProps {
  userProfile: UserProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ userProfile }) => {
  const { logout } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Menu items baseados no papel do usuário
  const getMenuItems = (isCompanyAdmin: boolean) => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: CheckSquare, label: 'Tarefas', path: '/tasks' },
      { icon: Calendar, label: 'Calendário', path: '/calendar' },
      { icon: MessageSquare, label: 'Chat', path: '/chat' },
    ];

    if (isCompanyAdmin) {
      return [
        ...baseItems,
        { icon: Users, label: 'Usuários', path: '/users' },
        { icon: BarChart3, label: 'Relatórios', path: '/reports' },
        { icon: Zap, label: 'Integrações', path: '/integrations' },
        { icon: Building2, label: 'Empresa', path: '/company' },
        { icon: Settings, label: 'Configurações', path: '/settings' },
      ];
    }

    return [
      ...baseItems,
      { icon: Settings, label: 'Configurações', path: '/settings' },
    ];
  };

  const menuItems = getMenuItems(userProfile.is_company_admin);

  const getRoleIcon = (isCompanyAdmin: boolean) => {
    if (isCompanyAdmin) {
      return <Crown className="h-3.5 w-3.5" />;
    }
    return <Users className="h-3.5 w-3.5" />;
  };

  const getRoleLabel = (isCompanyAdmin: boolean) => {
    if (isCompanyAdmin) {
      return 'Administrador';
    }
    return 'Usuário';
  };

  const getRoleColor = (isCompanyAdmin: boolean) => {
    if (isCompanyAdmin) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    return 'bg-green-50 text-green-700 border-green-200';
  };

  // Mobile toggle button
  const MobileToggle = () => (
    <Button
      variant="ghost"
      size="icon"
      className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-md"
      onClick={() => setIsOpen(!isOpen)}
    >
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  );

  const SidebarContent = () => (
    <>
      {/* Header with Logo */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 gradient-primary rounded-2xl shadow-elegant animate-pulse-glow">
              <Logo variant="icon" size="sm" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                <span className="text-primary">Opti</span>
                <span className="text-foreground">Flow</span>
              </h1>
              <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
            </div>
          </div>
          <div className="text-muted-foreground">
            <NotificationCenter />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => isMobile && setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group animate-fade-in ${
                isActive
                  ? 'gradient-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`
            }
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'}`} />
                <span className="font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarImage src={userProfile.avatar_url} />
            <AvatarFallback className="gradient-primary text-primary-foreground font-semibold text-lg">
              {userProfile.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-card-foreground truncate">
              {userProfile.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {userProfile.email}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge className={`text-xs font-medium ${getRoleColor(userProfile.is_company_admin)}`} variant="outline">
            <span className="flex items-center gap-1.5">
              {getRoleIcon(userProfile.is_company_admin)}
              {getRoleLabel(userProfile.is_company_admin)}
            </span>
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors p-2 rounded-lg"
            onClick={logout}
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <MobileToggle />
        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
        {/* Mobile Sidebar */}
        <div className={cn(
          "fixed left-0 top-0 h-full w-80 bg-card shadow-2xl border-r border-border flex flex-col z-50 lg:hidden transition-transform duration-300 animate-slide-in",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <SidebarContent />
        </div>
      </>
    );
  }

  return (
    <div className="w-72 bg-card shadow-2xl border-r border-border flex flex-col">
      <SidebarContent />
    </div>
  );
};

export default Sidebar;
