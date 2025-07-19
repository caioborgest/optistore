-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA REGISTRO DE EMPRESA
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. Verificar políticas atuais
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('companies', 'users')
ORDER BY tablename, policyname;

-- 2. Remover política restritiva atual para companies
DROP POLICY IF EXISTS "Anyone can view companies for invite code validation" ON public.companies;
DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
DROP POLICY IF EXISTS "Company admins can update their company" ON public.companies;

-- 3. Criar política temporária mais permissiva para registro
CREATE POLICY "Allow company registration and validation" ON public.companies
    FOR ALL USING (true) WITH CHECK (true);

-- 4. Verificar se a tabela companies existe e tem a estrutura correta
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'companies'
ORDER BY ordinal_position;

-- 5. Verificar se há dados na tabela companies
SELECT COUNT(*) as total_companies FROM public.companies;

-- 6. Testar inserção manual (substitua pelos dados reais)
-- INSERT INTO public.companies (name, email, invite_code, phone, address)
-- VALUES ('Teste Empresa', 'teste@empresa.com', 'TEST1234', '11999999999', 'Rua Teste, 123');

-- 7. Verificar políticas para users
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- 8. Criar política mais permissiva para inserção de usuários durante registro
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view colleagues from same company" ON public.users;

CREATE POLICY "Allow user operations" ON public.users
    FOR ALL USING (true) WITH CHECK (true);

-- 9. Verificar se auth.users está funcionando
SELECT auth.uid() as current_user_id;

-- 10. Verificar configuração de RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('companies', 'users') 
AND schemaname = 'public';

-- 11. Temporariamente desabilitar RLS para teste (CUIDADO!)
-- ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 12. Para reabilitar RLS depois dos testes
-- ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Execute as seções 1-8 primeiro
-- 2. Teste o registro de empresa na aplicação
-- 3. Se ainda não funcionar, execute a seção 11 (desabilitar RLS temporariamente)
-- 4. Teste novamente
-- 5. Se funcionar, reabilite RLS com a seção 12 e ajuste as políticas

-- =====================================================
-- POLÍTICAS FINAIS RECOMENDADAS (após os testes)
-- =====================================================

/*
-- Política para companies (mais restritiva)
DROP POLICY IF EXISTS "Allow company registration and validation" ON public.companies;

CREATE POLICY "Allow company registration" ON public.companies
    FOR INSERT WITH CHECK (true);

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

-- Política para users (mais restritiva)
DROP POLICY IF EXISTS "Allow user operations" ON public.users;

CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view colleagues from same company" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users current_user
            WHERE current_user.id = auth.uid()
            AND current_user.company_id = users.company_id
        )
    );

CREATE POLICY "Allow user registration" ON public.users
    FOR INSERT WITH CHECK (true);
*/