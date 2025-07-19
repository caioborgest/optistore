# Arquitetura do Sistema de Gestão de Tarefas e Comunicação Interna

## 1. Visão Geral da Arquitetura

### Stack Tecnológico Atual (Aproveitado)
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Tailwind CSS + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Estado**: TanStack Query (React Query)
- **Roteamento**: React Router DOM
- **Formulários**: React Hook Form + Zod
- **PWA**: Service Worker + Manifest

### Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/TS)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Auth      │ │   Tasks     │ │    Chat     │           │
│  │  Module     │ │   Module    │ │   Module    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Calendar    │ │  Reports    │ │ Notifications│           │
│  │  Module     │ │   Module    │ │   Module    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                    API LAYER                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           Supabase Client + React Query                 │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ PostgreSQL  │ │    Auth     │ │  Realtime   │           │
│  │  Database   │ │   Service   │ │   Service   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Storage   │ │ Edge Funcs  │ │   Cron      │           │
│  │   Service   │ │   (API)     │ │  Jobs       │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## 2. Estrutura do Banco de Dados

### Tabelas Principais

#### users (Usuários)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'colaborador',
  sector VARCHAR,
  phone VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM ('gerente', 'supervisor', 'colaborador');
```

#### tasks (Tarefas)
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  priority task_priority DEFAULT 'medium',
  sector VARCHAR NOT NULL,
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB, -- {type: 'daily|weekly|monthly', interval: 1, days: [1,2,3]}
  parent_task_id UUID REFERENCES tasks(id), -- Para tarefas recorrentes
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
```

#### task_comments (Comentários das Tarefas)
```sql
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### task_attachments (Anexos das Tarefas)
```sql
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  file_name VARCHAR NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### chats (Conversas)
```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR,
  type chat_type NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE chat_type AS ENUM ('direct', 'group', 'sector', 'task');
```

#### chat_members (Membros das Conversas)
```sql
CREATE TABLE chat_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  role member_role DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  last_read_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE member_role AS ENUM ('admin', 'member');
```

#### messages (Mensagens)
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  message_type message_type DEFAULT 'text',
  reply_to UUID REFERENCES messages(id),
  edited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'system');
```

#### notifications (Notificações)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR NOT NULL,
  content TEXT,
  type notification_type NOT NULL,
  reference_id UUID, -- ID da tarefa, mensagem, etc.
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE notification_type AS ENUM ('task_assigned', 'task_due', 'task_completed', 'message', 'system');
```

## 3. Módulos e Funcionalidades

### 3.1 Módulo de Autenticação e Autorização

**Níveis de Acesso:**
- **Gerente**: Acesso total, criação de usuários, relatórios gerenciais
- **Supervisor**: Gestão de tarefas do setor, relatórios setoriais
- **Colaborador**: Visualização e execução de tarefas próprias

**Implementação:**
```typescript
// types/auth.ts
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'gerente' | 'supervisor' | 'colaborador';
  sector: string;
  avatar_url?: string;
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}
```

### 3.2 Módulo de Tarefas Recorrentes

**Lógica de Recorrência:**
```typescript
// types/tasks.ts
export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number; // A cada X dias/semanas/meses
  daysOfWeek?: number[]; // Para semanal: [1,2,3,4,5] = seg-sex
  dayOfMonth?: number; // Para mensal: dia específico
  endDate?: string; // Data limite para recorrência
  maxOccurrences?: number; // Número máximo de ocorrências
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sector: string;
  assignedTo: string;
  createdBy: string;
  dueDate: string;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  parentTaskId?: string;
}
```

### 3.3 Módulo de Chat em Tempo Real

**Tipos de Conversas:**
- **Diretas**: Entre dois usuários
- **Grupos**: Múltiplos usuários
- **Setoriais**: Por departamento
- **Por Tarefa**: Discussão específica de uma tarefa

**Implementação WebSocket:**
```typescript
// hooks/useRealtime.ts
export const useRealtime = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { messages };
};
```

## 4. Experiência do Usuário (UX) por Papel

### 4.1 Gerente
**Dashboard Principal:**
- Visão geral de todas as tarefas da loja
- Métricas de performance por setor
- Gráficos de produtividade
- Alertas de tarefas atrasadas
- Gestão de usuários e permissões

**Funcionalidades Específicas:**
- Criar tarefas para qualquer setor
- Visualizar relatórios completos
- Configurar tarefas recorrentes globais
- Moderar chats e comunicações

### 4.2 Supervisor
**Dashboard Setorial:**
- Tarefas do seu setor
- Performance da equipe
- Calendário setorial
- Chat do setor

**Funcionalidades Específicas:**
- Atribuir tarefas aos colaboradores
- Acompanhar progresso das atividades
- Criar relatórios setoriais
- Gerenciar chat do setor

### 4.3 Colaborador
**Dashboard Pessoal:**
- Suas tarefas pendentes
- Calendário pessoal
- Notificações
- Chats ativos

**Funcionalidades Específicas:**
- Visualizar e executar tarefas
- Comentar e anexar arquivos
- Participar de chats
- Receber notificações

## 5. Implementação de Funcionalidades Críticas

### 5.1 Sistema de Notificações
```typescript
// services/notificationService.ts
export class NotificationService {
  static async createNotification(
    userId: string,
    title: string,
    content: string,
    type: NotificationType,
    referenceId?: string
  ) {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        content,
        type,
        reference_id: referenceId
      });

    if (!error) {
      // Enviar notificação em tempo real
      await supabase
        .channel(`user:${userId}`)
        .send({
          type: 'broadcast',
          event: 'notification',
          payload: { title, content, type }
        });
    }
  }
}
```

### 5.2 Gerador de Tarefas Recorrentes
```typescript
// services/recurringTaskService.ts
export class RecurringTaskService {
  static async generateRecurringTasks() {
    const { data: recurringTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('is_recurring', true)
      .eq('status', 'completed');

    for (const task of recurringTasks || []) {
      const nextDueDate = this.calculateNextDueDate(
        task.due_date,
        task.recurrence_pattern
      );

      if (nextDueDate) {
        await supabase.from('tasks').insert({
          title: task.title,
          description: task.description,
          sector: task.sector,
          assigned_to: task.assigned_to,
          created_by: task.created_by,
          due_date: nextDueDate,
          is_recurring: true,
          recurrence_pattern: task.recurrence_pattern,
          parent_task_id: task.id,
          priority: task.priority
        });
      }
    }
  }

  private static calculateNextDueDate(
    lastDueDate: string,
    pattern: RecurrencePattern
  ): string | null {
    const lastDate = new Date(lastDueDate);
    
    switch (pattern.type) {
      case 'daily':
        lastDate.setDate(lastDate.getDate() + pattern.interval);
        break;
      case 'weekly':
        lastDate.setDate(lastDate.getDate() + (pattern.interval * 7));
        break;
      case 'monthly':
        lastDate.setMonth(lastDate.getMonth() + pattern.interval);
        break;
    }

    return lastDate.toISOString();
  }
}
```

## 6. Segurança e Boas Práticas

### 6.1 Row Level Security (RLS)
```sql
-- Política para tarefas - usuários só veem tarefas do seu setor ou atribuídas a eles
CREATE POLICY "Users can view relevant tasks" ON tasks
  FOR SELECT USING (
    assigned_to = auth.uid() OR 
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'gerente' OR (role = 'supervisor' AND sector = tasks.sector))
    )
  );

-- Política para mensagens - usuários só veem mensagens de chats que participam
CREATE POLICY "Users can view chat messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_members 
      WHERE chat_id = messages.chat_id 
      AND user_id = auth.uid()
    )
  );
```

### 6.2 Validação de Dados
```typescript
// schemas/taskSchema.ts
import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  sector: z.string().min(1, 'Setor é obrigatório'),
  assignedTo: z.string().uuid('ID do usuário inválido'),
  dueDate: z.string().datetime('Data inválida'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  recurrencePattern: z.object({
    type: z.enum(['daily', 'weekly', 'monthly']),
    interval: z.number().min(1).max(365),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    endDate: z.string().datetime().optional()
  }).optional()
});
```

## 7. Escalabilidade e Performance

### 7.1 Otimizações de Query
- Índices compostos para consultas frequentes
- Paginação para listas grandes
- Cache com React Query
- Lazy loading de componentes

### 7.2 Estrutura de Pastas Otimizada
```
src/
├── components/
│   ├── ui/              # Componentes base (shadcn)
│   ├── forms/           # Formulários específicos
│   ├── layout/          # Layout components
│   └── features/        # Componentes por funcionalidade
├── hooks/               # Custom hooks
├── services/            # Serviços e APIs
├── stores/              # Estado global (se necessário)
├── types/               # Definições TypeScript
├── utils/               # Utilitários
└── pages/               # Páginas da aplicação
```

## 8. Integrações Futuras

### 8.1 Sistema de Ponto
```typescript
// Estrutura para integração futura
interface TimeEntry {
  userId: string;
  clockIn: string;
  clockOut?: string;
  taskId?: string; // Vincular tempo à tarefa
  location?: { lat: number; lng: number };
}
```

### 8.2 APIs Externas
- Integração com ERPs
- Sistemas de estoque
- Plataformas de e-commerce
- Serviços de entrega

## 9. Cronograma de Implementação

### Fase 1 (2-3 semanas): Base
- [ ] Estrutura do banco de dados
- [ ] Sistema de autenticação completo
- [ ] CRUD básico de tarefas
- [ ] Interface responsiva básica

### Fase 2 (2-3 semanas): Funcionalidades Core
- [ ] Sistema de tarefas recorrentes
- [ ] Chat em tempo real
- [ ] Sistema de notificações
- [ ] Upload de arquivos

### Fase 3 (2 semanas): Refinamentos
- [ ] Relatórios e dashboards
- [ ] Calendário integrado
- [ ] Otimizações de performance
- [ ] Testes e ajustes

### Fase 4 (1 semana): Deploy e Monitoramento
- [ ] Deploy em produção
- [ ] Monitoramento e logs
- [ ] Documentação final
- [ ] Treinamento dos usuários

## 10. Métricas e Monitoramento

### KPIs Importantes:
- Taxa de conclusão de tarefas
- Tempo médio de execução
- Tarefas atrasadas por setor
- Engajamento no chat
- Performance da aplicação

Esta arquitetura fornece uma base sólida e escalável para sua aplicação de gestão de tarefas e comunicação interna, aproveitando ao máximo o stack tecnológico já implementado.