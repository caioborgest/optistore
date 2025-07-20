
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckSquare, 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  AlertCircle,
  BarChart3,
  PlusCircle
} from 'lucide-react';
import { UserProfile } from '@/types/database';

interface RoleDashboardProps {
  userProfile: UserProfile;
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({ userProfile }) => {
  const getDashboardData = () => {
    if (userProfile.role === 'admin') {
      return {
        title: 'Dashboard Administrativo',
        cards: [
          { title: 'Total de Usuários', value: '24', icon: Users, color: 'text-blue-600' },
          { title: 'Tarefas Ativas', value: '156', icon: CheckSquare, color: 'text-green-600' },
          { title: 'Projetos', value: '8', icon: BarChart3, color: 'text-purple-600' },
          { title: 'Metas do Mês', value: '92%', icon: TrendingUp, color: 'text-orange-600' }
        ]
      };
    } else if (userProfile.role === 'manager') {
      return {
        title: 'Dashboard Gerencial',
        cards: [
          { title: 'Equipe', value: '12', icon: Users, color: 'text-blue-600' },
          { title: 'Tarefas Pendentes', value: '23', icon: Clock, color: 'text-yellow-600' },
          { title: 'Concluídas', value: '87', icon: CheckSquare, color: 'text-green-600' },
          { title: 'Atrasadas', value: '4', icon: AlertCircle, color: 'text-red-600' }
        ]
      };
    } else {
      return {
        title: 'Meu Dashboard',
        cards: [
          { title: 'Minhas Tarefas', value: '8', icon: CheckSquare, color: 'text-green-600' },
          { title: 'Pendentes', value: '3', icon: Clock, color: 'text-yellow-600' },
          { title: 'Concluídas', value: '5', icon: CheckSquare, color: 'text-green-600' },
          { title: 'Próximas', value: '2', icon: Calendar, color: 'text-blue-600' }
        ]
      };
    }
  };

  const dashboardData = getDashboardData();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{dashboardData.title}</h1>
          <p className="text-gray-600">Bem-vindo, {userProfile.name}!</p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.cards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <card.icon className={`h-12 w-12 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seção de atividades recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Tarefa criada: "Revisar relatório"</p>
                  <p className="text-sm text-gray-600">2 horas atrás</p>
                </div>
                <Badge variant="outline">Nova</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Tarefa concluída: "Atualizar sistema"</p>
                  <p className="text-sm text-gray-600">5 horas atrás</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Concluída</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Reunião agendada: "Planejamento"</p>
                  <p className="text-sm text-gray-600">1 dia atrás</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Agendada</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Finalizar apresentação</p>
                  <p className="text-sm text-gray-600">Vence em 2 dias</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Urgente</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Revisar documentos</p>
                  <p className="text-sm text-gray-600">Vence em 5 dias</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Normal</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Treinamento da equipe</p>
                  <p className="text-sm text-gray-600">Vence em 1 semana</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Baixa</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
