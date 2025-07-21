
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
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                <span className="text-green-500">Opti</span>
                <span className="text-gray-800">Flow</span>
              </h1>
              <p className="text-xs text-gray-500">Sistema de Gestão</p>
            </div>
          </div>
          <div className="text-gray-600">
            <NotificationCenter />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => isMobile && setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                <span className="font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-10 w-10 ring-2 ring-gray-200">
            <AvatarImage src={userProfile.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
              {userProfile.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate text-sm">
              {userProfile.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {userProfile.email}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge className={`text-xs border ${getRoleColor(userProfile.is_company_admin)}`} variant="outline">
            <span className="flex items-center gap-1.5">
              {getRoleIcon(userProfile.is_company_admin)}
              {getRoleLabel(userProfile.is_company_admin)}
            </span>
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors p-2"
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
          "fixed left-0 top-0 h-full w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col z-50 lg:hidden transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <SidebarContent />
        </div>
      </>
    );
  }

  return (
    <div className="w-72 bg-white shadow-xl border-r border-gray-200 flex flex-col">
      <SidebarContent />
    </div>
  );
};

export default Sidebar;
