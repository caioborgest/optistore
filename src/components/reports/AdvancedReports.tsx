import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Users,
  Target,
  Clock,
  Award,
  AlertTriangle
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReportsService, ProductivityMetrics, SectorComparison, UserPerformance } from '@/services/reportsService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface DateRange {
  from: Date;
  to: Date;
}

export const AdvancedReports: React.FC = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<ProductivityMetrics | null>(null);
  const [sectorComparison, setSectorComparison] = useState<SectorComparison[]>([]);
  const [userPerformance, setUserPerformance] = useState<UserPerformance[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);

  const sectors = ['Vendas', 'Estoque', 'Atendimento', 'Administração', 'Manutenção'];

  const loadReports = async () => {
    if (!dateRange.from || !dateRange.to) return;

    setLoading(true);
    try {
      const sector = selectedSector === 'all' ? undefined : selectedSector;

      // Carregar métricas de produtividade
      const { data: metricsData, error: metricsError } = await ReportsService.getProductivityMetrics(
        dateRange.from,
        dateRange.to,
        sector
      );

      if (metricsError) throw metricsError;
      setMetrics(metricsData || null);

      // Carregar comparativo de setores (apenas para gerentes)
      if (user?.role === 'gerente') {
        const { data: sectorData, error: sectorError } = await ReportsService.getSectorComparison(
          dateRange.from,
          dateRange.to
        );

        if (sectorError) throw sectorError;
        setSectorComparison(sectorData || []);
      }

      // Carregar performance dos usuários
      const { data: performanceData, error: performanceError } = await ReportsService.getUserPerformance(
        dateRange.from,
        dateRange.to,
        sector
      );

      if (performanceError) throw performanceError;
      setUserPerformance(performanceData || []);

      // Carregar dados de série temporal
      const { data: timeData, error: timeError } = await ReportsService.getTimeSeriesData(
        dateRange.from,
        dateRange.to,
        sector
      );

      if (timeError) throw timeError;
      setTimeSeriesData(timeData || []);

    } catch (error: any) {
      toast({
        title: 'Erro ao carregar relatórios',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [dateRange, selectedSector]);

  const handleExportCSV = async (data: any[], filename: string) => {
    const { success, error } = await ReportsService.exportToCSV(data, filename);
    
    if (success) {
      toast({
        title: 'Exportação concluída',
        description: `Arquivo ${filename}.csv baixado com sucesso`,
      });
    } else {
      toast({
        title: 'Erro na exportação',
        description: error,
        variant: 'destructive',
      });
    }
  };

  const handleExportPDF = async () => {
    if (!metrics || !sectorComparison) return;

    const filename = `relatorio-produtividade-${format(new Date(), 'yyyy-MM-dd')}`;
    const { success, error } = await ReportsService.exportToPDF(metrics, sectorComparison, filename);
    
    if (success) {
      toast({
        title: 'Relatório PDF gerado',
        description: 'Download iniciado automaticamente',
      });
    } else {
      toast({
        title: 'Erro ao gerar PDF',
        description: error,
        variant: 'destructive',
      });
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const renderMetricsOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics?.totalTasks || 0}</div>
          <p className="text-xs text-muted-foreground">
            {metrics?.completedTasks || 0} concluídas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics?.completionRate.toFixed(1) || 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            do período selecionado
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics?.averageCompletionTime.toFixed(1) || 0}h
          </div>
          <p className="text-xs text-muted-foreground">
            para conclusão
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tarefas Atrasadas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {metrics?.overdueTasks || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            requerem atenção
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderProductivityChart = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Produtividade ao Longo do Tempo</CardTitle>
        <CardDescription>
          Acompanhe a evolução das tarefas criadas e concluídas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => format(new Date(value), 'dd/MM')}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy', { locale: ptBR })}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="created" 
              stackId="1" 
              stroke="#8884d8" 
              fill="#8884d8" 
              name="Criadas"
            />
            <Area 
              type="monotone" 
              dataKey="completed" 
              stackId="1" 
              stroke="#82ca9d" 
              fill="#82ca9d" 
              name="Concluídas"
            />
            <Area 
              type="monotone" 
              dataKey="overdue" 
              stackId="1" 
              stroke="#ff7c7c" 
              fill="#ff7c7c" 
              name="Atrasadas"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderSectorComparison = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Comparativo por Setor</CardTitle>
        <CardDescription>
          Performance e eficiência de cada setor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sectorComparison.map((sector, index) => (
            <div key={sector.sector} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <span className="font-medium">{sector.sector}</span>
                  {getTrendIcon(sector.trend)}
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="font-bold">{sector.totalTasks}</div>
                  <div className="text-muted-foreground">Tarefas</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">
                    {sector.completionRate.toFixed(1)}%
                  </div>
                  <div className="text-muted-foreground">Conclusão</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-600">
                    {sector.efficiency.toFixed(1)}%
                  </div>
                  <div className="text-muted-foreground">Eficiência</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">
                    {sector.averageHours.toFixed(1)}h
                  </div>
                  <div className="text-muted-foreground">Média</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderPriorityDistribution = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Distribuição por Prioridade</CardTitle>
        <CardDescription>
          Como as tarefas estão distribuídas por nível de prioridade
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: 'Baixa', value: metrics?.tasksByPriority.low || 0, color: '#00C49F' },
                { name: 'Média', value: metrics?.tasksByPriority.medium || 0, color: '#FFBB28' },
                { name: 'Alta', value: metrics?.tasksByPriority.high || 0, color: '#FF8042' },
                { name: 'Urgente', value: metrics?.tasksByPriority.urgent || 0, color: '#FF4444' },
              ]}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {[
                { name: 'Baixa', value: metrics?.tasksByPriority.low || 0, color: '#00C49F' },
                { name: 'Média', value: metrics?.tasksByPriority.medium || 0, color: '#FFBB28' },
                { name: 'Alta', value: metrics?.tasksByPriority.high || 0, color: '#FF8042' },
                { name: 'Urgente', value: metrics?.tasksByPriority.urgent || 0, color: '#FF4444' },
              ].map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderUserPerformance = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Performance Individual</CardTitle>
        <CardDescription>
          Ranking dos colaboradores por produtividade
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {userPerformance.slice(0, 10).map((user) => (
            <div key={user.userId} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant={user.rank <= 3 ? 'default' : 'outline'}>
                  #{user.rank}
                </Badge>
                <div>
                  <div className="font-medium">{user.userName}</div>
                  <div className="text-sm text-muted-foreground">{user.sector}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold">{user.tasksCompleted}</div>
                  <div className="text-muted-foreground">Concluídas</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">
                    {user.averageRating.toFixed(1)}%
                  </div>
                  <div className="text-muted-foreground">Taxa</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-600">
                    {user.efficiency.toFixed(1)}%
                  </div>
                  <div className="text-muted-foreground">Eficiência</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">
                    {user.hoursWorked.toFixed(1)}h
                  </div>
                  <div className="text-muted-foreground">Horas</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Controles de Filtro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Relatórios Avançados de Produtividade
          </CardTitle>
          <CardDescription>
            Análise detalhada da performance operacional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>

            {(user?.role === 'gerente' || user?.role === 'supervisor') && (
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecionar setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os setores</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCSV(userPerformance, 'performance-usuarios')}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={loading}
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando relatórios...</p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="productivity">Produtividade</TabsTrigger>
            {user?.role === 'gerente' && (
              <TabsTrigger value="sectors">Setores</TabsTrigger>
            )}
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {renderMetricsOverview()}
            {renderProductivityChart()}
            {renderPriorityDistribution()}
          </TabsContent>

          <TabsContent value="productivity" className="space-y-4">
            {renderProductivityChart()}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderPriorityDistribution()}
              <Card>
                <CardHeader>
                  <CardTitle>Tarefas por Setor</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics?.tasksBySector || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="sector" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" fill="#8884d8" name="Total" />
                      <Bar dataKey="completed" fill="#82ca9d" name="Concluídas" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {user?.role === 'gerente' && (
            <TabsContent value="sectors" className="space-y-4">
              {renderSectorComparison()}
            </TabsContent>
          )}

          <TabsContent value="performance" className="space-y-4">
            {renderUserPerformance()}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};