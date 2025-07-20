
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useMockRecurringTaskService } from '@/services/mockRecurringTaskService';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Repeat, Users, AlertCircle, X } from 'lucide-react';

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: Date;
  maxOccurrences?: number;
}

interface RecurringTaskFormProps {
  onSubmit?: (task: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

export const RecurringTaskForm: React.FC<RecurringTaskFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const { toast } = useToast();
  const { createRecurringTask } = useMockRecurringTaskService();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    sector: initialData?.sector || '',
    assigned_to: initialData?.assigned_to || '',
    due_date: initialData?.due_date || '',
    priority: initialData?.priority || 'medium' as const,
    is_recurring: true,
    recurrence_pattern: {
      type: 'weekly' as const,
      interval: 1,
      daysOfWeek: [] as number[],
      dayOfMonth: 1,
      endDate: undefined as Date | undefined,
      maxOccurrences: undefined as number | undefined
    } as RecurrencePattern
  });

  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const weekDays = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' }
  ];

  const handleDayOfWeekToggle = (dayValue: number) => {
    const currentDays = formData.recurrence_pattern.daysOfWeek || [];
    const updatedDays = currentDays.includes(dayValue)
      ? currentDays.filter(d => d !== dayValue)
      : [...currentDays, dayValue].sort();

    setFormData(prev => ({
      ...prev,
      recurrence_pattern: {
        ...prev.recurrence_pattern,
        daysOfWeek: updatedDays
      }
    }));
  };

  const handleRecurrenceChange = (field: keyof RecurrencePattern, value: any) => {
    setFormData(prev => ({
      ...prev,
      recurrence_pattern: {
        ...prev.recurrence_pattern,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      if (!formData.title.trim()) {
        toast({
          title: 'Erro de validação',
          description: 'O título da tarefa é obrigatório',
          variant: 'destructive'
        });
        return;
      }

      if (!formData.sector.trim()) {
        toast({
          title: 'Erro de validação',
          description: 'O setor é obrigatório',
          variant: 'destructive'
        });
        return;
      }

      if (formData.recurrence_pattern.type === 'weekly' && 
          (!formData.recurrence_pattern.daysOfWeek || formData.recurrence_pattern.daysOfWeek.length === 0)) {
        toast({
          title: 'Erro de validação',
          description: 'Para recorrência semanal, selecione pelo menos um dia da semana',
          variant: 'destructive'
        });
        return;
      }

      // Ensure all required properties are present
      const completeRecurrencePattern: RecurrencePattern = {
        type: formData.recurrence_pattern.type,
        interval: formData.recurrence_pattern.interval,
        daysOfWeek: formData.recurrence_pattern.daysOfWeek,
        dayOfMonth: formData.recurrence_pattern.dayOfMonth,
        endDate: formData.recurrence_pattern.endDate,
        maxOccurrences: formData.recurrence_pattern.maxOccurrences
      };

      const taskData = {
        title: formData.title,
        description: formData.description,
        sector: formData.sector,
        assigned_to: formData.assigned_to,
        due_date: formData.due_date,
        priority: formData.priority,
        status: 'pending' as const,
        is_recurring: true,
        recurrence_pattern: completeRecurrencePattern,
        created_by: 'current-user-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await createRecurringTask(taskData);

      if (error) {
        toast({
          title: 'Erro ao criar tarefa',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Tarefa recorrente criada!',
        description: 'A tarefa foi configurada e será executada automaticamente conforme programado.'
      });

      if (onSubmit) {
        onSubmit(taskData);
      }
    } catch (error) {
      console.error('Erro ao criar tarefa recorrente:', error);
      toast({
        title: 'Erro inesperado',
        description: 'Não foi possível criar a tarefa recorrente',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          Nova Tarefa Recorrente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações básicas */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título da Tarefa *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Relatório semanal de vendas"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva os detalhes da tarefa..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sector">Setor *</Label>
                <Input
                  id="sector"
                  value={formData.sector}
                  onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                  placeholder="Ex: Vendas, Estoque..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Configuração de Recorrência */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Configuração de Recorrência
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Recorrência</Label>
                <Select 
                  value={formData.recurrence_pattern.type} 
                  onValueChange={(value: any) => handleRecurrenceChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diária</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Intervalo</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.recurrence_pattern.interval}
                  onChange={(e) => handleRecurrenceChange('interval', parseInt(e.target.value))}
                  placeholder="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.recurrence_pattern.type === 'daily' && 'A cada X dias'}
                  {formData.recurrence_pattern.type === 'weekly' && 'A cada X semanas'}
                  {formData.recurrence_pattern.type === 'monthly' && 'A cada X meses'}
                </p>
              </div>
            </div>

            {/* Dias da semana para recorrência semanal */}
            {formData.recurrence_pattern.type === 'weekly' && (
              <div>
                <Label>Dias da Semana</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {weekDays.map((day) => (
                    <Badge
                      key={day.value}
                      variant={
                        formData.recurrence_pattern.daysOfWeek?.includes(day.value) 
                          ? 'default' 
                          : 'outline'
                      }
                      className="cursor-pointer"
                      onClick={() => handleDayOfWeekToggle(day.value)}
                    >
                      {day.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Dia do mês para recorrência mensal */}
            {formData.recurrence_pattern.type === 'monthly' && (
              <div>
                <Label>Dia do Mês</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.recurrence_pattern.dayOfMonth}
                  onChange={(e) => handleRecurrenceChange('dayOfMonth', parseInt(e.target.value))}
                />
              </div>
            )}
          </div>

          {/* Configurações Avançadas */}
          <div className="space-y-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Configurações Avançadas
            </Button>

            {showAdvanced && (
              <div className="space-y-4 border-l-2 border-gray-200 pl-4">
                <div>
                  <Label htmlFor="endDate">Data de Término (Opcional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.recurrence_pattern.endDate ? 
                      formData.recurrence_pattern.endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleRecurrenceChange('endDate', 
                      e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>

                <div>
                  <Label htmlFor="maxOccurrences">Máximo de Ocorrências (Opcional)</Label>
                  <Input
                    id="maxOccurrences"
                    type="number"
                    min="1"
                    value={formData.recurrence_pattern.maxOccurrences || ''}
                    onChange={(e) => handleRecurrenceChange('maxOccurrences', 
                      e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Ex: 10"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Criando...' : 'Criar Tarefa Recorrente'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
