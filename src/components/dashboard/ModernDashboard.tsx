import React, { useState, useEffect, useRef } from "react";

// Helper component for progress bar
interface ProgressBarProps {
  percentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${percentage}%`;
    }
  }, [percentage]);

  return (
    <div
      ref={progressRef}
      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000 ease-out progress-fill"
    />
  );
};
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  CheckSquare,
  Clock,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  Calendar,
  Settings,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Award,
  Zap,
  Activity,
  ArrowRight,
  Sparkles,
  Bell,
  Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  unreadMessages: number;
  teamMembers?: number;
}

interface ModernDashboardProps {
  stats: DashboardStats;
  onCreateTask?: () => void;
  onViewTasks?: () => void;
  onViewChat?: () => void;
  onViewReports?: () => void;
}

export const ModernDashboard: React.FC<ModernDashboardProps> = ({
  stats,
  onCreateTask,
  onViewTasks,
  onViewChat,
  onViewReports,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeOfDay, setTimeOfDay] = useState("");
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("Bom dia");
    else if (hour < 18) setTimeOfDay("Boa tarde");
    else setTimeOfDay("Boa noite");

    loadRecentActivity();
  }, []);

  const loadRecentActivity = async () => {
    try {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentActivity(data || []);
    } catch (error) {
      console.error("Erro ao carregar atividade recente:", error);
    }
  };

  const getCompletionRate = () => {
    if (stats.totalTasks === 0) return 0;
    return Math.round((stats.completedTasks / stats.totalTasks) * 100);
  };

  const getTrendIcon = (value: number, threshold: number = 75) => {
    if (value > threshold)
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < threshold - 20)
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-yellow-600" />;
  };

  const renderWelcomeSection = () => (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white mb-8 animate-fade-scale">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-20 translate-y-20"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 animate-slide-right">
              {timeOfDay}, {user?.name}! 👋
            </h1>
            <p className="text-blue-100 text-lg animate-slide-right animation-delay-200">
              Bem-vindo ao seu painel de controle
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover-lift"
              onClick={() => navigate("/notifications")}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </Button>
            <Button
              size="sm"
              className="bg-white text-blue-600 hover:bg-blue-50 hover-lift"
              onClick={onCreateTask}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover-lift">
            <div className="flex items-center justify-between mb-2">
              <CheckSquare className="h-6 w-6 text-green-500" />
              <Badge variant="secondary" className="bg-white/20 text-white">
                {getCompletionRate()}%
              </Badge>
            </div>
            <p className="text-2xl font-bold">{stats.completedTasks}</p>
            <p className="text-blue-100 text-sm">Concluídas</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover-lift">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-6 w-6 text-yellow-300" />
              <Badge variant="secondary" className="bg-white/20 text-white">
                Ativo
              </Badge>
            </div>
            <p className="text-2xl font-bold">{stats.pendingTasks}</p>
            <p className="text-blue-100 text-sm">Pendentes</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover-lift">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-6 w-6 text-red-300" />
              <Badge
                variant="destructive"
                className="bg-red-500/20 text-red-200"
              >
                Urgente
              </Badge>
            </div>
            <p className="text-2xl font-bold">{stats.overdueTasks}</p>
            <p className="text-blue-100 text-sm">Atrasadas</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover-lift">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="h-6 w-6 text-purple-300" />
              {stats.unreadMessages > 0 && (
                <Badge className="bg-pink-500 text-white animate-pulse">
                  {stats.unreadMessages}
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold">{stats.unreadMessages}</p>
            <p className="text-blue-100 text-sm">Mensagens</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMetricsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="modern-card hover-lift animate-slide-up">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total de Tarefas
          </CardTitle>
          <div className="p-2 bg-blue-50 rounded-lg">
            <Target className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalTasks}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(getCompletionRate())}
                <p className="text-sm text-gray-500">
                  {getCompletionRate()}% concluídas
                </p>
              </div>
            </div>
            <div className="w-16 h-16">
              <div className="relative w-full h-full">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray={`${getCompletionRate()}, 100`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-600">
                    {getCompletionRate()}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="modern-card hover-lift animate-slide-up animation-delay-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Performance
          </CardTitle>
          <div className="p-2 bg-green-50 rounded-lg">
            <Award className="h-5 w-5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {getCompletionRate()}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <ProgressBar percentage={getCompletionRate()} />
          </div>
          <p className="text-sm text-gray-500">Taxa de conclusão</p>
        </CardContent>
      </Card>

      <Card className="modern-card hover-lift animate-slide-up animation-delay-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Atividade
          </CardTitle>
          <div className="p-2 bg-purple-50 rounded-lg">
            <Activity className="h-5 w-5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {stats.totalTasks > 0 ? "Alta" : "Baixa"}
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                stats.totalTasks > 5 ? "bg-green-500" : "bg-yellow-500"
              }`}
            ></div>
            <p className="text-sm text-gray-500">
              {stats.totalTasks > 5 ? "Sistema ativo" : "Pouca atividade"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="modern-card hover-lift animate-slide-up animation-delay-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {user?.role === "gerente" ? "Equipe" : "Mensagens"}
          </CardTitle>
          <div className="p-2 bg-orange-50 rounded-lg">
            {user?.role === "gerente" ? (
              <Users className="h-5 w-5 text-orange-600" />
            ) : (
              <MessageSquare className="h-5 w-5 text-orange-600" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {user?.role === "gerente"
              ? stats.teamMembers || 0
              : stats.unreadMessages}
          </div>
          <p className="text-sm text-gray-500">
            {user?.role === "gerente" ? "Membros ativos" : "Não lidas"}
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderQuickActions = () => (
    <Card className="modern-card mb-8 animate-slide-up animation-delay-400">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Acesso rápido às principais funcionalidades
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="hover-lift">
            <Filter className="h-4 w-4 mr-2" />
            Personalizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            onClick={onCreateTask}
            className="h-20 flex-col bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover-lift"
          >
            <Plus className="h-6 w-6 mb-2" />
            Nova Tarefa
          </Button>

          <Button
            variant="outline"
            onClick={onViewTasks}
            className="h-20 flex-col hover:bg-green-50 hover:border-green-300 hover:text-green-700 hover-lift"
          >
            <CheckSquare className="h-6 w-6 mb-2" />
            Ver Tarefas
          </Button>

          <Button
            variant="outline"
            onClick={onViewChat}
            className="h-20 flex-col hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 hover-lift relative"
          >
            <MessageSquare className="h-6 w-6 mb-2" />
            Chat
            {stats.unreadMessages > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs animate-bounce">
                {stats.unreadMessages}
              </Badge>
            )}
          </Button>

          {(user?.role === "gerente" || user?.is_company_admin) && (
            <Button
              variant="outline"
              onClick={onViewReports}
              className="h-20 flex-col hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 hover-lift"
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              Relatórios
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderRecentActivity = () => (
    <Card className="modern-card animate-slide-up animation-delay-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Atividade Recente
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewTasks}
            className="hover-lift"
          >
            Ver todas
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors hover-lift"
                className={`animate-slide-up animation-delay-${Math.min(
                  600 + index * 100,
                  1000
                )}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.status === "completed"
                      ? "bg-green-100"
                      : activity.status === "overdue"
                      ? "bg-red-100"
                      : "bg-blue-100"
                  }`}
                >
                  <CheckSquare
                    className={`h-5 w-5 ${
                      activity.status === "completed"
                        ? "text-green-600"
                        : activity.status === "overdue"
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">
                    {activity.sector} •{" "}
                    {new Date(activity.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Badge
                  variant={
                    activity.status === "completed"
                      ? "default"
                      : activity.status === "overdue"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {activity.status === "completed"
                    ? "Concluída"
                    : activity.status === "overdue"
                    ? "Atrasada"
                    : "Pendente"}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma atividade recente</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateTask}
              className="mt-4 hover-lift"
            >
              Criar primeira tarefa
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {renderWelcomeSection()}
      {renderMetricsCards()}
      {renderQuickActions()}
      {renderRecentActivity()}
    </div>
  );
};
