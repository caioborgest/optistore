
import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';

const Reports = () => {
  const [period, setPeriod] = useState('month');

  // Mock data para demonstração
  const performanceData = [
    { name: 'João Silva', completed: 45, pending: 3, sector: 'Estoque' },
    { name: 'Maria Santos', completed: 38, pending: 5, sector: 'Vendas' },
    { name: 'Pedro Costa', completed: 42, pending: 2, sector: 'Limpeza' },
    { name: 'Ana Lima', completed: 35, pending: 8, sector: 'Vendas' },
    { name: 'Carlos Mendes', completed: 40, pending: 4, sector: 'Estoque' }
  ];

  const sectorData = [
    { name: 'Vendas', tasks: 156, completed: 142, efficiency: 91 },
    { name: 'Estoque', tasks: 89, completed: 85, efficiency: 95 },
    { name: 'Limpeza', tasks: 67, completed: 60, efficiency: 89 },
    { name: 'Administração', tasks: 34, completed: 32, efficiency: 94 }
  ];

  const monthlyTrend = [
    { month: 'Jan', completed: 245, total: 280 },
    { month: 'Fev', completed: 268, total: 290 },
    { month: 'Mar', completed: 289, total: 310 },
    { month: 'Abr', completed: 312, total: 335 },
    { month: 'Mai', completed: 298, total: 320 },
    { month: 'Jun', completed: 345, total: 360 }
  ];

  const taskTypeData = [
    { name: 'Estoque', value: 35, color: '#3B82F6' },
    { name: 'Limpeza', value: 25, color: '#10B981' },
    { name: 'Vendas', value: 30, color: '#F59E0B' },
    { name: 'Administração', value: 10, color: '#EF4444' }
  ];

  const totalTasks = 346;
  const completedTasks = 312;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

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
                <p className="text-3xl font-bold text-gray-900">{totalTasks}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% vs mês anterior
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
                <p className="text-3xl font-bold text-gray-900">{completionRate}%</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5% vs mês anterior
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
                <p className="text-3xl font-bold text-gray-900">14</p>
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  -3% vs mês anterior
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
                <p className="text-sm font-medium text-gray-600">Colaboradores Ativos</p>
                <p className="text-3xl font-bold text-gray-900">12</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  100% da equipe
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#3B82F6" name="Concluídas" />
                <Bar dataKey="pending" fill="#F59E0B" name="Pendentes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Setor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tendência Mensal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tendência Mensal de Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Concluídas"
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#94A3B8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Total"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Setor */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Detalhada por Setor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sectorData.map((sector) => (
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
