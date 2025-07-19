import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  MessageSquare,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Award,
  Bell
} from 'lucide-react';
import { useAuthService, UserProfile } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  sectorPerformance?: {
    sector: string;
    completed: number;
    total: number;
    rate: number;
  }[];
  recentActivity: {
    id: string;
    type: 'task_completed' | 'task_assigned' | 'message' | 'user_joined';
    title: string;
    description: string;
    timestamp: string;
    user?: {
      name: string;
      avatar_url?: string;
    };
  }[];
}

interface RoleDashboardProps {
  userProfile: UserProfile;
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({ userProfile }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, [userProfile]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      // Aqui você faria as chamadas para buscar os dados específicos do dashboard
      // Por enquanto, vamos usar dados mock
      const mockStats: DashboardStats = {
        totalTasks: userProfile.role === 'gerente' ? 150 : userProfile.role === 'supervisor' ? 45 : 12,
        completedTasks: userProfile.role === 'gerente' ? 120 : userProfile.role === 'supervisor' ? 35 : 8,
        pendingTasks: userProfile.role === 'gerente' ? 25 : userProfile.role === 'supervisor' ? 8 : 3,
        overdueTasks: userProfile.role === 'gerente' ? 5 : userProfile.role === 'supervisor' ? 2 : 1,
        completionRate: userProfile.role === 'gerente' ? 80 : userProfile.role === 'supervisor' ? 78 : 67,
        sectorPerformance: userProfile.role === 'gerente' ? [
          { sector: 'Vendas', completed: 25, total: 30, rate: 83 },
          { sector: 'Estoque', completed: 18, total: 25, rate: 72 },
          { sector: 'Limpeza', completed: 15, total: 20, rate: 75 },
          { sector: 'Entregas', completed: 12, total: 15, rate: 80 }
        ] : undefined,
        recentActivity: [
          {
            id: '1',
            type: 'task_completed',
            title: 'Tarefa concluída',
            description: 'Organização do setor de tintas finalizada',
            timestamp: '2024-01-15T14:30:00Z',
            user: { name: 'João Silva', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' }
          },
          {
            id: '2',
            type: 'task_assigned',
            title: 'Nova tarefa atribuída',
            description: 'Conferir estoque de cimento Portland',
            timestamp: '2024-01-15T13:45:00Z',
            user: { name: 'Maria Santos', avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b608?w=40&h=40&fit=crop&crop=face' }
          },
          {
            id: '3',
            type: 'message',
            title: 'Nova mensagem',
            description: 'Mensagem no chat da equipe de vendas',
            timestamp: '2024-01-15T12:20:00Z',
            user: { name: 'Ana Lima', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' }
          }
        ]
      };

      setStats(mockStats);
    } catch (error) {
      toast({
        title: 'Erro ao carregar dashboard',
        description: 'Não foi possível carregar os dados do dashboard',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'task_assigned': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'message': return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'user_joined': return <Users className="h-4 w-4 text-orange-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header personalizado por papel */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {userProfile.role === 'gerente' && 'Dashboard Gerencial'}
            {userProfile.role === 'supervisor' && `Dashboard - ${userProfile.sector}`}
            {userProfile.role === 'colaborador' && 'Minhas Atividades'}
          </h1>
          <p className="text-gray-600 mt-1">
            {userProfile.role === 'gerente' && 'Visão geral de toda a operação'}
            {userProfile.role === 'supervisor' && 'Acompanhe a performance do seu setor'}
            {userProfile.role === 'colaborador' && 'Suas tarefas e atividades do dia'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={userProfile.avatar_url} />
            <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{userProfile.name}</p>
            <Badge variant="outline" className="text-xs">
              {userProfile.role === 'gerente' && 'Gerente'}
              {userProfile.role === 'supervisor' && 'Supervisor'}
              {userProfile.role === 'colaborador' && 'Colaborador'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Tarefas</p>
                <p className="text-2xl font-bold">{stats.totalTasks}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Atrasadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdueTasks}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {userProfile.role === 'gerente' ? 'Performance por Setor' : 'Sua Performance'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userProfile.role === 'gerente' && stats.sectorPerformance ? (
              <div className="space-y-4">
                {stats.sectorPerformance.map((sector) => (
                  <div key={sector.sector} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{sector.sector}</span>
                      <span className="text-sm text-gray-600">
                        {sector.completed}/{sector.total} ({sector.rate}%)
                      </span>
                    </div>
                    <Progress value={sector.rate} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {stats.completionRate}%
                  </div>
                  <p className="text-gray-600">Taxa de Conclusão</p>
                </div>
                <Progress value={stats.completionRate} className="h-3" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Meta: 75%</span>
                  <span className="flex items-center gap-1">
                    {stats.completionRate >= 75 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Acima da meta
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        Abaixo da meta
                      </>
                    )}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {activity.user && (
                        <>
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={activity.user.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {activity.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-500">
                            {activity.user.name}
                          </span>
                        </>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas baseadas no papel */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userProfile.role === 'gerente' && (
              <>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Gerenciar Usuários
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Relatórios
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Target className="h-6 w-6 mb-2" />
                  Nova Tarefa Global
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  Chat Geral
                </Button>
              </>
            )}

            {userProfile.role === 'supervisor' && (
              <>
                <Button variant="outline" className="h-20 flex-col">
                  <Target className="h-6 w-6 mb-2" />
                  Nova Tarefa
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Equipe do Setor
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Relatório Setorial
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  Chat do Setor
                </Button>
              </>
            )}

            {userProfile.role === 'colaborador' && (
              <>
                <Button variant="outline" className="h-20 flex-col">
                  <CheckCircle className="h-6 w-6 mb-2" />
                  Minhas Tarefas
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  Calendário
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  Mensagens
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Award className="h-6 w-6 mb-2" />
                  Meu Progresso
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};