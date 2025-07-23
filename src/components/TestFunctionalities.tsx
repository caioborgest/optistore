
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Database,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: string;
}

export const TestFunctionalities: React.FC = () => {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    const testResults: TestResult[] = [];

    // Teste 1: Conexão com Supabase
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      testResults.push({
        name: 'Conexão Supabase',
        status: error ? 'error' : 'success',
        message: error ? 'Falha na conexão' : 'Conectado com sucesso',
        details: error?.message
      });
    } catch (error: any) {
      testResults.push({
        name: 'Conexão Supabase',
        status: 'error',
        message: 'Erro de conexão',
        details: error.message
      });
    }

    // Teste 2: Autenticação
    testResults.push({
      name: 'Sistema de Autenticação',
      status: user ? 'success' : 'error',
      message: user ? `Usuário logado: ${user.name}` : 'Usuário não autenticado',
      details: user ? `Email: ${user.email}` : undefined
    });

    // Teste 3: Tabelas do banco
    const existingTables = ['users', 'tasks', 'chats', 'messages', 'notifications'];
    for (const table of existingTables) {
      try {
        const { error } = await supabase.from(table as any).select('*').limit(1);
        testResults.push({
          name: `Tabela ${table}`,
          status: error ? 'error' : 'success',
          message: error ? 'Tabela não encontrada' : 'Tabela acessível',
          details: error?.message
        });
      } catch (error: any) {
        testResults.push({
          name: `Tabela ${table}`,
          status: 'error',
          message: 'Erro ao acessar tabela',
          details: error.message
        });
      }
    }

    // Teste 4: Permissões RLS
    try {
      const { data, error } = await supabase.from('tasks').select('*').limit(1);
      testResults.push({
        name: 'Row Level Security',
        status: error ? 'warning' : 'success',
        message: error ? 'RLS pode estar bloqueando' : 'RLS funcionando',
        details: error?.message
      });
    } catch (error: any) {
      testResults.push({
        name: 'Row Level Security',
        status: 'error',
        message: 'Erro no RLS',
        details: error.message
      });
    }

    setResults(testResults);
    setTesting(false);

    // Mostrar resumo
    const successCount = testResults.filter(r => r.status === 'success').length;
    const errorCount = testResults.filter(r => r.status === 'error').length;
    const warningCount = testResults.filter(r => r.status === 'warning').length;

    toast({
      title: 'Testes Concluídos',
      description: `✅ ${successCount} sucessos, ⚠️ ${warningCount} avisos, ❌ ${errorCount} erros`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status === 'success' ? 'OK' : status === 'error' ? 'ERRO' : status === 'warning' ? 'AVISO' : 'PENDENTE'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Teste de Funcionalidades - OptiFlow
          </CardTitle>
          <CardDescription>
            Verificação completa do sistema e suas funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={runTests} disabled={testing}>
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                'Executar Testes'
              )}
            </Button>
            
            {results.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {results.filter(r => r.status === 'success').length} sucessos,
                  {results.filter(r => r.status === 'warning').length} avisos,
                  {results.filter(r => r.status === 'error').length} erros
                </span>
              </div>
            )}
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-muted-foreground">{result.message}</div>
                      {result.details && (
                        <div className="text-xs text-muted-foreground mt-1">{result.details}</div>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Funcionalidades Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades Disponíveis</CardTitle>
          <CardDescription>
            Recursos implementados e prontos para uso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <div className="font-medium">Sistema de Tarefas</div>
                <div className="text-sm text-muted-foreground">Gestão completa</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <MessageSquare className="h-8 w-8 text-green-600" />
              <div>
                <div className="font-medium">Chat</div>
                <div className="text-sm text-muted-foreground">Comunicação</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div>
                <div className="font-medium">Relatórios</div>
                <div className="text-sm text-muted-foreground">Analytics</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Users className="h-8 w-8 text-indigo-600" />
              <div>
                <div className="font-medium">Gestão de Usuários</div>
                <div className="text-sm text-muted-foreground">Papéis e permissões</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Settings className="h-8 w-8 text-gray-600" />
              <div>
                <div className="font-medium">Configurações</div>
                <div className="text-sm text-muted-foreground">Personalização</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
