
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { integrationService, Integration as IntegrationData } from '@/services/integrationService';
import { 
  Settings, 
  Zap, 
  Database, 
  ShoppingCart, 
  BarChart3,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';

interface Integration extends IntegrationData {
  icon: React.ReactNode;
  description?: string;
}

export const IntegrationManager: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await integrationService.getIntegrations();
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Mapear dados para incluir ícones
      const integrationsWithIcons = data.map(integration => ({
        ...integration,
        icon: getIconForType(integration.type),
        description: getDescriptionForType(integration.type, integration.name)
      }));
      
      setIntegrations(integrationsWithIcons);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar integrações');
      console.error('Erro ao carregar integrações:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'erp': return <Database className="h-5 w-5" />;
      case 'ecommerce': return <ShoppingCart className="h-5 w-5" />;
      case 'crm': return <Users className="h-5 w-5" />;
      case 'bi': return <BarChart3 className="h-5 w-5" />;
      case 'payment': return <Zap className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const getDescriptionForType = (type: string, name: string) => {
    switch (type.toLowerCase()) {
      case 'erp': return `Integração com sistema ${name} para sincronização de dados`;
      case 'ecommerce': return `Integração com loja ${name} para produtos e pedidos`;
      case 'crm': return `Integração com CRM ${name} para gestão de clientes`;
      case 'bi': return `Integração com ${name} para relatórios avançados`;
      case 'payment': return `Integração com gateway de pagamento ${name}`;
      default: return `Integração com ${name}`;
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive': return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusLabel = (status: Integration['status']) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'error': return 'Erro';
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'error': return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const getTypeIcon = (type: Integration['type']) => {
    switch (type) {
      case 'erp': return <Database className="h-4 w-4" />;
      case 'ecommerce': return <ShoppingCart className="h-4 w-4" />;
      case 'crm': return <Users className="h-4 w-4" />;
      case 'bi': return <BarChart3 className="h-4 w-4" />;
      case 'payment': return <Zap className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const handleTestConnection = async (integration: Integration) => {
    setTestResult(null);
    
    try {
      // Testar conexão com a integração
      const { data, error } = await integrationService.syncData(integration.id);
      
      if (error) {
        setTestResult(`Erro: ${error.message || 'Não foi possível conectar ao servidor'}`);
      } else {
        setTestResult('Conexão estabelecida com sucesso!');
      }
    } catch (err: any) {
      setTestResult(`Erro: ${err.message || 'Ocorreu um erro ao testar a conexão'}`);
    }
  };

  const handleSync = async (integration: Integration) => {
    try {
      // Sincronizar dados da integração
      const { data, error } = await integrationService.syncData(integration.id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Atualizar a lista de integrações para refletir a sincronização
      await fetchIntegrations();
    } catch (err: any) {
      console.error(`Erro ao sincronizar ${integration.name}:`, err);
      setTestResult(`Erro na sincronização: ${err.message}`);
    }
  };

  const handleToggleStatus = async (integration: Integration) => {
    try {
      const newStatus = integration.status === 'active' ? 'inactive' : 'active';
      
      // Atualizar status da integração
      const { data, error } = await integrationService.updateIntegration(
        integration.id, 
        { status: newStatus }
      );
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Atualizar a lista de integrações
      await fetchIntegrations();
    } catch (err: any) {
      console.error(`Erro ao alterar status de ${integration.name}:`, err);
      setTestResult(`Erro ao alterar status: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciador de Integrações</h2>
          <p className="text-muted-foreground">
            Configure e gerencie integrações com sistemas externos
          </p>
        </div>
        <Button onClick={() => setIsConfiguring(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Integração
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando integrações...</span>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="active">Ativas</TabsTrigger>
            <TabsTrigger value="inactive">Inativas</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{integrations.length}</p>
                  </div>
                  <Settings className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ativas</p>
                    <p className="text-2xl font-bold">
                      {integrations.filter(i => i.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Com Erro</p>
                    <p className="text-2xl font-bold">
                      {integrations.filter(i => i.status === 'error').length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {integration.icon}
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(integration.status)} variant="outline">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(integration.status)}
                        {getStatusLabel(integration.status)}
                      </div>
                    </Badge>
                  </div>
                  <CardDescription>{integration.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tipo:</span>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(integration.type)}
                        <span className="text-sm capitalize">{integration.type}</span>
                      </div>
                    </div>
                    
                    {integration.lastSync && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Última sincronização:</span>
                        <span className="text-sm">
                          {new Date(integration.lastSync).toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2">
                      <Switch 
                        checked={integration.status === 'active'}
                        onCheckedChange={() => handleToggleStatus(integration)}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestConnection(integration)}
                        >
                          Testar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSync(integration)}
                          disabled={integration.status !== 'active'}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Sincronizar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="space-y-4">
            {integrations.filter(i => i.status === 'active').map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {integration.icon}
                      <CardTitle>{integration.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(integration.status)} variant="outline">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(integration.status)}
                        {getStatusLabel(integration.status)}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{integration.description}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleSync(integration)}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sincronizar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3 mr-1" />
                      Configurar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inactive">
          <div className="space-y-4">
            {integrations.filter(i => i.status !== 'active').map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {integration.icon}
                      <CardTitle>{integration.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(integration.status)} variant="outline">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(integration.status)}
                        {getStatusLabel(integration.status)}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{integration.description}</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleStatus(integration)}
                    >
                      Ativar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3 mr-1" />
                      Configurar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Integração</CardTitle>
              <CardDescription>
                Histórico de sincronizações e eventos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Logs detalhados serão implementados na próxima versão
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}

      {testResult && (
        <Alert className={testResult.includes('Erro') ? 'border-red-200' : 'border-green-200'}>
          <AlertDescription>{testResult}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
