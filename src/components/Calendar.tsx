
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'task' | 'meeting' | 'training' | 'report';
  sector: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status?: string;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  // Carregar tarefas do Supabase
  useEffect(() => {
    loadCalendarEvents();
  }, [currentDate, userProfile]);

  const loadCalendarEvents = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);
      
      // Calcular range do mês atual
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      let query = supabase
        .from('tasks')
        .select('id, title, due_date, priority, sector, status')
        .gte('due_date', startOfMonth.toISOString())
        .lte('due_date', endOfMonth.toISOString());

      // Filtrar baseado no papel do usuário
      if (!userProfile.is_company_admin) {
        query = query.eq('assigned_to', userProfile.id);
      }

      const { data: tasks, error } = await query.order('due_date', { ascending: true });

      if (error) {
        console.error('Erro ao carregar tarefas:', error);
        toast({
          title: 'Erro ao carregar calendário',
          description: 'Não foi possível carregar as tarefas do calendário',
          variant: 'destructive'
        });
        return;
      }

      // Converter tarefas para eventos do calendário
      const calendarEvents: CalendarEvent[] = tasks?.map(task => ({
        id: task.id,
        title: task.title,
        date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        time: task.due_date ? new Date(task.due_date).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : undefined,
        type: 'task' as const,
        sector: task.sector || 'Geral',
        priority: task.priority || 'medium',
        status: task.status
      })) || [];

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'task': return 'bg-green-100 text-green-800 border-green-200';
      case 'training': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'report': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        events: []
      });
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = events.filter(event => event.date === dateStr);
      
      days.push({
        date,
        isCurrentMonth: true,
        events: dayEvents
      });
    }

    // Dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        events: []
      });
    }

    return days;
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const days = getDaysInMonth();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendário</h1>
          <p className="text-gray-600 mt-1">
            Visualize e gerencie todas as atividades programadas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Hoje
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Atividade
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {formatDate(currentDate)}
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex border rounded-lg">
                  <Button
                    variant={view === 'month' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setView('month')}
                    className="rounded-r-none"
                  >
                    Mês
                  </Button>
                  <Button
                    variant={view === 'week' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setView('week')}
                    className="rounded-none"
                  >
                    Semana
                  </Button>
                  <Button
                    variant={view === 'day' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setView('day')}
                    className="rounded-l-none"
                  >
                    Dia
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {weekDays.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border rounded-lg ${
                    day.isCurrentMonth 
                      ? 'bg-white hover:bg-gray-50' 
                      : 'bg-gray-50 text-gray-400'
                  } ${
                    day.date.toDateString() === new Date().toDateString()
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {day.events.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded border-l-2 ${getEventColor(event.type)} ${getPriorityColor(event.priority)}`}
                      >
                        <div className="font-medium truncate">{event.time}</div>
                        <div className="truncate">{event.title}</div>
                      </div>
                    ))}
                    {day.events.length > 2 && (
                      <div className="text-xs text-gray-500 pl-1">
                        +{day.events.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar with upcoming events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximas Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.slice(0, 5).map((event) => (
                <div key={event.id} className={`p-3 rounded-lg border border-l-4 ${getEventColor(event.type)} ${getPriorityColor(event.priority)}`}>
                  <div className="font-medium text-sm mb-1">{event.title}</div>
                  <div className="text-xs text-gray-600 mb-2">
                    {new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {event.sector}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Atividades Hoje</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    events.filter(event => 
                      event.date === new Date().toISOString().split('T')[0]
                    ).length
                  )}
                </p>
              </div>
              <CalendarIcon className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Esta Semana</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    events.filter(event => {
                      const eventDate = new Date(event.date);
                      const today = new Date();
                      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
                      return eventDate >= weekStart && eventDate <= weekEnd;
                    }).length
                  )}
                </p>
              </div>
              <Clock className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total do Mês</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    events.length
                  )}
                </p>
              </div>
              <Users className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
