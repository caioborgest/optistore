-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'employee',
  sector TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  sector TEXT NOT NULL,
  assignee_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  recurring TEXT CHECK (recurring IN ('daily', 'weekly', 'monthly')),
  comments_count INTEGER DEFAULT 0,
  attachments_count INTEGER DEFAULT 0
);

-- Create calendar_events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  type TEXT NOT NULL DEFAULT 'task' CHECK (type IN ('meeting', 'task', 'training', 'report')),
  sector TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  attendees UUID[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'group' CHECK (type IN ('direct', 'group')),
  sector TEXT,
  members UUID[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_comments table
CREATE TABLE public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for tasks
CREATE POLICY "Users can view all tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Users can create tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Users can delete tasks" ON public.tasks FOR DELETE USING (true);

-- Create RLS policies for calendar events
CREATE POLICY "Users can view all calendar events" ON public.calendar_events FOR SELECT USING (true);
CREATE POLICY "Users can create calendar events" ON public.calendar_events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update calendar events" ON public.calendar_events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete calendar events" ON public.calendar_events FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for chat conversations
CREATE POLICY "Users can view conversations they are members of" ON public.chat_conversations FOR SELECT USING (auth.uid() = ANY(members));
CREATE POLICY "Users can create conversations" ON public.chat_conversations FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update conversations they created" ON public.chat_conversations FOR UPDATE USING (auth.uid() = created_by);

-- Create RLS policies for chat messages
CREATE POLICY "Users can view messages in conversations they are members of" ON public.chat_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations 
    WHERE id = conversation_id AND auth.uid() = ANY(members)
  )
);
CREATE POLICY "Users can create messages in conversations they are members of" ON public.chat_messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_conversations 
    WHERE id = conversation_id AND auth.uid() = ANY(members)
  ) AND auth.uid() = sender_id
);

-- Create RLS policies for task comments
CREATE POLICY "Users can view all task comments" ON public.task_comments FOR SELECT USING (true);
CREATE POLICY "Users can create task comments" ON public.task_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', new.email));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.profiles (user_id, name, role, sector) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin', 'Administração'),
  ('00000000-0000-0000-0000-000000000002', 'João Silva', 'employee', 'Estoque'),
  ('00000000-0000-0000-0000-000000000003', 'Maria Santos', 'employee', 'Vendas'),
  ('00000000-0000-0000-0000-000000000004', 'Pedro Costa', 'employee', 'Limpeza'),
  ('00000000-0000-0000-0000-000000000005', 'Ana Lima', 'employee', 'Vendas');

-- Insert sample tasks
INSERT INTO public.tasks (title, description, status, priority, sector, due_date, assignee_id) VALUES
  ('Organizar setor de tintas', 'Reorganizar prateleiras e conferir validade dos produtos', 'completed', 'medium', 'Tintas', '2024-01-15', '00000000-0000-0000-0000-000000000002'),
  ('Conferir estoque de cimento', 'Verificar quantidades e condições de armazenamento', 'in_progress', 'high', 'Materiais', '2024-01-16', '00000000-0000-0000-0000-000000000003'),
  ('Limpeza área externa', 'Varrer e organizar área de carga/descarga', 'overdue', 'low', 'Limpeza', '2024-01-14', '00000000-0000-0000-0000-000000000004'),
  ('Atualizar tabela de preços', 'Revisar preços de ferramentas conforme fornecedores', 'pending', 'medium', 'Vendas', '2024-01-18', '00000000-0000-0000-0000-000000000005');

-- Insert sample calendar events
INSERT INTO public.calendar_events (title, start_date, type, sector, priority, created_by) VALUES
  ('Reunião de equipe', '2024-01-15 09:00:00+00', 'meeting', 'Geral', 'high', '00000000-0000-0000-0000-000000000001'),
  ('Treinamento de vendas', '2024-01-16 14:00:00+00', 'training', 'Vendas', 'high', '00000000-0000-0000-0000-000000000001'),
  ('Relatório mensal', '2024-01-18 16:00:00+00', 'report', 'Administração', 'medium', '00000000-0000-0000-0000-000000000001');

-- Insert sample chat conversations
INSERT INTO public.chat_conversations (name, type, sector, members, created_by) VALUES
  ('Equipe Vendas', 'group', 'Vendas', ARRAY['00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005'], '00000000-0000-0000-0000-000000000001'),
  ('Setor Limpeza', 'group', 'Limpeza', ARRAY['00000000-0000-0000-0000-000000000004'], '00000000-0000-0000-0000-000000000001');