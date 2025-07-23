import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  Settings,
  Save,
  Upload,
  Palette,
  Shield,
  Bell,
  CreditCard,
  FileText,
  BarChart3
} from 'lucide-react';

interface CompanyData {
  name: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  logo_url?: string;
  description?: string;
  industry?: string;
  size?: string;
  founded?: string;
}

export const CompanyManagement: React.FC = () => {
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: 'Empresa Exemplo Ltda',
    email: 'contato@empresa.com',
    phone: '(11) 3333-4444',
    address: 'Rua das Empresas, 123 - São Paulo, SP',
    website: 'https://empresa.com',
    description: 'Uma empresa focada em soluções inovadoras para o varejo.',
    industry: 'Varejo',
    size: '50-100 funcionários',
    founded: '2020'
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Lógica para salvar dados da empresa
    setIsEditing(false);
    console.log('Dados salvos:', companyData);
  };

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão da Empresa</h1>
          <p className="text-gray-500 mt-1">Configure e gerencie os dados da sua empresa</p>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="branding">Marca</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="billing">Faturamento</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Aba Geral */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informações Básicas */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Informações da Empresa
                  </CardTitle>
                  <CardDescription>
                    Dados básicos da sua empresa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da Empresa</Label>
                      <Input
                        id="name"
                        value={companyData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="industry">Setor</Label>
                      <Input
                        id="industry"
                        value={companyData.industry || ''}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={companyData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={companyData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        value={companyData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="website"
                        value={companyData.website || ''}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <textarea
                      id="description"
                      value={companyData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Estatísticas */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Estatísticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Usuários Ativos</span>
                    <Badge>24</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tarefas Criadas</span>
                    <Badge>156</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Projetos</span>
                    <Badge>8</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Departamentos</span>
                    <Badge>5</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plano Atual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className="bg-purple-100 text-purple-800">
                      Plano Empresarial
                    </Badge>
                    <p className="text-sm text-gray-600">
                      Até 100 usuários
                    </p>
                    <p className="text-sm text-gray-600">
                      Renovação: 15/02/2024
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Aba Marca */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Identidade Visual
              </CardTitle>
              <CardDescription>
                Personalize a aparência da sua empresa no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Logo da Empresa</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Clique para fazer upload da logo</p>
                      <p className="text-xs text-gray-400">PNG, JPG até 2MB</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Cores da Marca</Label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <div className="h-12 bg-blue-500 rounded border cursor-pointer"></div>
                      <div className="h-12 bg-green-500 rounded border cursor-pointer"></div>
                      <div className="h-12 bg-purple-500 rounded border cursor-pointer"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Segurança */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>
                Gerencie as configurações de segurança da empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Autenticação em Dois Fatores</h3>
                  <p className="text-sm text-gray-600">Exigir 2FA para todos os usuários</p>
                </div>
                <Button variant="outline">Configurar</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Política de Senhas</h3>
                  <p className="text-sm text-gray-600">Definir requisitos mínimos de senha</p>
                </div>
                <Button variant="outline">Configurar</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Sessões Ativas</h3>
                  <p className="text-sm text-gray-600">Gerenciar sessões de usuários</p>
                </div>
                <Button variant="outline">Ver Sessões</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Faturamento */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Faturamento e Pagamentos
              </CardTitle>
              <CardDescription>
                Gerencie sua assinatura e métodos de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900">Plano Atual: Empresarial</h3>
                <p className="text-sm text-blue-700">R$ 299,90/mês • Próxima cobrança: 15/02/2024</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Histórico de Faturas</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Janeiro 2024</p>
                      <p className="text-sm text-gray-600">R$ 299,90</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics da Empresa
              </CardTitle>
              <CardDescription>
                Métricas e insights sobre o uso do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Relatórios detalhados em desenvolvimento</p>
                <p className="text-sm text-gray-400">Em breve você terá acesso a métricas completas</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};