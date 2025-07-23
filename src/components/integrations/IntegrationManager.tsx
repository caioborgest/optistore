
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Trash2
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: 'erp' | 'ecommerce' | 'crm' | 'bi' | 'payment' | 'other';
  status: 'active' | 'inactive' | 'error';
  description: string;
  icon: React.ReactNode;
  config: Record<string, any>;
  lastSync?: string;
}

export const IntegrationManager: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    // Mock data - será substituído pela integração real
    const mockIntegrations: Integration[] = [
      {
        id: '1',
        name: 'SAP ERP',
        type: 'erp',
        status: 'active',
        description: 'Integração com sistema SAP para sincronização de dados',
        icon: <Database className="h-5 w-5" />,
        config: {
          serverUrl: 'https://sap.empresa.com',
          username: 'admin',
          syncFrequency: '1h'
        },
        lastSync: '2024-02-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'Shopify',
        type: 'ecommerce',
        status: 'inactive',
        description: 'Integração com loja Shopify para produtos e pedidos',
        icon: <ShoppingCart className="h-5 w-5" />,
        config: {
          storeUrl: 'https://loja.myshopify.com',
          apiKey: '***hidden***',
          webhookUrl: 'https://api.optiflow.com/webhooks/shopify'
        }
      },
      {
        id: '3',
        name: 'Power BI',
        type: 'bi',
        status: 'error',
        description: 'Integração com Power BI para relatórios avançados',
        icon: <BarChart3 className="h-5 w-5" />,
        config: {
          tenantId: '***hidden***',
          clientId: '***hidden***',
          workspaceId: '***hidden***'
        }
      }
    ];
    
    setIntegrations(mockIntegrations);
  }, []);

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
    // Simulação de teste
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (integration.status === 'error') {
      setTestResult('Erro: Não foi possível conectar ao servidor');
    } else {
      setTestResult('Conexão estabelecida com sucesso!');
    }
  };

  const handleSync = async (integration: Integration) => {
    // Simulação de sincronização
    console.log(`Sincronizando ${integration.name}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Atualizar lastSync
    setIntegrations(prev => 
      prev.map(int => 
        int.id === integration.id 
          ? { ...int, lastSync: new Date().toISOString() }
          : int
      )
    );
  };

  const handleToggleStatus = (integration: Integration) => {
    setIntegrations(prev => 
      prev.map(int => 
        int.id === integration.id 
          ? { ...int, status: int.status === 'active' ? 'inactive' : 'active' }
          : int
      )
    );
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

      {testResult && (
        <Alert className={testResult.includes('Erro') ? 'border-red-200' : 'border-green-200'}>
          <AlertDescription>{testResult}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
