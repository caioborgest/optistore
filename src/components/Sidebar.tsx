
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
        return <Crown className="h-3.5 w-3.5" />;
      case 'supervisor':
        return <Shield className="h-3.5 w-3.5" />;
      default:
        return <Users className="h-3.5 w-3.5" />;
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
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'supervisor':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  return (
    <div className="w-72 bg-sidebar shadow-xl border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border bg-gradient-to-r from-primary to-primary/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">OptiFlow</h1>
              <p className="text-sm text-white/80">Material de Construção</p>
            </div>
          </div>
          <div className="text-white">
            <NotificationCenter />
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-sidebar-border bg-sidebar-accent/30">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarImage src={userProfile.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {userProfile.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sidebar-foreground truncate text-base">
              {userProfile.name}
            </p>
            <p className="text-sm text-sidebar-foreground/70 truncate">
              {userProfile.sector}
            </p>
            <Badge className={`text-xs mt-2 border ${getRoleColor(userProfile.role)}`} variant="outline">
              <span className="flex items-center gap-1.5">
                {getRoleIcon(userProfile.role)}
                {getRoleLabel(userProfile.role)}
              </span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground'}`} />
                <span className="font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/20">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/80 hover:text-red-600 hover:bg-red-50 transition-colors"
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
