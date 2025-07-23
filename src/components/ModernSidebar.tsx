
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { NotificationCenter } from './NotificationCenter';
import { Logo } from '@/components/ui/logo';
import {
  Home,
  CheckSquare,
  Calendar,
  MessageCircle,
  BarChart3,
  Settings,
  Users,
  Building2,
  Zap,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { UserProfile } from '@/types/database';

interface ModernSidebarProps {
  userProfile: UserProfile;
}

export const ModernSidebar: React.FC<ModernSidebarProps> = ({ userProfile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      path: '/dashboard',
      roles: ['gerente', 'supervisor', 'colaborador']
    },
    { 
      icon: CheckSquare, 
      label: 'Tarefas', 
      path: '/tasks',
      roles: ['gerente', 'supervisor', 'colaborador']
    },
    { 
      icon: Calendar, 
      label: 'Calendário', 
      path: '/calendar',
      roles: ['gerente', 'supervisor', 'colaborador']
    },
    { 
      icon: MessageCircle, 
      label: 'Chat', 
      path: '/chat',
      roles: ['gerente', 'supervisor', 'colaborador']
    },
    { 
      icon: BarChart3, 
      label: 'Relatórios', 
      path: '/reports',
      roles: ['gerente', 'supervisor']
    },
    { 
      icon: Users, 
      label: 'Usuários', 
      path: '/users',
      roles: ['gerente']
    },
    { 
      icon: Building2, 
      label: 'Empresa', 
      path: '/company',
      roles: ['gerente']
    },
    { 
      icon: Zap, 
      label: 'Integrações', 
      path: '/integrations',
      roles: ['gerente']
    },
    { 
      icon: Settings, 
      label: 'Configurações', 
      path: '/settings',
      roles: ['gerente', 'supervisor', 'colaborador']
    }
  ];

  // Determinar papel do usuário
  const getUserRole = () => {
    if (userProfile?.is_company_admin) return 'gerente';
    return userProfile?.role || 'colaborador';
  };

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(getUserRole())
  );

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobile}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Logo variant="icon" size="sm" />
              <span className="font-bold text-gray-900">OptiFlow</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Avatar className="h-8 w-8">
              <AvatarImage src={userProfile?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {userProfile?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 bg-black/50" onClick={closeMobile} />
        )}

        {/* Mobile Sidebar */}
        <div className={cn(
          "fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Logo variant="icon" size="sm" />
                  <div>
                    <h1 className="font-bold text-xl text-gray-900">OptiFlow</h1>
                    <p className="text-sm text-gray-500">Sistema de Gestão</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={closeMobile} className="p-2">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* User Profile */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={userProfile?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {userProfile?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{userProfile?.name || 'Usuário'}</p>
                  <p className="text-sm text-gray-500">{getUserRole()}</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Online
                </Badge>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobile}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                      isActive 
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-all duration-200",
                      isActive ? "text-white" : "text-gray-500 group-hover:text-blue-600"
                    )} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl"
              >
                <LogOut className="h-5 w-5" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div 
      className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-xl transition-all duration-300 z-40 flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
      style={{ display: 'flex !important' }} // Garantir que seja exibido
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <Logo variant="icon" size="sm" />
              <div>
                <h1 className="font-bold text-xl text-gray-900">OptiFlow</h1>
                <p className="text-sm text-gray-500">Sistema de Gestão</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={userProfile?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {userProfile?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{userProfile?.name || 'Usuário'}</p>
              <p className="text-sm text-gray-500">{getUserRole()}</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Online
            </Badge>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                  : "text-gray-700 hover:bg-gray-100",
                isCollapsed && "justify-center"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-all duration-200",
                isActive ? "text-white" : "text-gray-500 group-hover:text-blue-600"
              )} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && "Sair"}
        </Button>
      </div>
    </div>
  );
};
