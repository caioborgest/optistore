
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Download, 
  Filter,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  AlertTriangle,
  FileText,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Reports = () => {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    totalUsers: 0,
    completionRate: 0,
    performanceData: [] as Array<{ name: string; completed: number; pending: number; sector: string }>,
    sectorData: [] as Array<{ name: string; tasks: number; completed: number; efficiency: number }>,
    taskTypeData: [] as Array<{ name: string; value: number; color: string }>
  });
  
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile) {
      loadReportData();
    }
  }, [period, userProfile]);

  const loadReportData = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);

      // Calcular período baseado na seleção
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default: // month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Buscar tarefas do período
      let tasksQuery = supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:users!assigned_to(name, sector)
        `)
        .gte('created_at', startDate.toISOString());

      // Filtrar por empresa se não for admin
      if (!userProfile.is_company_admin) {
        tasksQuery = tasksQuery.eq('assigned_to', userProfile.id);
      }

      const { data: tasks, error: tasksError } = await tasksQuery;

      if (tasksError) {
        console.error('Erro ao carregar tarefas:', tasksError);
        return;
      }

      // Calcular estatísticas básicas
      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
      const overdueTasks = tasks?.filter(t => t.status === 'overdue').length || 0;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Performance por usuário (apenas para admin)
      const performanceData: Array<{ name: string; completed: number; pending: number; sector: string }> = [];
      if (userProfile.is_company_admin && tasks) {
        const userStats = tasks.reduce((acc, task) => {
          const userName = task.assigned_user?.name || 'Usuário Desconhecido';
          const userSector = task.assigned_user?.sector || 'Geral';
          
          if (!acc[userName]) {
            acc[userName] = { name: userName, completed: 0, pending: 0, sector: userSector };
          }
          
          if (task.status === 'completed') {
            acc[userName].completed++;
          } else if (task.status === 'pending') {
            acc[userName].pending++;
          }
          
          return acc;
        }, {} as Record<string, { name: string; completed: number; pending: number; sector: string }>);

        performanceData.push(...Object.values(userStats).slice(0, 5));
      }

      // Performance por setor
      const sectorStats = tasks?.reduce((acc, task) => {
        const sector = task.sector || 'Geral';
        
        if (!acc[sector]) {
          acc[sector] = { name: sector, tasks: 0, completed: 0, efficiency: 0 };
        }
        
        acc[sector].tasks++;
        if (task.status === 'completed') {
          acc[sector].completed++;
        }
        
        return acc;
      }, {} as Record<string, { name: string; tasks: number; completed: number; efficiency: number }>) || {};

      const sectorData = Object.values(sectorStats).map(sector => ({
        ...sector,
        efficiency: sector.tasks > 0 ? Math.round((sector.completed / sector.tasks) * 100) : 0
      }));

      // Distribuição por setor para gráfico de pizza
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];
      const taskTypeData = sectorData.map((sector, index) => ({
        name: sector.name,
        value: sector.tasks,
        color: colors[index % colors.length]
      }));

      // Buscar total de usuários (apenas para admin)
      let totalUsers = 0;
      if (userProfile.is_company_admin) {
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', userProfile.company_id);
        totalUsers = count || 0;
      }

      setReportData({
        totalTasks,
        completedTasks,
        overdueTasks,
        totalUsers,
        completionRate,
        performanceData,
        sectorData,
        taskTypeData
      });

    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast({
        title: 'Erro ao carregar relatórios',
        description: 'Não foi possível carregar os dados dos relatórios',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios e Analytics</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe o desempenho e produtividade da equipe
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Período:</span>
            </div>
            <div className="flex gap-1">
              {['week', 'month', 'quarter', 'year'].map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                >
                  {p === 'week' ? 'Semana' :
                   p === 'month' ? 'Mês' :
                   p === 'quarter' ? 'Trimestre' : 'Ano'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Tarefas</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : reportData.totalTasks}
                </p>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <FileText className="h-3 w-3 mr-1" />
                  Período selecionado
                </p>
              </div>
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : `${reportData.completionRate}%`}
                </p>
                <p className={`text-sm flex items-center mt-1 ${
                  reportData.completionRate >= 75 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {reportData.completionRate >= 75 ? 'Acima da meta' : 'Abaixo da meta'}
                </p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tarefas Atrasadas</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : reportData.overdueTasks}
                </p>
                <p className={`text-sm flex items-center mt-1 ${
                  reportData.overdueTasks === 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {reportData.overdueTasks === 0 ? 'Nenhuma atrasada' : 'Requer atenção'}
                </p>
              </div>
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {userProfile?.is_company_admin ? 'Colaboradores Ativos' : 'Tarefas Concluídas'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    userProfile?.is_company_admin ? reportData.totalUsers : reportData.completedTasks
                  )}
                </p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  {userProfile?.is_company_admin ? 'Total da empresa' : 'Suas conquistas'}
                </p>
              </div>
              <Users className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance por Colaborador */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Colaborador</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : reportData.performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#3B82F6" name="Concluídas" />
                  <Bar dataKey="pending" fill="#F59E0B" name="Pendentes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum dado de performance disponível</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribuição por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Setor</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : reportData.taskTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.taskTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reportData.taskTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <BarChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum dado de setor disponível</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance por Setor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance por Setor</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : reportData.sectorData.length > 0 ? (
              <div className="space-y-4">
                {reportData.sectorData.map((sector) => (
                  <div key={sector.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{sector.name}</h3>
                      <Badge variant={sector.efficiency >= 90 ? 'default' : 'secondary'}>
                        {sector.efficiency}% eficiência
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total de Tarefas</p>
                        <p className="font-semibold">{sector.tasks}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Concluídas</p>
                        <p className="font-semibold text-green-600">{sector.completed}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Pendentes</p>
                        <p className="font-semibold text-yellow-600">{sector.tasks - sector.completed}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${sector.efficiency}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <BarChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum dado de setor disponível</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>


    </div>
  );
};

export default Reports;
