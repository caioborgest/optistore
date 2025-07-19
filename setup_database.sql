-- =====================================================
-- SETUP INICIAL PARA SUPABASE - SISTEMA DE GESTÃO DE TAREFAS
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Tabela de empresas
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    logo_url TEXT,
    address TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de usuários (estende auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'colaborador',
    sector VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_company_admin BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, email)
);

-- Tabela de tarefas
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'pending',
    priority task_priority DEFAULT 'medium',
    sector VARCHAR(100) NOT NULL,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB,
    parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    tags TEXT[],
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de comentários das tarefas
CREATE TABLE public.task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de anexos das tarefas
CREATE TABLE public.task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de chats/conversas
CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    type chat_type NOT NULL,
    description TEXT,
    avatar_url TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de membros dos chats
CREATE TABLE public.chat_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role member_role DEFAULT 'member',
    is_muted BOOLEAN DEFAULT false,
    joined_at TIMESTAMP DEFAULT NOW(),
    last_read_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(chat_id, user_id)
);

-- Tabela de mensagens
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'text',
    reply_to UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    file_url TEXT,
    file_name VARCHAR(255),
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de notificações
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    type notification_type NOT NULL,
    reference_id UUID,
    reference_type VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para empresas
CREATE INDEX idx_companies_invite_code ON public.companies(invite_code);
CREATE INDEX idx_companies_email ON public.companies(email);
CREATE INDEX idx_companies_active ON public.companies(is_active);

-- Índices para usuários
CREATE INDEX idx_users_company_id ON public.users(company_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_sector ON public.users(sector);
CREATE INDEX idx_users_active ON public.users(is_active);

-- Índices para tarefas
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_sector ON public.tasks(sector);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at);

-- Índices para chats e mensagens
CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_chat_members_user_id ON public.chat_members(user_id);

-- Índices para notificações
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

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
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para empresas
CREATE POLICY "Users can view their company" ON public.companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.company_id = companies.id 
            AND users.id = auth.uid()
        )
    );

CREATE POLICY "Company admins can update their company" ON public.companies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.company_id = companies.id 
            AND users.id = auth.uid()
            AND users.is_company_admin = true
        )
    );

CREATE POLICY "Anyone can view companies for invite code validation" ON public.companies
    FOR SELECT USING (true);

-- Políticas para usuários
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view colleagues from same company" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.company_id = users.company_id
        )
    );

-- Políticas para tarefas
CREATE POLICY "Users can view relevant tasks" ON public.tasks
    FOR SELECT USING (
        assigned_to = auth.uid() OR 
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (
                role = 'gerente' OR 
                (role = 'supervisor' AND sector = tasks.sector)
            )
        )
    );

CREATE POLICY "Supervisors and managers can create tasks" ON public.tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('gerente', 'supervisor')
        )
    );

CREATE POLICY "Users can update relevant tasks" ON public.tasks
    FOR UPDATE USING (
        assigned_to = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (
                role = 'gerente' OR 
                (role = 'supervisor' AND sector = tasks.sector)
            )
        )
    );

-- Políticas para comentários de tarefas
CREATE POLICY "Users can view task comments" ON public.task_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = task_comments.task_id
            AND (
                t.assigned_to = auth.uid() OR 
                t.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.users u
                    WHERE u.id = auth.uid() 
                    AND (
                        u.role = 'gerente' OR 
                        (u.role = 'supervisor' AND u.sector = t.sector)
                    )
                )
            )
        )
    );

CREATE POLICY "Users can create task comments" ON public.task_comments
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = task_comments.task_id
            AND (
                t.assigned_to = auth.uid() OR 
                t.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.users u
                    WHERE u.id = auth.uid() 
                    AND (
                        u.role = 'gerente' OR 
                        (u.role = 'supervisor' AND u.sector = t.sector)
                    )
                )
            )
        )
    );

-- Políticas para chats
CREATE POLICY "Users can view chats they are members of" ON public.chats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_members 
            WHERE chat_id = chats.id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create chats" ON public.chats
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- Políticas para membros de chat
CREATE POLICY "Users can view chat members" ON public.chat_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.chat_members cm
            WHERE cm.chat_id = chat_members.chat_id 
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join chats" ON public.chat_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Políticas para mensagens
CREATE POLICY "Users can view messages from their chats" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_members 
            WHERE chat_id = messages.chat_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to their chats" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.chat_members 
            WHERE chat_id = messages.chat_id 
            AND user_id = auth.uid()
        )
    );

-- Políticas para notificações
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- DADOS INICIAIS (SEEDS)
-- =====================================================

-- Inserir usuário administrador padrão
-- NOTA: Este usuário deve ser criado via Supabase Auth primeiro
-- Depois execute: INSERT INTO public.users (id, email, name, role, sector) 
-- VALUES ('seu-uuid-aqui', 'admin@loja.com', 'Administrador', 'gerente', 'Administração');

-- =====================================================
-- HABILITAR REALTIME
-- =====================================================

-- Habilitar realtime para as tabelas necessárias
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_members;

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

-- Este script configura a estrutura básica do banco de dados
-- Para usar a aplicação:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Configure as variáveis de ambiente no frontend
-- 3. Crie usuários via Supabase Auth
-- 4. Insira os perfis de usuário na tabela users

COMMENT ON TABLE public.users IS 'Perfis de usuários do sistema';
COMMENT ON TABLE public.tasks IS 'Tarefas do sistema com suporte a recorrência';
COMMENT ON TABLE public.chats IS 'Conversas/chats do sistema';
COMMENT ON TABLE public.messages IS 'Mensagens dos chats';
COMMENT ON TABLE public.notifications IS 'Notificações do sistema';