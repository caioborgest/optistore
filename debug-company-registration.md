# Debug: Erro no Registro de Empresa

## Problema Identificado
O erro "Erro ao registrar empresa" está ocorrendo no deploy do Vercel. Possíveis causas:

## 1. Verificar Variáveis de Ambiente no Vercel

Certifique-se de que as seguintes variáveis estão configuradas no Vercel:

```
VITE_SUPABASE_URL=https://oepfwjtxvskkynhzxzhw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcGZ3anR4dnNra3luaHp4emh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MzUwMzMsImV4cCI6MjA2MzExMTAzM30.mV6dUpJNzhlcPTo3Lpcz0FDAwt0kYtLXmh4S5zOVX5w
```

## 2. Verificar Políticas RLS no Supabase

Execute no SQL Editor do Supabase:

```sql
-- Verificar se as políticas estão ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('companies', 'users');

-- Temporariamente permitir INSERT em companies (APENAS PARA TESTE)
DROP POLICY IF EXISTS "Anyone can view companies for invite code validation" ON public.companies;
CREATE POLICY "Allow company registration" ON public.companies
    FOR ALL USING (true) WITH CHECK (true);
```

## 3. Verificar Logs de Erro

Adicione logs detalhados no CompanyService:

```typescript
static async registerCompany(data: CompanyRegistration): Promise<{ company: Company | null; error: any }> {
  try {
    console.log('Iniciando registro de empresa:', data);
    
    // ... resto do código
    
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: data.name,
        email: data.email,
        invite_code: inviteCode,
        phone: data.phone,
        address: data.address
      })
      .select()
      .single();

    console.log('Resultado da inserção da empresa:', { company, companyError });
    
    if (companyError) {
      console.error('Erro detalhado:', companyError);
      return { company: null, error: companyError };
    }
    
    // ... resto do código
  } catch (error) {
    console.error('Erro geral:', error);
    return { company: null, error };
  }
}
```

## 4. Testar Conexão com Supabase

Adicione um teste simples no início da função:

```typescript
// Teste de conexão
const { data: testData, error: testError } = await supabase
  .from('companies')
  .select('count')
  .limit(1);

console.log('Teste de conexão:', { testData, testError });
```

## 5. Verificar CORS no Supabase

1. Vá para o painel do Supabase
2. Settings > API
3. Adicione o domínio do Vercel em "CORS origins"

## 6. Solução Temporária - Política Mais Permissiva

Execute no Supabase SQL Editor:

```sql
-- Política temporária mais permissiva para companies
DROP POLICY IF EXISTS "Anyone can view companies for invite code validation" ON public.companies;
CREATE POLICY "Allow all operations on companies" ON public.companies
    FOR ALL USING (true) WITH CHECK (true);

-- Verificar se auth.users está funcionando
SELECT auth.uid();
```

## 7. Verificar se o Schema foi Aplicado

Execute no Supabase SQL Editor:

```sql
-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('companies', 'users');

-- Verificar estrutura da tabela companies
\d public.companies;
```

## Próximos Passos

1. Verificar variáveis de ambiente no Vercel
2. Aplicar política temporária mais permissiva
3. Verificar logs no console do navegador
4. Testar novamente o registro
5. Ajustar políticas RLS conforme necessário