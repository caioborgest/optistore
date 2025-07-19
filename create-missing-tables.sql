-- =====================================================
-- CRIAR APENAS TABELAS QUE NÃO EXISTEM
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CRIAR TIPOS ENUMERADOS SE NÃO EXISTIREM
-- =====================================================

-- Verificar e criar tipos se não existirem
DO $$ 
BEGIN
    -- Papéis de usuário
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('gerente', 'supervisor', 'colaborador');
    END IF;

    -- Status das tarefas
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue', 'cancelled');
    END IF;

    -- Prioridades das tarefas
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
    END IF;

    -- Tipos de chat
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chat_type') THEN
        CREATE TYPE chat_type AS ENUM ('direct', 'group', 'sector', 'task');
    END IF;

    -- Papéis em chats
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_role') THEN
        CREATE TYPE member_role AS ENUM ('admin', 'member');
    END IF;

    -- Tipos de mensagem
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type') THEN
        CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'system');
    END IF;

    -- Tipos de notificação
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('task_assigned', 'task_due', 'task_completed', 'task_overdue', 'message', 'system', 'reminder');
    END IF;
END $$;

-- =====================================================
-- CRIAR TABELAS SE NÃO EXISTIREM
-- =====================================================

-- Tabela de empresas
CREATE TABLE IF NOT EXISTS public.companies (
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

-- Verificar se a tabela users já tem a coluna company_id
DO $$ 
BEGIN
    -- Adicionar coluna company_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'company_id'
    ) THEN
        ALTER TABLE public.users ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;

    -- Adicionar coluna is_company_admin se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'is_company_admin'
    ) THEN
        ALTER TABLE public.users ADD COLUMN is_company_admin BOOLEAN DEFAULT false;
    END IF;

    -- Adicionar constraint unique se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND constraint_name = 'users_company_id_email_key'
    ) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_company_id_email_key UNIQUE(company_id, email);
    END IF;
END $$;

-- Tabela de tarefas
CREATE TABLE IF NOT EXISTS public.tasks (
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
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de anexos das tarefas
CREATE TABLE IF NOT EXISTS public.task_attachments (
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
CREATE TABLE IF NOT EXISTS public.chats (
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
CREATE TABLE IF NOT EXISTS public.chat_members (
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
CREATE TABLE IF NOT EXISTS public.messages (
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
CREATE TABLE IF NOT EXISTS public.notifications (
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
-- CRIAR ÍNDICES SE NÃO EXISTIREM
-- =====================================================

-- Índices para empresas
CREATE INDEX IF NOT EXISTS idx_companies_invite_code ON public.companies(invite_code);
CREATE INDEX IF NOT EXISTS idx_companies_email ON public.companies(email);
CREATE INDEX IF NOT EXISTS idx_companies_active ON public.companies(is_active);

-- Índices para usuários
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_sector ON public.users(sector);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);

-- =====================================================
-- CRIAR FUNÇÕES E TRIGGERS SE NÃO EXISTIREM
-- =====================================================

-- Função para atualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

-- Triggers para updated_at (DROP IF EXISTS para recriar)
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chats_updated_at ON public.chats;
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CONFIGURAR RLS E POLÍTICAS
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

-- Remover políticas existentes e criar novas
DROP POLICY IF EXISTS "Allow company registration" ON public.companies;
DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
DROP POLICY IF EXISTS "Company admins can update their company" ON public.companies;

-- Políticas para empresas (temporariamente permissivas)
CREATE POLICY "Allow company operations" ON public.companies
    FOR ALL USING (true) WITH CHECK (true);

-- Remover políticas existentes para users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view colleagues from same company" ON public.users;

-- Políticas para usuários (temporariamente permissivas)
CREATE POLICY "Allow user operations" ON public.users
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas básicas para outras tabelas
CREATE POLICY IF NOT EXISTS "Allow task operations" ON public.tasks
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow notification operations" ON public.notifications
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- HABILITAR REALTIME
-- =====================================================

-- Habilitar realtime para as tabelas necessárias
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_members;

-- =====================================================
-- VERIFICAR RESULTADO
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'companies' THEN '✅ ESSENCIAL para registro'
        WHEN table_name = 'users' THEN '✅ Atualizada com company_id'
        ELSE '✅ Criada'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('companies', 'users', 'tasks', 'chats', 'messages', 'notifications', 'task_comments', 'task_attachments', 'chat_members')
ORDER BY table_name;

-- Verificar estrutura da tabela companies
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'companies'
ORDER BY ordinal_position;

-- Verificar se users tem company_id
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
AND column_name IN ('company_id', 'is_company_admin')
ORDER BY column_name;

-- Mensagem de sucesso
SELECT '🎉 SETUP CONCLUÍDO! Agora teste o registro de empresa na aplicação.' as resultado;