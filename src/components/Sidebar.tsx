
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
  Shield,
  Crown,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserProfile } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationCenter } from './NotificationCenter';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface SidebarProps {
  userProfile: UserProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ userProfile }) => {
  const { logout } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Menu items baseados no papel do usuário
  const getMenuItems = (role: string, isCompanyAdmin: boolean) => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: CheckSquare, label: 'Tarefas', path: '/tasks' },
      { icon: Calendar, label: 'Calendário', path: '/calendar' },
      { icon: MessageSquare, label: 'Chat', path: '/chat' },
    ];

    if (role === 'admin') {
      const managerItems = [
        ...baseItems,
        { icon: Users, label: 'Usuários', path: '/users' },
        { icon: BarChart3, label: 'Relatórios', path: '/reports' },
        { icon: Settings, label: 'Configurações', path: '/settings' },
      ];

      if (isCompanyAdmin) {
        managerItems.push({ icon: Building2, label: 'Empresa', path: '/company' });
      }

      return managerItems;
    }

    if (role === 'manager') {
      return [
        ...baseItems,
        { icon: BarChart3, label: 'Relatórios', path: '/reports' },
        { icon: Settings, label: 'Configurações', path: '/settings' },
      ];
    }

    // Employee
    return [
      ...baseItems,
      { icon: Settings, label: 'Configurações', path: '/settings' },
    ];
  };

  const menuItems = getMenuItems(userProfile.role, userProfile.is_company_admin);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3.5 w-3.5" />;
      case 'manager':
        return <Shield className="h-3.5 w-3.5" />;
      default:
        return <Users className="h-3.5 w-3.5" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      default:
        return 'Funcionário';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-green-50 text-green-700 border-green-200';
    }
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
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-sidebar-border bg-gradient-to-r from-primary to-primary/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Building2 className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-white">OptiFlow</h1>
              <p className="text-xs lg:text-sm text-white/80">Sistema de Gestão</p>
            </div>
          </div>
          <div className="text-white">
            <NotificationCenter />
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 lg:p-6 border-b border-sidebar-border bg-sidebar-accent/30">
        <div className="flex items-center space-x-3 lg:space-x-4">
          <Avatar className="h-10 w-10 lg:h-12 lg:w-12 ring-2 ring-primary/20">
            <AvatarImage src={userProfile.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {userProfile.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sidebar-foreground truncate text-sm lg:text-base">
              {userProfile.name}
            </p>
            <p className="text-xs lg:text-sm text-sidebar-foreground/70 truncate">
              {userProfile.sector}
            </p>
            <Badge className={`text-xs mt-1 lg:mt-2 border ${getRoleColor(userProfile.role)}`} variant="outline">
              <span className="flex items-center gap-1.5">
                {getRoleIcon(userProfile.role)}
                {getRoleLabel(userProfile.role)}
              </span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => isMobile && setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-4 w-4 lg:h-5 lg:w-5 ${isActive ? 'text-white' : 'text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground'}`} />
                <span className="font-medium text-sm lg:text-base">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 lg:p-4 border-t border-sidebar-border bg-sidebar-accent/20">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/80 hover:text-red-600 hover:bg-red-50 transition-colors text-sm lg:text-base"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 lg:h-5 lg:w-5 mr-3" />
          Sair
        </Button>
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
          "fixed left-0 top-0 h-full w-80 bg-sidebar shadow-xl border-r border-sidebar-border flex flex-col z-50 lg:hidden transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <SidebarContent />
        </div>
      </>
    );
  }

  return (
    <div className="w-72 bg-sidebar shadow-xl border-r border-sidebar-border flex flex-col">
      <SidebarContent />
    </div>
  );
};

export default Sidebar;
