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
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Dot
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserProfile } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

interface ModernSidebarProps {
  userProfile: UserProfile;
}

export const ModernSidebar: React.FC<ModernSidebarProps> = ({ userProfile }) => {
  const { logout } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Fechar sidebar no mobile quando navegar
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Menu items baseados no papel do usuário
  const getMenuItems = (isCompanyAdmin: boolean, role?: string) => {
    const baseItems = [
      { 
        icon: LayoutDashboard, 
        label: 'Dashboard', 
        path: '/dashboard',
        badge: null,
        gradient: 'from-blue-500 to-blue-600'
      },
      { 
        icon: CheckSquare, 
        label: 'Tarefas', 
        path: '/tasks',
        badge: null,
        gradient: 'from-green-500 to-green-600'
      },
      { 
        icon: Calendar, 
        label: 'Calendário', 
        path: '/calendar',
        badge: null,
        gradient: 'from-purple-500 to-purple-600'
      },
      { 
        icon: MessageSquare, 
        label: 'Chat', 
        path: '/chat',
        badge: unreadCount > 0 ? unreadCount : null,
        gradient: 'from-pink-500 to-pink-600'
      },
    ];

    if (isCompanyAdmin || role === 'gerente') {
      return [
        ...baseItems,
        { 
          icon: Users, 
          label: 'Usuários', 
          path: '/users',
          badge: null,
          gradient: 'from-indigo-500 to-indigo-600'
        },
        { 
          icon: BarChart3, 
          label: 'Relatórios', 
          path: '/reports',
          badge: null,
          gradient: 'from-orange-500 to-orange-600'
        },
        { 
          icon: Zap, 
          label: 'Integrações', 
          path: '/integrations',
          badge: null,
          gradient: 'from-yellow-500 to-yellow-600'
        },
        { 
          icon: Building2, 
          label: 'Empresa', 
          path: '/company',
          badge: null,
          gradient: 'from-gray-500 to-gray-600'
        },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems(userProfile.is_company_admin, userProfile.role);

  const getRoleInfo = (isCompanyAdmin: boolean, role?: string) => {
    if (isCompanyAdmin) {
      return {
        label: 'Administrador',
        icon: Crown,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    }
    
    const roleMap = {
      gerente: {
        label: 'Gerente',
        icon: Crown,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      supervisor: {
        label: 'Supervisor',
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      colaborador: {
        label: 'Colaborador',
        icon: Users,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      }
    };

    return roleMap[role as keyof typeof roleMap] || {
      label: 'Usuário',
      icon: Users,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    };
  };

  const roleInfo = getRoleInfo(userProfile.is_company_admin, userProfile.role);

  // Mobile toggle button
  const MobileToggle = () => (
    <Button
      variant="ghost"
      size="icon"
      className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover-lift"
      onClick={() => setIsOpen(!isOpen)}
    >
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  );

  // Desktop collapse toggle
  const CollapseToggle = () => (
    <Button
      variant="ghost"
      size="icon"
      className="hidden lg:flex absolute -right-3 top-6 bg-white shadow-md hover:shadow-lg rounded-full border transition-all duration-300 hover-lift z-10"
      onClick={() => setIsCollapsed(!isCollapsed)}
    >
      {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
    </Button>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header with Logo */}
      <div className={cn(
        "p-6 border-b border-gray-100 relative",
        isCollapsed && "px-4"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="animate-slide-right">
              <Logo variant="text" size="sm" />
            </div>
          )}
        </div>
        <CollapseToggle />
      </div>

      {/* User Profile */}
      <div className={cn(
        "p-4 border-b border-gray-100",
        isCollapsed && "px-2"
      )}>
        <div 
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 cursor-pointer hover-lift",
            showUserMenu && "bg-gray-50"
          )}
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <div className="relative">
            <Avatar className="w-10 h-10 border-2 border-white shadow-md">
              <AvatarImage src={userProfile.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {userProfile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 truncate">{userProfile.name}</p>
                  <div className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                    roleInfo.color,
                    roleInfo.bgColor,
                    roleInfo.borderColor
                  )}>
                    <roleInfo.icon className="h-3 w-3" />
                    {roleInfo.label}
                  </div>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-gray-400 transition-transform duration-300",
                  showUserMenu && "rotate-180"
                )} />
              </div>
            </div>
          )}
        </div>

        {/* User Menu Dropdown */}
        {showUserMenu && !isCollapsed && (
          <div className="mt-2 p-2 bg-white rounded-lg shadow-lg border animate-fade-scale">
            <div className="space-y-1">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <Settings className="h-4 w-4" />
                Configurações
              </button>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 custom-scrollbar overflow-y-auto">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const IconComponent = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                isActive 
                  ? "bg-gradient-to-r text-white shadow-lg hover-lift" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover-lift",
                isCollapsed && "justify-center px-2",
                `animate-slide-right`
              )}
              style={{
                background: isActive ? `linear-gradient(135deg, rgb(${item.gradient.includes('blue') ? '59 130 246' : item.gradient.includes('green') ? '34 197 94' : item.gradient.includes('purple') ? '147 51 234' : item.gradient.includes('pink') ? '236 72 153' : item.gradient.includes('indigo') ? '99 102 241' : item.gradient.includes('orange') ? '249 115 22' : item.gradient.includes('yellow') ? '245 158 11' : '107 114 128'}) 0%, rgb(${item.gradient.includes('blue') ? '37 99 235' : item.gradient.includes('green') ? '22 163 74' : item.gradient.includes('purple') ? '126 34 206' : item.gradient.includes('pink') ? '219 39 119' : item.gradient.includes('indigo') ? '79 70 229' : item.gradient.includes('orange') ? '234 88 12' : item.gradient.includes('yellow') ? '217 119 6' : '75 85 99'}) 100%)` : undefined,
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Hover effect background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="relative flex items-center gap-3 w-full">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                  isActive ? "bg-white/20" : "group-hover:bg-gray-100"
                )}>
                  <IconComponent className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                  )} />
                </div>
                
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge 
                        variant={isActive ? "secondary" : "default"}
                        className={cn(
                          "text-xs animate-bounce",
                          isActive ? "bg-white/20 text-white" : "bg-red-500 text-white"
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn(
        "p-4 border-t border-gray-100",
        isCollapsed && "px-2"
      )}>
        {!isCollapsed && (
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">OptiFlow VAREJO v1.0.0</p>
            <div className="flex items-center justify-center gap-2">
              <Dot className="h-3 w-3 text-green-500 animate-pulse" />
              <span className="text-xs text-gray-500">Sistema Online</span>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <MobileToggle />
        {/* Mobile Sidebar Overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl animate-slide-right">
              <SidebarContent />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={cn(
      "hidden lg:flex flex-col bg-white border-r border-gray-100 shadow-lg transition-all duration-300 relative",
      isCollapsed ? "w-20" : "w-80"
    )}>
      <SidebarContent />
    </div>
  );
};