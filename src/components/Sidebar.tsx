
import React from 'react';
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
  Crown
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserProfile } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationCenter } from './NotificationCenter';

interface SidebarProps {
  userProfile: UserProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ userProfile }) => {
  const { logout } = useAuth();

  // Menu items baseados no papel do usuário
  const getMenuItems = (role: string, isCompanyAdmin: boolean) => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: CheckSquare, label: 'Tarefas', path: '/tasks' },
      { icon: Calendar, label: 'Calendário', path: '/calendar' },
      { icon: MessageSquare, label: 'Chat', path: '/chat' },
    ];

    if (role === 'gerente') {
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

    if (role === 'supervisor') {
      return [
        ...baseItems,
        { icon: BarChart3, label: 'Relatórios', path: '/reports' },
        { icon: Settings, label: 'Configurações', path: '/settings' },
      ];
    }

    // Colaborador
    return [
      ...baseItems,
      { icon: Settings, label: 'Configurações', path: '/settings' },
    ];
  };

  const menuItems = getMenuItems(userProfile.role, userProfile.is_company_admin);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'gerente':
        return <Crown className="h-4 w-4" />;
      case 'supervisor':
        return <Shield className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'gerente':
        return 'Gerente';
      case 'supervisor':
        return 'Supervisor';
      default:
        return 'Colaborador';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'gerente':
        return 'bg-purple-100 text-purple-800';
      case 'supervisor':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">OptiFlow</h1>
              <p className="text-sm text-gray-500">Material de Construção</p>
            </div>
          </div>
          <NotificationCenter />
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={userProfile.avatar_url} />
            <AvatarFallback>{userProfile.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{userProfile.name}</p>
            <p className="text-xs text-gray-500 truncate">{userProfile.sector}</p>
            <Badge className={`text-xs mt-1 ${getRoleColor(userProfile.role)}`}>
              <span className="flex items-center gap-1">
                {getRoleIcon(userProfile.role)}
                {getRoleLabel(userProfile.role)}
              </span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
