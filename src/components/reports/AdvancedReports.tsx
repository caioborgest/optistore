
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  Download, 
  Filter, 
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  Activity,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Local DateRange type to avoid conflicts
interface LocalDateRange {
  from: Date;
  to: Date;
}

interface AdvancedReportsProps {
  className?: string;
}

export const AdvancedReports: React.FC<AdvancedReportsProps> = ({ className }) => {
  const [dateRange, setDateRange] = useState<LocalDateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  
  const [selectedMetric, setSelectedMetric] = useState('tasks');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedSector, setSelectedSector] = useState('all');
  
  // Mock data - será substituído pela integração real
  const taskData = [
    { name: 'Jan', completed: 45, pending: 12, overdue: 3 },
    { name: 'Fev', completed: 52, pending: 8, overdue: 2 },
    { name: 'Mar', completed: 48, pending: 15, overdue: 5 },
    { name: 'Abr', completed: 61, pending: 10, overdue: 1 },
    { name: 'Mai', completed: 55, pending: 18, overdue: 4 }
  ];

  const sectorData = [
    { name: 'Vendas', value: 35, color: '#3b82f6' },
    { name: 'Marketing', value: 28, color: '#10b981' },
    { name: 'TI', value: 25, color: '#f59e0b' },
    { name: 'RH', value: 12, color: '#ef4444' }
  ];

  const performanceData = [
    { name: 'Sem 1', efficiency: 85, quality: 92 },
    { name: 'Sem 2', efficiency: 88, quality: 89 },
    { name: 'Sem 3', efficiency: 92, quality: 95 },
    { name: 'Sem 4', efficiency: 89, quality: 91 }
  ];

  const handleDateRangeChange = (range: LocalDateRange) => {
    setDateRange(range);
  };

  const handleExportReport = () => {
    // Implementar exportação de relatório
    console.log('Exportando relatório...');
  };

  const getMetricCards = () => {
    return [
      {
        title: 'Tarefas Concluídas',
        value: '247',
        change: '+12%',
        icon: CheckCircle,
        color: 'text-green-600'
      },
      {
        title: 'Produtividade',
        value: '89%',
        change: '+5%',
        icon: TrendingUp,
        color: 'text-blue-600'
      },
      {
        title: 'Tempo Médio',
        value: '2.4h',
        change: '-8%',
        icon: Clock,
        color: 'text-purple-600'
      },
      {
        title: 'Taxa de Conclusão',
        value: '94%',
        change: '+3%',
        icon: Target,
        color: 'text-orange-600'
      }
    ];
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relatórios Avançados</h2>
          <p className="text-muted-foreground">Análise detalhada de performance e métricas</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={handleExportReport} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="metric">Métrica</Label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a métrica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tasks">Tarefas</SelectItem>
                  <SelectItem value="users">Usuários</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="productivity">Produtividade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="period">Período</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Semanal</SelectItem>
                  <SelectItem value="month">Mensal</SelectItem>
                  <SelectItem value="quarter">Trimestral</SelectItem>
                  <SelectItem value="year">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sector">Setor</Label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="vendas">Vendas</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="ti">TI</SelectItem>
                  <SelectItem value="rh">RH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Período Personalizado</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from && dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      <span>Selecione o período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to
                    }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        handleDateRangeChange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {getMetricCards().map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className={cn("text-sm", metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600')}>
                    {metric.change} vs período anterior
                  </p>
                </div>
                <metric.icon className={cn("h-8 w-8", metric.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="sectors">Setores</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Evolução de Tarefas</CardTitle>
                <CardDescription>Comparativo mensal de tarefas concluídas vs pendentes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={taskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#10b981" name="Concluídas" />
                    <Bar dataKey="pending" fill="#f59e0b" name="Pendentes" />
                    <Bar dataKey="overdue" fill="#ef4444" name="Atrasadas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Setor</CardTitle>
                <CardDescription>Porcentagem de tarefas por setor</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise Detalhada de Tarefas</CardTitle>
              <CardDescription>Métricas avançadas de produtividade</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={taskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    stackId="1" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pending" 
                    stackId="1" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Performance</CardTitle>
              <CardDescription>Eficiência e qualidade ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Eficiência"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="quality" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Qualidade"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sectors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectorData.map((sector, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: sector.color }}
                    />
                    {sector.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tarefas</span>
                      <span className="font-semibold">{sector.value}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Conclusão</span>
                      <span className="font-semibold">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tempo Médio</span>
                      <span className="font-semibold">2.1h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
