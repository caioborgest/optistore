-- =====================================================
-- SCHEMA COMPLETO PARA SISTEMA DE GESTÃO DE TAREFAS
-- E COMUNICAÇÃO INTERNA - LOJA DE MATERIAL DE CONSTRUÇÃO
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- =====================================================
-- TIPOS ENUMERADOS (ENUMS)
-- =====================================================

-- Papéis de usuário
CREATE TYPE user_role AS ENUM ('gerente', 'supervisor', 'colaborador');

-- Status das tarefas
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue', 'cancelled');

-- Prioridades das tarefas
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Tipos de chat
CREATE TYPE chat_type AS ENUM ('direct', 'group', 'sector', 'task');

-- Papéis em chats
CREATE TYPE member_role AS ENUM ('admin', 'member');

-- Tipos de mensagem
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'system');

-- Tipos de notificação
CREATE TYPE notification_type AS ENUM ('task_assigned', 'task_due', 'task_completed', 'task_overdue', 'message', 'system', 'reminder');

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'colaborador',
    sector VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de tarefas
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'pending',
    priority task_priority DEFAULT 'medium',
    sector VARCHAR(100) NOT NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    estimated_hours INTEGER, -- Tempo estimado em horas
    actual_hours INTEGER, -- Tempo real gasto
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB, -- Padrão de recorrência em JSON
    parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE, -- Para tarefas recorrentes
    tags TEXT[], -- Array de tags para categorização
    location VARCHAR(255), -- Local específico da tarefa
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de comentários das tarefas
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- Comentário interno (não visível para colaborador)
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de anexos das tarefas
CREATE TABLE task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de histórico de tarefas (para auditoria)
CREATE TABLE task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'completed', 'assigned', etc.
    old_values JSONB,
    new_values JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de chats/conversas
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    type chat_type NOT NULL,
    description TEXT,
    avatar_url TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de membros dos chats
CREATE TABLE chat_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role member_role DEFAULT 'member',
    is_muted BOOLEAN DEFAULT false,
    joined_at TIMESTAMP DEFAULT NOW(),
    last_read_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(chat_id, user_id)
);

-- Tabela de mensagens
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'text',
    reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
    file_url TEXT, -- Para anexos
    file_name VARCHAR(255), -- Nome do arquivo anexado
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de reações às mensagens
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Tabela de notificações
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    type notification_type NOT NULL,
    reference_id UUID, -- ID da tarefa, mensagem, etc.
    reference_type VARCHAR(50), -- 'task', 'message', 'user', etc.
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    expires_at TIMESTAMP, -- Para notificações temporárias
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de configurações do sistema
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de logs de atividade
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL, -- 'task', 'user', 'chat', etc.
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de sessões de usuário (para controle de acesso)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para usuários
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_sector ON users(sector);
CREATE INDEX idx_users_active ON users(is_active);

-- Índices para tarefas
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_sector ON tasks(sector);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_recurring ON tasks(is_recurring);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Índices compostos para consultas frequentes
CREATE INDEX idx_tasks_assigned_status ON tasks(assigned_to, status);
CREATE INDEX idx_tasks_sector_status ON tasks(sector, status);
CREATE INDEX idx_tasks_due_status ON tasks(due_date, status) WHERE status IN ('pending', 'in_progress');

-- Índices para chats e mensagens
CREATE INDEX idx_chat_members_user ON chat_members(user_id);
CREATE INDEX idx_chat_members_chat ON chat_members(chat_id);
CREATE INDEX idx_messages_chat ON messages(chat_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at);

-- Índices para notificações
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- TRIGGERS E FUNÇÕES
-- =====================================================

-- Função para atualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar histórico de tarefas
CREATE OR REPLACE FUNCTION create_task_history()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO task_history (task_id, user_id, action, new_values)
        VALUES (NEW.id, NEW.created_by, 'created', to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO task_history (task_id, user_id, action, old_values, new_values)
        VALUES (NEW.id, NEW.assigned_to, 'updated', to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger para histórico de tarefas
CREATE TRIGGER task_history_trigger
    AFTER INSERT OR UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION create_task_history();

-- Função para atualizar status de tarefas atrasadas
CREATE OR REPLACE FUNCTION update_overdue_tasks()
RETURNS void AS $$
BEGIN
    UPDATE tasks 
    SET status = 'overdue', updated_at = NOW()
    WHERE status IN ('pending', 'in_progress') 
    AND due_date < NOW() 
    AND due_date IS NOT NULL;
    
    -- Criar notificações para tarefas atrasadas
    INSERT INTO notifications (user_id, title, content, type, reference_id, reference_type)
    SELECT 
        t.assigned_to,
        'Tarefa Atrasada',
        'A tarefa "' || t.title || '" está atrasada.',
        'task_overdue',
        t.id,
        'task'
    FROM tasks t
    WHERE t.status = 'overdue' 
    AND t.assigned_to IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM notifications n 
        WHERE n.user_id = t.assigned_to 
        AND n.reference_id = t.id 
        AND n.type = 'task_overdue'
        AND n.created_at > NOW() - INTERVAL '1 day'
    );
END;
$$ language 'plpgsql';

-- Função para gerar tarefas recorrentes
CREATE OR REPLACE FUNCTION generate_recurring_tasks()
RETURNS void AS $$
DECLARE
    task_record RECORD;
    next_due_date TIMESTAMP;
BEGIN
    FOR task_record IN 
        SELECT * FROM tasks 
        WHERE is_recurring = true 
        AND status = 'completed'
        AND parent_task_id IS NULL
    LOOP
        -- Calcular próxima data baseada no padrão de recorrência
        -- Esta é uma implementação simplificada
        CASE (task_record.recurrence_pattern->>'type')
            WHEN 'daily' THEN
                next_due_date := task_record.due_date + INTERVAL '1 day' * (task_record.recurrence_pattern->>'interval')::integer;
            WHEN 'weekly' THEN
                next_due_date := task_record.due_date + INTERVAL '1 week' * (task_record.recurrence_pattern->>'interval')::integer;
            WHEN 'monthly' THEN
                next_due_date := task_record.due_date + INTERVAL '1 month' * (task_record.recurrence_pattern->>'interval')::integer;
            ELSE
                CONTINUE;
        END CASE;
        
        -- Verificar se já existe uma tarefa futura
        IF NOT EXISTS (
            SELECT 1 FROM tasks 
            WHERE parent_task_id = task_record.id 
            AND due_date >= NOW()
        ) THEN
            -- Criar nova tarefa recorrente
            INSERT INTO tasks (
                title, description, sector, assigned_to, created_by,
                due_date, priority, is_recurring, recurrence_pattern,
                parent_task_id, tags, location, estimated_hours
            ) VALUES (
                task_record.title, task_record.description, task_record.sector,
                task_record.assigned_to, task_record.created_by, next_due_date,
                task_record.priority, true, task_record.recurrence_pattern,
                task_record.id, task_record.tags, task_record.location,
                task_record.estimated_hours
            );
        END IF;
    END LOOP;
END;
$$ language 'plpgsql';

-- Função para atualizar último acesso ao chat
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chats 
    SET last_message_at = NEW.created_at
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar último acesso ao chat
CREATE TRIGGER update_chat_last_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_chat_last_message();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Managers can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'gerente'
        )
    );

CREATE POLICY "Supervisors can view users in their sector" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() 
            AND u.role = 'supervisor' 
            AND u.sector = users.sector
        )
    );

-- Políticas para tarefas
CREATE POLICY "Users can view relevant tasks" ON tasks
    FOR SELECT USING (
        assigned_to = auth.uid() OR 
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (
                role = 'gerente' OR 
                (role = 'supervisor' AND sector = tasks.sector)
            )
        )
    );

CREATE POLICY "Supervisors and managers can create tasks" ON tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('gerente', 'supervisor')
        )
    );

CREATE POLICY "Users can update their assigned tasks" ON tasks
    FOR UPDATE USING (
        assigned_to = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (
                role = 'gerente' OR 
                (role = 'supervisor' AND sector = tasks.sector)
            )
        )
    );

-- Políticas para mensagens
CREATE POLICY "Users can view messages from their chats" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_members 
            WHERE chat_id = messages.chat_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to their chats" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM chat_members 
            WHERE chat_id = messages.chat_id 
            AND user_id = auth.uid()
        )
    );

-- Políticas para notificações
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- JOBS AGENDADOS (CRON)
-- =====================================================

-- Job para atualizar tarefas atrasadas (executa a cada hora)
SELECT cron.schedule('update-overdue-tasks', '0 * * * *', 'SELECT update_overdue_tasks();');

-- Job para gerar tarefas recorrentes (executa diariamente às 6h)
SELECT cron.schedule('generate-recurring-tasks', '0 6 * * *', 'SELECT generate_recurring_tasks();');

-- Job para limpeza de notificações antigas (executa semanalmente)
SELECT cron.schedule('cleanup-old-notifications', '0 2 * * 0', 
    'DELETE FROM notifications WHERE created_at < NOW() - INTERVAL ''30 days'' AND is_read = true;'
);

-- Job para limpeza de logs antigos (executa mensalmente)
SELECT cron.schedule('cleanup-old-logs', '0 3 1 * *',
    'DELETE FROM activity_logs WHERE created_at < NOW() - INTERVAL ''90 days'';'
);

-- =====================================================
-- DADOS INICIAIS (SEEDS)
-- =====================================================

-- Configurações do sistema
INSERT INTO system_settings (key, value, description) VALUES
('task_auto_overdue_hours', '24', 'Horas após vencimento para marcar tarefa como atrasada'),
('notification_retention_days', '30', 'Dias para manter notificações lidas'),
('max_file_upload_size', '10485760', 'Tamanho máximo de upload em bytes (10MB)'),
('allowed_file_types', '["image/jpeg", "image/png", "application/pdf", "text/plain"]', 'Tipos de arquivo permitidos'),
('working_hours_start', '08:00', 'Horário de início do expediente'),
('working_hours_end', '18:00', 'Horário de fim do expediente'),
('default_task_priority', 'medium', 'Prioridade padrão para novas tarefas');

-- Setores padrão (pode ser customizado)
INSERT INTO users (id, email, name, role, sector, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@loja.com', 'Administrador', 'gerente', 'Administração', true);

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View para estatísticas de tarefas por usuário
CREATE VIEW user_task_stats AS
SELECT 
    u.id,
    u.name,
    u.sector,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_tasks,
    COUNT(CASE WHEN t.status = 'overdue' THEN 1 END) as overdue_tasks,
    ROUND(
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(t.id), 0), 2
    ) as completion_rate
FROM users u
LEFT JOIN tasks t ON u.id = t.assigned_to
WHERE u.is_active = true
GROUP BY u.id, u.name, u.sector;

-- View para estatísticas de tarefas por setor
CREATE VIEW sector_task_stats AS
SELECT 
    sector,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
    COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_tasks,
    ROUND(
        COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(*), 0), 2
    ) as completion_rate
FROM tasks
GROUP BY sector;

-- View para chats com informações resumidas
CREATE VIEW chat_summary AS
SELECT 
    c.id,
    c.name,
    c.type,
    c.created_at,
    COUNT(cm.user_id) as member_count,
    COUNT(m.id) as message_count,
    MAX(m.created_at) as last_message_at
FROM chats c
LEFT JOIN chat_members cm ON c.id = cm.chat_id
LEFT JOIN messages m ON c.id = m.chat_id AND m.is_deleted = false
WHERE c.is_active = true
GROUP BY c.id, c.name, c.type, c.created_at;

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

COMMENT ON TABLE users IS 'Tabela de usuários do sistema com diferentes papéis';
COMMENT ON TABLE tasks IS 'Tabela principal de tarefas com suporte a recorrência';
COMMENT ON TABLE chats IS 'Tabela de conversas/chats do sistema';
COMMENT ON TABLE messages IS 'Tabela de mensagens dos chats';
COMMENT ON TABLE notifications IS 'Tabela de notificações do sistema';

-- Este schema fornece uma base sólida para o sistema de gestão de tarefas
-- com recursos avançados como recorrência, chat em tempo real, notificações
-- e controle de permissões baseado em papéis.