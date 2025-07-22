import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  Plus, 
  Zap, 
  Database, 
  Clock, 
  ShoppingCart, 
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sync,
  Trash2,
  Edit,
  TestTube
} from 'lucide-react';
import { IntegrationService } from '@/services/integrationService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

interface Integration {
  id: string;
  name: string;
  type: 'erp' | 'timeclock' | 'ecommerce' | 'bi';
  status: 'active' | 'inactive' | 'error';
  lastSync?: string;
  config: Record<string, any>;
}

const INTEGRATION_TYPES = {
  erp: {
    name: 'ERP',
    icon: Database,
    description: 'Integração com sistemas de gestão empresarial',
    color: 'bg-blue-500'
  },
  timeclock: {
    name: 'Controle de Ponto',
    icon: Clock,
    description: 'Sincronização com sistemas de ponto eletrônico',
    color: 'bg-green-500'
  },
  ecommerce: {
    name: 'E-commerce',
    icon: ShoppingCart,
    description: 'Conexão com plataformas de venda online',
    color: 'bg-purple-500'
  },
  bi: {
    name: 'Business Intelligence',
    icon: BarChart3,
    description: 'Exportação de dados para ferramentas de BI',
    color: 'bg-orange-500'
  }
};

const ERP_PROVIDERS = [
  { value: 'sap', label: 'SAP Business One' },
  { value: 'oracle', label: 'Oracle ERP' },
  { value: 'totvs', label: 'TOTVS Protheus' },
  { value: 'senior', label: 'Senior Sistemas' },
  { value: 'custom', label: 'API Personalizada' }
];

const ECOMMERCE_PLATFORMS = [
  { value: 'shopify', label: 'Shopify' },
  { value: 'woocommerce', label: 'WooCommerce' },
  { value: 'magento', label: 'Magento' },
  { value: 'vtex', label: 'VTEX' },
  { value: 'mercadolivre', label: 'Mercado Livre' }
];

const BI_PLATFORMS = [
  { value: 'powerbi', label: 'Microsoft Power BI' },
  { value: 'tableau', label: 'Tableau' },
  { value: 'looker', label: 'Google Looker' },
  { value: 'metabase', label: 'Metabase' }
];

export const IntegrationManager: React.FC = () => {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const { data, error } = await IntegrationService.getIntegrations();
      
      if (error) throw error;
      
      setIntegrations(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar integrações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (integration: Integration) => {
    try {
      const { success, error } = await IntegrationService.testConnection(integration);
      
      if (success) {
        toast({
          title: 'Conexão bem-sucedida',
          description: `Integração ${integration.name} está funcionando corretamente`,
        });
      } else {
        toast({
          title: 'Falha na conexão',
          description: error,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro no teste',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSync = async (integration: Integration) => {
    try {
      let result;
      
      switch (integration.type) {
        case 'erp':
          result = await IntegrationService.syncERPProducts(integration.id);
          break;
        case 'ecommerce':
          result = await IntegrationService.syncECommerceOrders(integration.id);
          break;
        case 'timeclock':
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 7); // última semana
          result = await IntegrationService.syncTimeClockData(integration.id, startDate, new Date());
          break;
        default:
          throw new Error('Tipo de sincronização não suportado');
      }

      if (result.success) {
        toast({
          title: 'Sincronização concluída',
          description: `${result.synced || result.orders || result.records || 0} registros sincronizados`,
        });
        loadIntegrations();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Erro na sincronização',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCreateIntegration = async () => {
    try {
      const { data, error } = await IntegrationService.createIntegration({
        ...formData,
        type: selectedType,
        status: 'inactive'
      });

      if (error) throw error;

      toast({
        title: 'Integração criada',
        description: 'Nova integração adicionada com sucesso',
      });

      setShowAddDialog(false);
      setFormData({});
      setSelectedType('');
      loadIntegrations();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar integração',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      error: 'destructive'
    } as const;

    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      error: 'Erro'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const renderIntegrationCard = (integration: Integration) => {
    const typeInfo = INTEGRATION_TYPES[integration.type];
    const IconComponent = typeInfo.icon;

    return (
      <Card key={integration.id} className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${typeInfo.color} text-white`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                <CardDescription>{typeInfo.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(integration.status)}
              {getStatusBadge(integration.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {integration.lastSync && (
              <div className="text-sm text-muted-foreground">
                Última sincronização: {new Date(integration.lastSync).toLocaleString('pt-BR')}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTestConnection(integration)}
              >
                <TestTube className="h-4 w-4 mr-2" />
                Testar
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSync(integration)}
                disabled={integration.status !== 'active'}
              >
                <Sync className="h-4 w-4 mr-2" />
                Sincronizar
              </Button>
              
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              
              <Button size="sm" variant="outline" className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAddIntegrationForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="type">Tipo de Integração</Label>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(INTEGRATION_TYPES).map(([key, type]) => (
              <SelectItem key={key} value={key}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedType && (
        <>
          <div>
            <Label htmlFor="name">Nome da Integração</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: ERP Principal"
            />
          </div>

          {selectedType === 'erp' && (
            <>
              <div>
                <Label htmlFor="provider">Provedor ERP</Label>
                <Select 
                  value={formData.provider || ''} 
                  onValueChange={(value) => setFormData({ ...formData, provider: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o provedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {ERP_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="apiUrl">URL da API</Label>
                <Input
                  id="apiUrl"
                  value={formData.apiUrl || ''}
                  onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                  placeholder="https://api.erp.com/v1"
                />
              </div>
              
              <div>
                <Label htmlFor="apiKey">Chave da API</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey || ''}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="Sua chave de API"
                />
              </div>
            </>
          )}

          {selectedType === 'ecommerce' && (
            <>
              <div>
                <Label htmlFor="platform">Plataforma</Label>
                <Select 
                  value={formData.platform || ''} 
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    {ECOMMERCE_PLATFORMS.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="storeUrl">URL da Loja</Label>
                <Input
                  id="storeUrl"
                  value={formData.storeUrl || ''}
                  onChange={(e) => setFormData({ ...formData, storeUrl: e.target.value })}
                  placeholder="https://minhaloja.com"
                />
              </div>
              
              <div>
                <Label htmlFor="accessToken">Token de Acesso</Label>
                <Input
                  id="accessToken"
                  type="password"
                  value={formData.accessToken || ''}
                  onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                  placeholder="Seu token de acesso"
                />
              </div>
            </>
          )}

          {selectedType === 'timeclock' && (
            <>
              <div>
                <Label htmlFor="deviceType">Tipo de Dispositivo</Label>
                <Select 
                  value={formData.deviceType || ''} 
                  onValueChange={(value) => setFormData({ ...formData, deviceType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="biometric">Biométrico</SelectItem>
                    <SelectItem value="card">Cartão</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="web">Web</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="deviceUrl">URL do Dispositivo</Label>
                <Input
                  id="deviceUrl"
                  value={formData.deviceUrl || ''}
                  onChange={(e) => setFormData({ ...formData, deviceUrl: e.target.value })}
                  placeholder="http://192.168.1.100:8080"
                />
              </div>
            </>
          )}

          {selectedType === 'bi' && (
            <>
              <div>
                <Label htmlFor="biPlatform">Plataforma BI</Label>
                <Select 
                  value={formData.biPlatform || ''} 
                  onValueChange={(value) => setFormData({ ...formData, biPlatform: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    {BI_PLATFORMS.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="connectionString">String de Conexão</Label>
                <Input
                  id="connectionString"
                  value={formData.connectionString || ''}
                  onChange={(e) => setFormData({ ...formData, connectionString: e.target.value })}
                  placeholder="Server=localhost;Database=optiflow;..."
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );

  if (user?.role !== 'gerente') {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
            <p className="text-muted-foreground">
              Apenas gerentes podem acessar as configurações de integração.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrações</h1>
          <p className="text-muted-foreground">
            Conecte o OptiFlow com seus sistemas externos
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Integração
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Integração</DialogTitle>
              <DialogDescription>
                Configure uma nova integração com sistemas externos
              </DialogDescription>
            </DialogHeader>
            {renderAddIntegrationForm()}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateIntegration} disabled={!selectedType || !formData.name}>
                Criar Integração
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="erp">ERP</TabsTrigger>
          <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
          <TabsTrigger value="timeclock">Ponto</TabsTrigger>
          <TabsTrigger value="bi">BI</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Carregando integrações...</p>
              </div>
            </div>
          ) : integrations.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma integração configurada</h3>
                  <p className="text-muted-foreground mb-4">
                    Conecte o OptiFlow com seus sistemas para automatizar processos
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeira Integração
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map(renderIntegrationCard)}
            </div>
          )}
        </TabsContent>

        {Object.keys(INTEGRATION_TYPES).map((type) => (
          <TabsContent key={type} value={type} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations
                .filter((integration) => integration.type === type)
                .map(renderIntegrationCard)}
            </div>
            {integrations.filter((integration) => integration.type === type).length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">
                    Nenhuma integração do tipo {INTEGRATION_TYPES[type as keyof typeof INTEGRATION_TYPES].name} configurada
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};