
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
import { useIsMobile } from '@/hooks/use-mobile';

interface RoleDashboardProps {
  userProfile: UserProfile;
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({ userProfile }) => {
  const isMobile = useIsMobile();

  const getDashboardData = () => {
    if (userProfile.is_company_admin) {
      return {
        title: 'Dashboard Administrativo',
        cards: [
          { title: 'Total de Usuários', value: '24', icon: Users, color: 'text-blue-600' },
          { title: 'Tarefas Ativas', value: '156', icon: CheckSquare, color: 'text-green-600' },
          { title: 'Projetos', value: '8', icon: BarChart3, color: 'text-purple-600' },
          { title: 'Metas do Mês', value: '92%', icon: TrendingUp, color: 'text-orange-600' }
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
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{dashboardData.title}</h1>
          <p className="text-gray-600 text-sm lg:text-base">Bem-vindo, {userProfile.name}!</p>
        </div>
        <Button className="flex items-center gap-2 w-full lg:w-auto">
          <PlusCircle className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {dashboardData.cards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-0">
                <div className="flex-1">
                  <p className="text-xs lg:text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-xl lg:text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <card.icon className={`h-8 w-8 lg:h-12 lg:w-12 ${card.color} self-end lg:self-auto`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seção de atividades recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3 lg:pb-4">
            <CardTitle className="text-lg lg:text-xl">Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm lg:text-base truncate">Tarefa criada: "Revisar relatório"</p>
                  <p className="text-xs lg:text-sm text-gray-600">2 horas atrás</p>
                </div>
                <Badge variant="outline" className="ml-2 text-xs">Nova</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm lg:text-base truncate">Tarefa concluída: "Atualizar sistema"</p>
                  <p className="text-xs lg:text-sm text-gray-600">5 horas atrás</p>
                </div>
                <Badge className="bg-green-100 text-green-800 ml-2 text-xs">Concluída</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm lg:text-base truncate">Reunião agendada: "Planejamento"</p>
                  <p className="text-xs lg:text-sm text-gray-600">1 dia atrás</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 ml-2 text-xs">Agendada</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3 lg:pb-4">
            <CardTitle className="text-lg lg:text-xl">Próximas Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm lg:text-base truncate">Finalizar apresentação</p>
                  <p className="text-xs lg:text-sm text-gray-600">Vence em 2 dias</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 ml-2 text-xs">Urgente</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm lg:text-base truncate">Revisar documentos</p>
                  <p className="text-xs lg:text-sm text-gray-600">Vence em 5 dias</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 ml-2 text-xs">Normal</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm lg:text-base truncate">Treinamento da equipe</p>
                  <p className="text-xs lg:text-sm text-gray-600">Vence em 1 semana</p>
                </div>
                <Badge className="bg-green-100 text-green-800 ml-2 text-xs">Baixa</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
