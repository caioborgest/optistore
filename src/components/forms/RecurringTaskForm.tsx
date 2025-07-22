import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { RecurrencePattern } from '@/services/recurringTaskService';

const taskSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  sector: z.string().min(1, 'Setor é obrigatório'),
  assignedTo: z.string().optional(),
  dueDate: z.date({
    required_error: 'Data de vencimento é obrigatória',
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  estimatedHours: z.number().min(0).optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isRecurring: z.boolean().default(false),
  recurrenceType: z.enum(['daily', 'weekly', 'monthly']).optional(),
  recurrenceInterval: z.number().min(1).max(365).optional(),
  recurrenceDaysOfWeek: z.array(z.number()).optional(),
  recurrenceEndDate: z.date().optional(),
  recurrenceMaxOccurrences: z.number().min(1).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface RecurringTaskFormProps {
  onSubmit: (data: TaskFormData & { recurrencePattern?: RecurrencePattern }) => void;
  onCancel: () => void;
  users?: Array<{ id: string; name: string; sector: string }>;
  sectors?: string[];
  loading?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

export const RecurringTaskForm: React.FC<RecurringTaskFormProps> = ({
  onSubmit,
  onCancel,
  users = [],
  sectors = [],
  loading = false
}) => {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
      isRecurring: false,
      recurrenceType: 'weekly',
      recurrenceInterval: 1,
      recurrenceDaysOfWeek: [],
    },
  });

  const isRecurring = form.watch('isRecurring');
  const recurrenceType = form.watch('recurrenceType');

  const handleSubmit = (data: TaskFormData) => {
    let recurrencePattern: RecurrencePattern | undefined;

    if (data.isRecurring && data.recurrenceType) {
      recurrencePattern = {
        type: data.recurrenceType,
        interval: data.recurrenceInterval || 1,
        daysOfWeek: data.recurrenceDaysOfWeek,
        endDate: data.recurrenceEndDate?.toISOString(),
        maxOccurrences: data.recurrenceMaxOccurrences,
      };
    }

    onSubmit({
      ...data,
      recurrencePattern,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          Nova Tarefa
        </CardTitle>
        <CardDescription>
          Crie uma nova tarefa com opção de recorrência automática
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Tarefa</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o título da tarefa..." {...field} />
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
                          {sectors.map((sector) => (
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
                      <FormLabel>Atribuir para</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um usuário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.sector})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Vencimento</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP', { locale: ptBR })
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

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
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
                  name="estimatedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horas Estimadas</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.5"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Depósito, Loja, Escritório..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Configuração de Recorrência */}
            <div className="space-y-4 border-t pt-4">
              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Tarefa Recorrente</FormLabel>
                      <FormDescription>
                        Criar automaticamente novas ocorrências desta tarefa
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {isRecurring && (
                <div className="space-y-4 pl-6 border-l-2 border-muted">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="recurrenceType"
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
                      name="recurrenceInterval"
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
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {recurrenceType === 'weekly' && (
                    <FormField
                      control={form.control}
                      name="recurrenceDaysOfWeek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dias da Semana</FormLabel>
                          <div className="grid grid-cols-4 gap-2">
                            {DAYS_OF_WEEK.map((day) => (
                              <div key={day.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`day-${day.value}`}
                                  checked={field.value?.includes(day.value)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([...current, day.value]);
                                    } else {
                                      field.onChange(current.filter(d => d !== day.value));
                                    }
                                  }}
                                />
                                <label htmlFor={`day-${day.value}`} className="text-sm">
                                  {day.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="recurrenceEndDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data Final (opcional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP', { locale: ptBR })
                                  ) : (
                                    <span>Sem data final</span>
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

                    <FormField
                      control={form.control}
                      name="recurrenceMaxOccurrences"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Máximo de Ocorrências (opcional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              placeholder="Ilimitado"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Criando...' : 'Criar Tarefa'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};