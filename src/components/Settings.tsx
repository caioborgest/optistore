import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, Shield, Database, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    avatar_url: ''
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: true,
    systemAlerts: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setUserProfile({
          name: data.name || user.email?.split('@')[0] || '',
          email: data.email || user.email || '',
          avatar_url: data.avatar_url || ''
        });
      } else {
        setUserProfile({
          name: (user as any).user_metadata?.name || user.email?.split('@')[0] || '',
          email: user.email || '',
          avatar_url: (user as any).user_metadata?.avatar_url || ''
        });
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          name: userProfile.name,
          email: userProfile.email,
          avatar_url: userProfile.avatar_url,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseBackup = async () => {
    toast({
      title: "Backup Iniciado",
      description: "O backup do banco de dados foi iniciado. Você receberá uma notificação quando estiver pronto.",
    });
  };

  const handleSystemReset = async () => {
    if (confirm('ATENÇÃO: Esta ação irá apagar todos os dados do sistema. Esta ação não pode ser desfeita. Tem certeza?')) {
      toast({
        title: "Operação Cancelada",
        description: "Por segurança, esta operação requer confirmação adicional do administrador.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie suas preferências e configurações do sistema</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informações do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={userProfile.avatar_url} />
                    <AvatarFallback>
                      {userProfile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline">Alterar Foto</Button>
                    <p className="text-sm text-gray-500 mt-1">
                      PNG, JPG até 2MB
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="avatar_url">URL do Avatar</Label>
                  <Input
                    id="avatar_url"
                    value={userProfile.avatar_url}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, avatar_url: e.target.value }))}
                    placeholder="https://exemplo.com/avatar.jpg"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Preferências de Notificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Notificações por Email</Label>
                      <p className="text-sm text-gray-500">Receba notificações importantes por email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">Notificações Push</Label>
                      <p className="text-sm text-gray-500">Receba notificações push no navegador</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNotifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weekly-report">Relatório Semanal</Label>
                      <p className="text-sm text-gray-500">Receba um resumo semanal das atividades</p>
                    </div>
                    <Switch
                      id="weekly-report"
                      checked={notifications.weeklyReport}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReport: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="system-alerts">Alertas do Sistema</Label>
                      <p className="text-sm text-gray-500">Receba alertas sobre problemas do sistema</p>
                    </div>
                    <Switch
                      id="system-alerts"
                      checked={notifications.systemAlerts}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, systemAlerts: checked }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Preferências
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Configurações de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Alterar Senha</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Input type="password" placeholder="Senha atual" />
                      <Input type="password" placeholder="Nova senha" />
                    </div>
                    <Button className="mt-2">Alterar Senha</Button>
                  </div>

                  <div className="border-t pt-4">
                    <Label>Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-gray-500 mb-3">
                      Adicione uma camada extra de segurança à sua conta
                    </p>
                    <Button variant="outline">Configurar 2FA</Button>
                  </div>

                  <div className="border-t pt-4">
                    <Label>Sessões Ativas</Label>
                    <p className="text-sm text-gray-500 mb-3">
                      Gerencie onde você está logado
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="font-medium">Navegador Atual</p>
                          <p className="text-sm text-gray-500">Chrome - São Paulo, Brasil</p>
                        </div>
                        <Badge>Ativo</Badge>
                      </div>
                    </div>
                    <Button variant="outline" className="mt-2">Encerrar Outras Sessões</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Configurações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Backup do Banco de Dados</Label>
                    <p className="text-sm text-gray-500 mb-3">
                      Criar um backup completo de todos os dados
                    </p>
                    <Button onClick={handleDatabaseBackup}>Criar Backup</Button>
                  </div>

                  <div className="border-t pt-4">
                    <Label>Importar/Exportar Dados</Label>
                    <p className="text-sm text-gray-500 mb-3">
                      Importe ou exporte dados em formato CSV
                    </p>
                    <div className="flex space-x-2">
                      <Button variant="outline">Importar CSV</Button>
                      <Button variant="outline">Exportar CSV</Button>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Label>Configurações de Sistema</Label>
                    <div className="space-y-3 mt-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Modo de Manutenção</Label>
                          <p className="text-sm text-gray-500">Desabilita o acesso para usuários</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Logs de Auditoria</Label>
                          <p className="text-sm text-gray-500">Registra todas as ações do sistema</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 border-red-200">
                    <Label className="text-red-600">Zona de Perigo</Label>
                    <p className="text-sm text-gray-500 mb-3">
                      Ações irreversíveis que podem afetar todo o sistema
                    </p>
                    <Button variant="destructive" onClick={handleSystemReset}>
                      Reset Completo do Sistema
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;