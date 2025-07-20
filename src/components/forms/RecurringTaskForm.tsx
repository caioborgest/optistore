import React, { useState, FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRecurringTasks, RecurrencePattern } from '@/services/mockRecurringTaskService';
import { useMockAuthService } from '@/services/mockAuthService';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const taskSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  sector: z.string().min(1, 'Setor é obrigatório'),
  assignedTo: z.string().min(1, 'Responsável é obrigatório'),
  dueDate: z.date({ required_error: 'Data de vencimento é obrigatória' }),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  isRecurring: z.boolean(),
  recurrencePattern: z.object({
    type: z.enum(['daily', 'weekly', 'monthly']),
    interval: z.number().min(1, 'Intervalo deve ser pelo menos 1').max(365, 'Intervalo muito grande'),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
    endDate: z.date().optional(),
    maxOccurrences: z.number().min(1).max(1000).optional()
  }).optional()
});

type TaskFormData = z.infer<typeof taskSchema>;

interface RecurringTaskFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<TaskFormData>;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' }
];

const SECTORS = [
  'Vendas',
  'Estoque',
  'Caixa',
  'Entregas',
  'Limpeza',
  'Administração',
  'Materiais Básicos',
  'Tintas',
  'Ferramentas'
];

export const RecurringTaskForm: React.FC<RecurringTaskFormProps> = ({
  onSuccess,
  onCancel,
  initialData
}) => {
  const { toast } = useToast();
  const { createRecurringTask } = useRecurringTasks();
  const { getUsers } = useMockAuthService();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      sector: initialData?.sector || '',
      assignedTo: initialData?.assignedTo || '',
      priority: initialData?.priority || 'medium',
      isRecurring: initialData?.isRecurring || false,
      recurrencePattern: initialData?.recurrencePattern || {
        type: 'daily',
        interval: 1
      }
    }
  });

  const isRecurring = form.watch('isRecurring');
  const recurrenceType = form.watch('recurrencePattern.type');

  React.useEffect(() => {
    const sector = form.watch('sector');
    if (sector) {
      loadUsers(sector);
    }
  }, [form.watch('sector')]);

  const loadUsers = async (sector: string) => {
    const { users: sectorUsers, error } = await getUsers();
    if (!error && sectorUsers) {
      setUsers(sectorUsers);
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    try {
      const taskData = {
        title: data.title,
        description: data.description,
        sector: data.sector,
        assigned_to: data.assignedTo,
        due_date: data.dueDate.toISOString(),
        priority: data.priority,
        status: 'pending' as const,
        is_recurring: data.isRecurring,
        recurrence_pattern: data.isRecurring && data.recurrencePattern ? {
          type: data.recurrencePattern.type,
          interval: data.recurrencePattern.interval,
          daysOfWeek: data.recurrencePattern.daysOfWeek,
          dayOfMonth: data.recurrencePattern.dayOfMonth,
          endDate: data.recurrencePattern.endDate?.toISOString(),
          maxOccurrences: data.recurrencePattern.maxOccurrences
        } as RecurrencePattern : undefined,
        created_by: '1'
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
        title: 'Tarefa criada com sucesso!',
        description: data.isRecurring 
          ? 'A tarefa recorrente foi configurada e será gerada automaticamente.'
          : 'A tarefa foi criada e atribuída ao responsável.'
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao criar a tarefa. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const toggleDayOfWeek = (day: number) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    
    setSelectedDays(newDays);
    form.setValue('recurrencePattern.daysOfWeek', newDays);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Editar Tarefa' : 'Nova Tarefa'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Tarefa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Organizar setor de tintas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva os detalhes da tarefa..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setor</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o setor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SECTORS.map((sector) => (
                            <SelectItem key={sector} value={sector}>
                              {sector}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o responsável" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Vencimento</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Tarefa Recorrente</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Esta tarefa se repetirá automaticamente
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {isRecurring && (
                <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="recurrencePattern.type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Recorrência</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Diária</SelectItem>
                              <SelectItem value="weekly">Semanal</SelectItem>
                              <SelectItem value="monthly">Mensal</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recurrencePattern.interval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Repetir a cada {recurrenceType === 'daily' ? 'dias' : recurrenceType === 'weekly' ? 'semanas' : 'meses'}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="365"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {recurrenceType === 'weekly' && (
                    <div>
                      <Label className="text-sm font-medium">Dias da Semana</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <Badge
                            key={day.value}
                            variant={selectedDays.includes(day.value) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleDayOfWeek(day.value)}
                          >
                            {day.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {recurrenceType === 'monthly' && (
                    <FormField
                      control={form.control}
                      name="recurrencePattern.dayOfMonth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dia do Mês (opcional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="31"
                              placeholder="Ex: 15 (para todo dia 15)"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <div className="text-xs text-muted-foreground">
                            Deixe vazio para usar o mesmo dia da primeira ocorrência
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="recurrencePattern.endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Final (opcional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`w-full pl-3 text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: ptBR })
                                ) : (
                                  <span>Selecione uma data final</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <div className="text-xs text-muted-foreground">
                          Deixe vazio para recorrência indefinida
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                {initialData ? 'Atualizar Tarefa' : 'Criar Tarefa'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
