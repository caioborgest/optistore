-- =====================================================
-- CRIAR APENAS TABELAS QUE NÃO EXISTEM - VERSÃO CORRIGIDA
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
-- CRIAR TABELA COMPANIES (ESSENCIAL)
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

-- =====================================================
-- ATUALIZAR TABELA USERS EXISTENTE
-- =====================================================

-- Verificar se a tabela users já tem as colunas necessárias
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
END $$;

-- =====================================================
-- CRIAR OUTRAS TABELAS SE NÃO EXISTIREM
-- =====================================================

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
    last_read_at TIMESTAMP DEFAULT NOW()
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

-- =====================================================
-- CONFIGURAR RLS E POLÍTICAS TEMPORÁRIAS
-- =====================================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Allow company registration" ON public.companies;
DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
DROP POLICY IF EXISTS "Company admins can update their company" ON public.companies;
DROP POLICY IF EXISTS "Allow company operations" ON public.companies;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view colleagues from same company" ON public.users;
DROP POLICY IF EXISTS "Allow user operations" ON public.users;

-- Políticas temporárias MUITO PERMISSIVAS (apenas para teste)
CREATE POLICY "temp_allow_all_companies" ON public.companies
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "temp_allow_all_users" ON public.users
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- VERIFICAR RESULTADO
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'companies' THEN '✅ ESSENCIAL - Tabela criada!'
        WHEN table_name = 'users' THEN '✅ Atualizada com company_id'
        ELSE '✅ Criada com sucesso'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('companies', 'users', 'tasks', 'chats', 'messages', 'notifications', 'task_comments', 'task_attachments', 'chat_members')
ORDER BY 
    CASE 
        WHEN table_name = 'companies' THEN 1
        WHEN table_name = 'users' THEN 2
        ELSE 3
    END,
    table_name;

-- Verificar estrutura da tabela companies
SELECT 
    '🏢 ESTRUTURA DA TABELA COMPANIES:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'companies'
ORDER BY ordinal_position;

-- Verificar se users tem as novas colunas
SELECT 
    '👤 NOVAS COLUNAS NA TABELA USERS:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
AND column_name IN ('company_id', 'is_company_admin')
ORDER BY column_name;

-- Verificar políticas RLS
SELECT 
    '🔒 POLÍTICAS RLS ATIVAS:' as info,
    schemaname,
    tablename, 
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('companies', 'users')
ORDER BY tablename, policyname;

-- Mensagem final
SELECT '🎉 SETUP CONCLUÍDO COM SUCESSO! 
✅ Tabela companies criada
✅ Tabela users atualizada  
✅ Políticas RLS configuradas
🚀 AGORA TESTE O REGISTRO DE EMPRESA!' as resultado;