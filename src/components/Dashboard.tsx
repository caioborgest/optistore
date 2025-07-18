
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
  MessageSquare
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bom dia, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Aqui está o resumo das atividades da sua loja hoje
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Hoje</p>
          <p className="text-lg font-semibold text-gray-900">
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
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Tarefas Concluídas</p>
                <p className="text-3xl font-bold">{stats.completedTasks}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Pendentes</p>
                <p className="text-3xl font-bold">{stats.pendingTasks}</p>
              </div>
              <Clock className="h-12 w-12 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Atrasadas</p>
                <p className="text-3xl font-bold">{stats.overdueTasks}</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Performance</p>
                <p className="text-3xl font-bold">{stats.teamPerformance}%</p>
              </div>
              <TrendingUp className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-500">{task.sector} • {task.assignee}</p>
                  </div>
                  <Badge 
                    variant={
                      task.status === 'completed' ? 'default' :
                      task.status === 'overdue' ? 'destructive' :
                      task.status === 'in_progress' ? 'secondary' : 'outline'
                    }
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-500 w-12">
                    {item.time}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.task}</p>
                    <Badge 
                      variant={
                        item.priority === 'high' ? 'destructive' :
                        item.priority === 'medium' ? 'secondary' : 'outline'
                      }
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progresso Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Meta Mensal</span>
                <span>{stats.teamPerformance}% de {stats.monthlyGoal}%</span>
              </div>
              <Progress value={stats.teamPerformance} className="h-3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-600">Colaboradores Ativos</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">48</p>
                <p className="text-sm text-gray-600">Mensagens Hoje</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">156</p>
                <p className="text-sm text-gray-600">Tarefas este Mês</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
