
-- Limpar dados existentes se necessário
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.task_status CASCADE;
DROP TYPE IF EXISTS public.task_priority CASCADE;
DROP TYPE IF EXISTS public.chat_type CASCADE;
DROP TYPE IF EXISTS public.member_role CASCADE;
DROP TYPE IF EXISTS public.message_type CASCADE;
DROP TYPE IF EXISTS public.notification_type CASCADE;

-- Criar tipos enumerados
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'employee');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.chat_type AS ENUM ('direct', 'group', 'sector', 'task');
CREATE TYPE public.member_role AS ENUM ('admin', 'member');
CREATE TYPE public.message_type AS ENUM ('text', 'image', 'file', 'system');
CREATE TYPE public.notification_type AS ENUM ('task_assigned', 'task_due', 'task_completed', 'task_overdue', 'message', 'system', 'reminder');

-- Atualizar tabela de usuários
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role public.user_role DEFAULT 'employee';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS sector text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login timestamp with time zone;

-- Atualizar tabela de tarefas
ALTER TABLE public.tasks ALTER COLUMN status TYPE public.task_status USING status::text::public.task_status;
ALTER TABLE public.tasks ALTER COLUMN priority TYPE public.task_priority USING priority::text::public.task_priority;

-- Atualizar tabela de chats
ALTER TABLE public.chats ALTER COLUMN type TYPE public.chat_type USING type::text::public.chat_type;

-- Atualizar tabela de membros do chat
ALTER TABLE public.chat_members ALTER COLUMN role TYPE public.member_role USING role::text::public.member_role;

-- Atualizar tabela de mensagens
ALTER TABLE public.messages ALTER COLUMN message_type TYPE public.message_type USING message_type::text::public.message_type;

-- Atualizar tabela de notificações
ALTER TABLE public.notifications ALTER COLUMN type TYPE public.notification_type USING type::text::public.notification_type;

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON public.tasks 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_chats_updated_at ON public.chats;
CREATE TRIGGER update_chats_updated_at 
    BEFORE UPDATE ON public.chats 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuários
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view colleagues from same company" ON public.users;
CREATE POLICY "Users can view colleagues from same company" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.company_id = users.company_id
        )
    );

-- Políticas RLS para tarefas
DROP POLICY IF EXISTS "Users can view relevant tasks" ON public.tasks;
CREATE POLICY "Users can view relevant tasks" ON public.tasks
    FOR SELECT USING (
        assigned_to = auth.uid() OR 
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'manager')
        )
    );

DROP POLICY IF EXISTS "Managers can create tasks" ON public.tasks;
CREATE POLICY "Managers can create tasks" ON public.tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'manager')
        )
    );

DROP POLICY IF EXISTS "Users can update relevant tasks" ON public.tasks;
CREATE POLICY "Users can update relevant tasks" ON public.tasks
    FOR UPDATE USING (
        assigned_to = auth.uid() OR
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'manager')
        )
    );

-- Políticas RLS para chats
DROP POLICY IF EXISTS "Users can view chats they are members of" ON public.chats;
CREATE POLICY "Users can view chats they are members of" ON public.chats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_members 
            WHERE chat_id = chats.id 
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
CREATE POLICY "Users can create chats" ON public.chats
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- Políticas RLS para mensagens
DROP POLICY IF EXISTS "Users can view messages from their chats" ON public.messages;
CREATE POLICY "Users can view messages from their chats" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_members 
            WHERE chat_id = messages.chat_id 
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can send messages to their chats" ON public.messages;
CREATE POLICY "Users can send messages to their chats" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.chat_members 
            WHERE chat_id = messages.chat_id 
            AND user_id = auth.uid()
        )
    );

-- Políticas RLS para notificações
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_members;

-- Inserir dados de exemplo
INSERT INTO public.companies (id, name, email, invite_code, is_active)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Empresa Demo',
    'admin@empresademo.com',
    'DEMO2024',
    true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, name, email, company_id, role, sector, is_active, is_company_admin)
VALUES (
    'a4b41d37-cc17-466b-9af4-6427e1f6e790',
    'Administrador',
    'admin@empresademo.com',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'admin',
    'Administração',
    true,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    company_id = EXCLUDED.company_id,
    role = EXCLUDED.role,
    sector = EXCLUDED.sector,
    is_active = EXCLUDED.is_active,
    is_company_admin = EXCLUDED.is_company_admin;
