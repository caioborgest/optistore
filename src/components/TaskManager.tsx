
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TaskService } from '@/services/taskService';
import { Task } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed' | 'cancelled'>('pending');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [sector, setSector] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await TaskService.getTasks();
      if (error) {
        toast({
          title: 'Erro ao carregar tarefas',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
      setTasks(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar tarefas',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      const newTask = {
        ...taskData,
        status: 'pending' as const,
        priority: taskData.priority || 'medium' as const,
        created_by: userProfile?.id || '',
        sector: taskData.sector || 'Geral',
      };

      const { data, error } = await TaskService.createTask(newTask);
      
      if (error) {
        toast({
          title: 'Erro ao criar tarefa',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      if (data) {
        setTasks([data, ...tasks]);
        toast({
          title: 'Tarefa criada',
          description: 'Tarefa criada com sucesso!'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao criar tarefa',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    try {
      const updatedTask = {
        ...selectedTask,
        title,
        description,
        status,
        priority,
        sector,
        due_date: dueDate?.toISOString(),
      };

      const { data, error } = await TaskService.updateTask(selectedTask.id, updatedTask);
      
      if (error) {
        toast({
          title: 'Erro ao atualizar tarefa',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      if (data) {
        setTasks(tasks.map(task => task.id === data.id ? data : task));
        toast({
          title: 'Tarefa atualizada',
          description: 'Tarefa atualizada com sucesso!'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar tarefa',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsEditOpen(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await TaskService.deleteTask(taskId);
      
      if (error) {
        toast({
          title: 'Erro ao excluir tarefa',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      setTasks(tasks.filter(task => task.id !== taskId));
      toast({
        title: 'Tarefa excluída',
        description: 'Tarefa excluída com sucesso!'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir tarefa',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status === 'overdue' ? 'pending' : task.status);
    setPriority(task.priority);
    setSector(task.sector);
    setDueDate(task.due_date ? new Date(task.due_date) : undefined);
    setIsEditOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gerenciar Tarefas</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Tarefa
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map(task => (
          <Card key={task.id} className="bg-gray-50">
            <CardHeader>
              <CardTitle>{task.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{task.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <Label className="text-xs">Status:</Label>
                  <p className="text-sm">{task.status}</p>
                </div>
                <div>
                  <Label className="text-xs">Prioridade:</Label>
                  <p className="text-sm">{task.priority}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <Button size="sm" variant="outline" onClick={() => openEditModal(task)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteTask(task.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Criação */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Criar Nova Tarefa</h3>
              <div className="mt-2">
                <CreateTaskForm onCreate={(taskData) => {
                  handleCreateTask(taskData);
                  setIsCreateOpen(false);
                }} onCancel={() => setIsCreateOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {isEditOpen && selectedTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Editar Tarefa</h3>
              <div className="mt-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: 'pending' | 'in_progress' | 'completed' | 'cancelled') => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>

                <Label htmlFor="priority">Prioridade</Label>
                <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>

                <Label htmlFor="sector">Setor</Label>
                <Input
                  id="sector"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                />

                <Label htmlFor="due-date">Data de Vencimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : <span>Selecione a data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <div className="mt-4 flex justify-end space-x-2">
                  <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                  <Button onClick={handleUpdateTask}>Salvar</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CreateTaskFormProps {
  onCreate: (taskData: any) => void;
  onCancel: () => void;
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onCreate, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const handleSubmit = () => {
    onCreate({
      title,
      description,
      sector,
      priority,
      due_date: dueDate?.toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="sector">Setor</Label>
        <Input
          id="sector"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="priority">Prioridade</Label>
        <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setPriority(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="due-date">Data de Vencimento</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : <span>Selecione a data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              disabled={(date) =>
                date < new Date()
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSubmit}>Criar</Button>
      </div>
    </div>
  );
};

export default TaskManager;
