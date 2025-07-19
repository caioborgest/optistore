import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useCompany, Company } from '@/services/companyService';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Users, 
  Key, 
  Copy, 
  RefreshCw, 
  Mail, 
  Phone, 
  MapPin,
  Save,
  Loader2,
  UserPlus,
  Trash2,
  Shield
} from 'lucide-react';

export const CompanySettings: React.FC = () => {
  const { userProfile, company } = useAuth();
  const { 
    updateCompany, 
    regenerateInviteCode, 
    getCompanyUsers, 
    removeUserFromCompany,
    getCompanyStats 
  } = useCompany();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [companyData, setCompanyData] = useState({
    name: company?.name || '',
    email: company?.email || '',
    phone: company?.phone || '',
    address: company?.address || ''
  });

  useEffect(() => {
    if (company) {
      loadCompanyData();
    }
  }, [company]);

  const loadCompanyData = async () => {
    if (!company) return;

    try {
      setLoading(true);
      
      // Carregar usuários da empresa
      const { users: companyUsers, error: usersError } = await getCompanyUsers(company.id);
      if (!usersError && companyUsers) {
        setUsers(companyUsers);
      }

      // Carregar estatísticas
      const { stats: companyStats, error: statsError } = await getCompanyStats(company.id);
      if (!statsError && companyStats) {
        setStats(companyStats);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompany = async () => {
    if (!company) return;

    try {
      setLoading(true);
      const { error } = await updateCompany(company.id, companyData);
      
      if (error) {
        toast({
          title: 'Erro ao atualizar empresa',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Empresa atualizada',
          description: 'As informações da empresa foram atualizadas com sucesso'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro inesperado',
        description: 'Não foi possível atualizar a empresa',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateInviteCode = async () => {
    if (!company) return;

    try {
      setLoading(true);
      const { inviteCode, error } = await regenerateInviteCode(company.id);
      
      if (error) {
        toast({
          title: 'Erro ao gerar código',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Código regenerado',
          description: `Novo código de convite: ${inviteCode}`
        });
        // Atualizar o código na interface
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: 'Erro inesperado',
        description: 'Não foi possível gerar um novo código',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInviteCode = () => {
    if (company?.invite_code) {
      navigator.clipboard.writeText(company.invite_code);
      toast({
        title: 'Código copiado',
        description: 'O código de convite foi copiado para a área de transferência'
      });
    }
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja remover ${userName} da empresa?`)) {
      return;
    }

    try {
      const { error } = await removeUserFromCompany(userId);
      
      if (error) {
        toast({
          title: 'Erro ao remover usuário',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Usuário removido',
          description: `${userName} foi removido da empresa`
        });
        loadCompanyData(); // Recarregar dados
      }
    } catch (error) {
      toast({
        title: 'Erro inesperado',
        description: 'Não foi possível remover o usuário',
        variant: 'destructive'
      });
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'gerente': return 'Gerente';
      case 'supervisor': return 'Supervisor';
      default: return 'Colaborador';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'gerente': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (!userProfile?.is_company_admin) {
    return (
      <div className="p-6 text-center">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Acesso Restrito
        </h3>
        <p className="text-gray-500">
          Apenas administradores da empresa podem acessar estas configurações.
        </p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Carregando informações da empresa...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações da Empresa</h1>
        <p className="text-gray-600 mt-1">
          Gerencie as informações e usuários da sua empresa
        </p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Total de Usuários</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <Users className="h-12 w-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Total de Tarefas</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalTasks}</p>
                </div>
                <Building2 className="h-12 w-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Concluídas</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Pendentes</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingTasks}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">⏳</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nome da Empresa</Label>
              <Input
                id="company-name"
                value={companyData.name}
                onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="company-email"
                  type="email"
                  className="pl-10"
                  value={companyData.email}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="company-phone"
                  className="pl-10"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-address">Endereço</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="company-address"
                  className="pl-10"
                  value={companyData.address}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </div>

            <Button onClick={handleUpdateCompany} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Código de Convite */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Código de Convite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-3xl font-mono font-bold text-blue-600 mb-2">
                {company.invite_code}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Compartilhe este código com novos funcionários para que possam se cadastrar
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={handleCopyInviteCode}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button variant="outline" onClick={handleRegenerateInviteCode} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Gerar Novo
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Como usar:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Compartilhe o código com o novo funcionário</li>
                <li>2. Ele deve acessar a página de cadastro</li>
                <li>3. Selecionar "Com Convite" e inserir o código</li>
                <li>4. Preencher os dados e definir setor/função</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários da Empresa ({users.length})
            </div>
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Convidar Usuário
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Carregando usuários...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                        <Badge variant="outline">{user.sector}</Badge>
                        {user.is_company_admin && (
                          <Badge className="bg-orange-100 text-orange-800">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!user.is_company_admin && user.id !== userProfile?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUser(user.id, user.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};