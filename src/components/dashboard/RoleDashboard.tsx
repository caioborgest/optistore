import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckSquare,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  BarChart3,
  PlusCircle,
  CheckCircle,
  Target,
  Bell,
  MessageSquare,
  Award,
} from "lucide-react";
import { UserProfile } from "@/types/database";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RoleDashboardProps {
  userProfile: UserProfile;
}

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalUsers?: number;
  recentActivities: Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
    type:
      | "task_created"
      | "task_completed"
      | "user_joined"
      | "meeting_scheduled";
  }>;
  upcomingTasks: Array<{
    id: string;
    title: string;
    due_date: string;
    priority: "low" | "medium" | "high" | "urgent";
  }>;
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({
  userProfile,
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados reais do Supabase
  useEffect(() => {
    loadDashboardStats();
  }, [userProfile]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      // Buscar estatísticas de tarefas baseadas no papel do usuário
      let tasks;
      let tasksError;

      if (!userProfile.is_company_admin) {
        // Usuário comum vê apenas suas tarefas
        const result = await supabase
          .from("tasks")
          .select("*")
          .eq("assigned_to", userProfile.id);
        tasks = result.data;
        tasksError = result.error;
      } else {
        // Admin vê todas as tarefas da empresa
        // Primeiro buscar todos os usuários da empresa
        const { data: companyUsers, error: usersError } = await supabase
          .from("users")
          .select("id")
          .eq("company_id", userProfile.company_id);

        if (usersError) {
          console.error("Erro ao carregar usuários:", usersError);
          return;
        }

        // Extrair apenas os IDs dos usuários
        const userIds = companyUsers?.map(user => user.id) || [];

        // Buscar tarefas de todos os usuários da empresa
        if (userIds.length > 0) {
          const result = await supabase
            .from("tasks")
            .select("*")
            .in("assigned_to", userIds);
          tasks = result.data;
          tasksError = result.error;
        } else {
          tasks = [];
          tasksError = null;
        }
      }

      if (tasksError) {
        console.error("Erro ao carregar tarefas:", tasksError);
        return;
      }

      // Calcular estatísticas
      const totalTasks = tasks?.length || 0;
      const completedTasks =
        tasks?.filter((t) => t.status === "completed").length || 0;
      const pendingTasks =
        tasks?.filter((t) => t.status === "pending").length || 0;
      const overdueTasks =
        tasks?.filter((t) => t.status === "overdue").length || 0;

      // Buscar tarefas próximas do vencimento
      const { data: upcomingTasks } = await supabase
        .from("tasks")
        .select("id, title, due_date, priority")
        .gte("due_date", new Date().toISOString())
        .lte(
          "due_date",
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        )
        .eq("status", "pending")
        .order("due_date", { ascending: true })
        .limit(5);

      // Buscar atividades recentes (últimas tarefas criadas/atualizadas)
      const { data: recentTasks } = await supabase
        .from("tasks")
        .select("id, title, created_at, status, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);

      const recentActivities =
        recentTasks?.map((task) => ({
          id: task.id,
          title:
            task.status === "completed" ? "Tarefa concluída" : "Tarefa criada",
          description: task.title,
          timestamp: task.updated_at || task.created_at,
          type:
            task.status === "completed"
              ? ("task_completed" as const)
              : ("task_created" as const),
        })) || [];

      // Buscar total de usuários (apenas para admin)
      let totalUsers = 0;
      if (userProfile.is_company_admin) {
        const { count } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("company_id", userProfile.company_id);
        totalUsers = count || 0;
      }

      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        totalUsers,
        recentActivities,
        upcomingTasks: upcomingTasks || [],
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as estatísticas do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handlers para os botões de ação rápida
  const handleQuickAction = (action: string) => {
    switch (action) {
      case "users":
        navigate("/users");
        break;
      case "reports":
        navigate("/reports");
        break;
      case "tasks":
        navigate("/tasks");
        break;
      case "chat":
        navigate("/chat");
        break;
      case "calendar":
        navigate("/calendar");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "new-task":
        navigate("/tasks");
        break;
      default:
        console.log("Ação:", action);
    }
  };

  const getDashboardData = () => {
    if (!stats) {
      return {
        title: "Carregando...",
        cards: [],
      };
    }

    if (userProfile.is_company_admin) {
      return {
        title: "Dashboard Administrativo",
        cards: [
          {
            title: "Total de Usuários",
            value: stats.totalUsers?.toString() || "0",
            icon: Users,
            color: "text-blue-600",
          },
          {
            title: "Total de Tarefas",
            value: stats.totalTasks.toString(),
            icon: CheckSquare,
            color: "text-green-600",
          },
          {
            title: "Concluídas",
            value: stats.completedTasks.toString(),
            icon: CheckCircle,
            color: "text-green-600",
          },
          {
            title: "Taxa de Conclusão",
            value:
              stats.totalTasks > 0
                ? `${Math.round(
                    (stats.completedTasks / stats.totalTasks) * 100
                  )}%`
                : "0%",
            icon: TrendingUp,
            color: "text-orange-600",
          },
        ],
      };
    } else {
      return {
        title: "Meu Dashboard",
        cards: [
          {
            title: "Minhas Tarefas",
            value: stats.totalTasks.toString(),
            icon: CheckSquare,
            color: "text-blue-600",
          },
          {
            title: "Pendentes",
            value: stats.pendingTasks.toString(),
            icon: Clock,
            color: "text-yellow-600",
          },
          {
            title: "Concluídas",
            value: stats.completedTasks.toString(),
            icon: CheckCircle,
            color: "text-green-600",
          },
          {
            title: "Atrasadas",
            value: stats.overdueTasks.toString(),
            icon: AlertCircle,
            color: "text-red-600",
          },
        ],
      };
    }
  };

  const dashboardData = getDashboardData();

  return (
    <div className="p-6 space-y-6 pb-20 lg:pb-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {dashboardData.title}
          </h1>
          <p className="text-muted-foreground text-lg">
            Bem-vindo, {userProfile.name}! 👋
          </p>
        </div>
        <Button 
          className="gradient-primary text-primary-foreground hover-lift shadow-lg font-semibold h-12 px-6"
          onClick={() => handleQuickAction("new-task")}
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {dashboardData.cards.map((card, index) => (
          <Card key={index} className="card-modern hover-lift animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2 font-medium">
                    {card.title}
                  </p>
                  <p className="text-2xl lg:text-3xl font-bold text-card-foreground">
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${card.color} bg-opacity-10 self-end lg:self-auto`}>
                  <card.icon className={`h-6 w-6 lg:h-8 lg:w-8 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seção de atividades recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3 lg:pb-4">
            <CardTitle className="text-lg lg:text-xl">
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : stats?.recentActivities.length ? (
              <div className="space-y-3 lg:space-y-4">
                {stats.recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm lg:text-base truncate">
                        {activity.title}: "{activity.description}"
                      </p>
                      <p className="text-xs lg:text-sm text-gray-600">
                        {new Date(activity.timestamp).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <Badge
                      className={`ml-2 text-xs ${
                        activity.type === "task_completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {activity.type === "task_completed"
                        ? "Concluída"
                        : "Nova"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma atividade recente</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3 lg:pb-4">
            <CardTitle className="text-lg lg:text-xl">
              Próximas Tarefas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : stats?.upcomingTasks.length ? (
              <div className="space-y-3 lg:space-y-4">
                {stats.upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm lg:text-base truncate">
                        {task.title}
                      </p>
                      <p className="text-xs lg:text-sm text-gray-600">
                        Vence em{" "}
                        {Math.ceil(
                          (new Date(task.due_date).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        dias
                      </p>
                    </div>
                    <Badge
                      className={`ml-2 text-xs ${
                        task.priority === "urgent" || task.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : task.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {task.priority === "urgent"
                        ? "Urgente"
                        : task.priority === "high"
                        ? "Alta"
                        : task.priority === "medium"
                        ? "Média"
                        : "Baixa"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma tarefa próxima</p>
              </div>
            )}
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
            {userProfile.is_company_admin && (
              <>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => handleQuickAction("users")}
                >
                  <Users className="h-6 w-6 mb-2" />
                  Gerenciar Usuários
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => handleQuickAction("reports")}
                >
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Relatórios
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => handleQuickAction("new-task")}
                >
                  <PlusCircle className="h-6 w-6 mb-2" />
                  Nova Tarefa
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => handleQuickAction("chat")}
                >
                  <Users className="h-6 w-6 mb-2" />
                  Chat Geral
                </Button>
              </>
            )}

            {!userProfile.is_company_admin && (
              <>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => handleQuickAction("tasks")}
                >
                  <CheckSquare className="h-6 w-6 mb-2" />
                  Minhas Tarefas
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => handleQuickAction("calendar")}
                >
                  <Calendar className="h-6 w-6 mb-2" />
                  Calendário
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => handleQuickAction("chat")}
                >
                  <Users className="h-6 w-6 mb-2" />
                  Mensagens
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => handleQuickAction("settings")}
                >
                  <Users className="h-6 w-6 mb-2" />
                  Configurações
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
