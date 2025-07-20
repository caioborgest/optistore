
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  TrendingUp,
  Calendar,
  MessageSquare,
  Activity,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();

  // Mock data para demonstração
  const stats = {
    totalTasks: 45,
    completedTasks: 32,
    pendingTasks: 8,
    overdueTasks: 5,
    teamPerformance: 87,
    monthlyGoal: 75
  };

  const recentTasks = [
    { id: 1, title: 'Organizar setor de tintas', status: 'completed', sector: 'Tintas', assignee: 'João Silva' },
    { id: 2, title: 'Conferir estoque de cimento', status: 'pending', sector: 'Materiais', assignee: 'Maria Santos' },
    { id: 3, title: 'Limpeza área externa', status: 'overdue', sector: 'Limpeza', assignee: 'Pedro Costa' },
    { id: 4, title: 'Atualizar preços', status: 'in_progress', sector: 'Vendas', assignee: 'Ana Lima' },
  ];

  const upcomingTasks = [
    { time: '09:00', task: 'Reunião de equipe', priority: 'high' },
    { time: '10:30', task: 'Conferir entrega de materiais', priority: 'medium' },
    { time: '14:00', task: 'Treinamento novos funcionários', priority: 'high' },
    { time: '16:00', task: 'Relatório mensal', priority: 'low' },
  ];

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-background to-muted/20 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Bom dia, {user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Aqui está o resumo das atividades da sua loja hoje
          </p>
        </div>
        <div className="text-right glass-card p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Hoje</p>
          <p className="text-lg font-semibold text-foreground">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 gradient-primary text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-green-100 text-sm font-medium">Tarefas Concluídas</p>
                <p className="text-3xl font-bold">{stats.completedTasks}</p>
                <p className="text-xs text-green-100">+12% vs ontem</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500"></div>
          <CardContent className="p-6 relative text-white">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-amber-100 text-sm font-medium">Pendentes</p>
                <p className="text-3xl font-bold">{stats.pendingTasks}</p>
                <p className="text-xs text-amber-100">-5% vs ontem</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600"></div>
          <CardContent className="p-6 relative text-white">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-red-100 text-sm font-medium">Atrasadas</p>
                <p className="text-3xl font-bold">{stats.overdueTasks}</p>
                <p className="text-xs text-red-100">Atenção necessária</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600"></div>
          <CardContent className="p-6 relative text-white">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-blue-100 text-sm font-medium">Performance</p>
                <p className="text-3xl font-bold">{stats.teamPerformance}%</p>
                <p className="text-xs text-blue-100">+8% vs mês passado</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <Card className="lg:col-span-2 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-foreground">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">{task.sector} • {task.assignee}</p>
                  </div>
                  <Badge 
                    variant={
                      task.status === 'completed' ? 'default' :
                      task.status === 'overdue' ? 'destructive' :
                      task.status === 'in_progress' ? 'secondary' : 'outline'
                    }
                    className="font-medium"
                  >
                    {task.status === 'completed' ? 'Concluída' :
                     task.status === 'overdue' ? 'Atrasada' :
                     task.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-accent/50 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              Próximas Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full min-w-[3.5rem] text-center">
                    {item.time}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground">{item.task}</p>
                    <Badge 
                      variant={
                        item.priority === 'high' ? 'destructive' :
                        item.priority === 'medium' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {item.priority === 'high' ? 'Alta' :
                       item.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            Progresso Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Meta Mensal</span>
                <span className="text-muted-foreground">{stats.teamPerformance}% de {stats.monthlyGoal}%</span>
              </div>
              <Progress value={stats.teamPerformance} className="h-3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border border-border">
                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-foreground">12</p>
                <p className="text-sm text-muted-foreground mt-1">Colaboradores Ativos</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border border-border">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-foreground">48</p>
                <p className="text-sm text-muted-foreground mt-1">Mensagens Hoje</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border border-border">
                <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-foreground">156</p>
                <p className="text-sm text-muted-foreground mt-1">Tarefas este Mês</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
