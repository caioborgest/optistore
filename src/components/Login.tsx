import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useCompany } from '@/services/companyService';
import { Building2, Users, BarChart3, Mail, Lock, User, MapPin, Loader2, Building, Key, Phone } from 'lucide-react';
const SECTORS = ['Vendas', 'Estoque', 'Caixa', 'Entregas', 'Limpeza', 'Administração', 'Materiais Básicos', 'Tintas', 'Ferramentas'];
const Login = () => {
  const {
    signIn,
    registerCompany,
    registerWithInvite,
    loading
  } = useAuth();
  const {
    validateInviteCode
  } = useCompany();
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [inviteData, setInviteData] = useState({
    inviteCode: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    sector: '',
    role: 'colaborador' as 'gerente' | 'supervisor' | 'colaborador',
    phone: ''
  });
  const [inviteCodeValidation, setInviteCodeValidation] = useState<{
    isValid: boolean;
    companyName: string;
    isValidating: boolean;
  }>({
    isValid: false,
    companyName: '',
    isValidating: false
  });
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      alert('Preencha todos os campos');
      return;
    }
    await signIn(loginData.email, loginData.password);
  };
  const handleCompanyRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!companyData.name || !companyData.email || !companyData.adminName || !companyData.adminEmail || !companyData.password) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    if (companyData.password !== companyData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }
    if (companyData.password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    await registerCompany({
      name: companyData.name,
      email: companyData.email,
      adminName: companyData.adminName,
      adminEmail: companyData.adminEmail,
      password: companyData.password,
      phone: companyData.phone,
      address: companyData.address
    });
  };
  const handleInviteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!inviteData.inviteCode || !inviteData.name || !inviteData.email || !inviteData.password || !inviteData.sector) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    if (inviteData.password !== inviteData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }
    if (inviteData.password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (!inviteCodeValidation.isValid) {
      alert('Código de convite inválido');
      return;
    }
    await registerWithInvite({
      inviteCode: inviteData.inviteCode,
      name: inviteData.name,
      email: inviteData.email,
      password: inviteData.password,
      sector: inviteData.sector,
      role: inviteData.role,
      phone: inviteData.phone
    });
  };
  const handleInviteCodeChange = async (code: string) => {
    setInviteData(prev => ({
      ...prev,
      inviteCode: code.toUpperCase()
    }));
    if (code.length === 8) {
      setInviteCodeValidation(prev => ({
        ...prev,
        isValidating: true
      }));
      const {
        company,
        error
      } = await validateInviteCode(code);
      if (!error && company) {
        setInviteCodeValidation({
          isValid: true,
          companyName: company.name,
          isValidating: false
        });
      } else {
        setInviteCodeValidation({
          isValid: false,
          companyName: '',
          isValidating: false
        });
      }
    } else {
      setInviteCodeValidation({
        isValid: false,
        companyName: '',
        isValidating: false
      });
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Lado esquerdo - Apresentação */}
        <div className="space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              OptiStore
            </h1>
            <p className="text-xl text-gray-600 mb-8">Gestão Operacional Inteligente para o Varejo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Gestão de Tarefas</h3>
              <p className="text-sm text-gray-600">Organize e acompanhe todas as atividades da loja</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Comunicação</h3>
              <p className="text-sm text-gray-600">Chat integrado por setor e tarefa</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Relatórios</h3>
              <p className="text-sm text-gray-600">KPIs e produtividade em tempo real</p>
            </div>
          </div>
        </div>

        {/* Lado direito - Formulários */}
        <Card className="w-full max-w-lg mx-auto">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="company">Nova Empresa</TabsTrigger>
              <TabsTrigger value="invite">Com Convite</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Fazer Login</CardTitle>
                <p className="text-gray-600">Acesse sua conta para continuar</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input id="login-email" type="email" placeholder="seu@email.com" className="pl-10" value={loginData.email} onChange={e => setLoginData(prev => ({
                      ...prev,
                      email: e.target.value
                    }))} disabled={loading} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input id="login-password" type="password" placeholder="••••••••" className="pl-10" value={loginData.password} onChange={e => setLoginData(prev => ({
                      ...prev,
                      password: e.target.value
                    }))} disabled={loading} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </> : 'Entrar'}
                  </Button>
                </form>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-2">Demo - Usuários de Teste:</p>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div>👨‍💼 Gerente: admin@loja.com / 123456</div>
                    <div>👷‍♂️ Colaborador: funcionario@loja.com / 123456</div>
                    <div>📋 Supervisor: supervisor@loja.com / 123456</div>
                  </div>
                </div>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="company">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Registrar Nova Empresa</CardTitle>
                <p className="text-gray-600">Crie sua empresa e receba um código para sua equipe</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCompanyRegistration} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Nome da Empresa *</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input id="company-name" type="text" placeholder="Loja ABC Materiais" className="pl-10" value={companyData.name} onChange={e => setCompanyData(prev => ({
                        ...prev,
                        name: e.target.value
                      }))} disabled={loading} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company-email">Email da Empresa *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input id="company-email" type="email" placeholder="contato@empresa.com" className="pl-10" value={companyData.email} onChange={e => setCompanyData(prev => ({
                        ...prev,
                        email: e.target.value
                      }))} disabled={loading} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-name">Nome do Administrador *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input id="admin-name" type="text" placeholder="Seu nome completo" className="pl-10" value={companyData.adminName} onChange={e => setCompanyData(prev => ({
                        ...prev,
                        adminName: e.target.value
                      }))} disabled={loading} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email do Administrador *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input id="admin-email" type="email" placeholder="admin@empresa.com" className="pl-10" value={companyData.adminEmail} onChange={e => setCompanyData(prev => ({
                        ...prev,
                        adminEmail: e.target.value
                      }))} disabled={loading} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input id="company-phone" type="tel" placeholder="(11) 99999-9999" className="pl-10" value={companyData.phone} onChange={e => setCompanyData(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))} disabled={loading} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-address">Endereço</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input id="company-address" type="text" placeholder="Rua, número, bairro, cidade" className="pl-10" value={companyData.address} onChange={e => setCompanyData(prev => ({
                      ...prev,
                      address: e.target.value
                    }))} disabled={loading} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Senha *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input id="admin-password" type="password" placeholder="••••••••" className="pl-10" value={companyData.password} onChange={e => setCompanyData(prev => ({
                        ...prev,
                        password: e.target.value
                      }))} disabled={loading} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admin-confirm-password">Confirmar Senha *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input id="admin-confirm-password" type="password" placeholder="••••••••" className="pl-10" value={companyData.confirmPassword} onChange={e => setCompanyData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))} disabled={loading} />
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando empresa...
                      </> : 'Criar Empresa'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="invite">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Cadastro com Convite</CardTitle>
                <p className="text-gray-600">Use o código fornecido pela sua empresa</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInviteRegistration} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-code">Código de Convite *</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input id="invite-code" type="text" placeholder="ABC12345" className="pl-10 uppercase" maxLength={8} value={inviteData.inviteCode} onChange={e => handleInviteCodeChange(e.target.value)} disabled={loading} />
                      {inviteCodeValidation.isValidating && <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />}
                    </div>
                    {inviteCodeValidation.isValid && <p className="text-sm text-green-600 flex items-center gap-1">
                        ✓ Empresa: {inviteCodeValidation.companyName}
                      </p>}
                    {inviteData.inviteCode.length === 8 && !inviteCodeValidation.isValid && !inviteCodeValidation.isValidating && <p className="text-sm text-red-600">
                        ✗ Código de convite inválido
                      </p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-name">Nome Completo *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input id="invite-name" type="text" placeholder="Seu nome completo" className="pl-10" value={inviteData.name} onChange={e => setInviteData(prev => ({
                        ...prev,
                        name: e.target.value
                      }))} disabled={loading} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input id="invite-email" type="email" placeholder="seu@email.com" className="pl-10" value={inviteData.email} onChange={e => setInviteData(prev => ({
                        ...prev,
                        email: e.target.value
                      }))} disabled={loading} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-sector">Setor *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                        <Select value={inviteData.sector} onValueChange={value => setInviteData(prev => ({
                        ...prev,
                        sector: value
                      }))} disabled={loading}>
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Selecione seu setor" />
                          </SelectTrigger>
                          <SelectContent>
                            {SECTORS.map(sector => <SelectItem key={sector} value={sector}>
                                {sector}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Função *</Label>
                      <Select value={inviteData.role} onValueChange={(value: 'gerente' | 'supervisor' | 'colaborador') => setInviteData(prev => ({
                      ...prev,
                      role: value
                    }))} disabled={loading}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="colaborador">Colaborador</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="gerente">Gerente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invite-phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input id="invite-phone" type="tel" placeholder="(11) 99999-9999" className="pl-10" value={inviteData.phone} onChange={e => setInviteData(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))} disabled={loading} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-password">Senha *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input id="invite-password" type="password" placeholder="••••••••" className="pl-10" value={inviteData.password} onChange={e => setInviteData(prev => ({
                        ...prev,
                        password: e.target.value
                      }))} disabled={loading} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="invite-confirm-password">Confirmar Senha *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input id="invite-confirm-password" type="password" placeholder="••••••••" className="pl-10" value={inviteData.confirmPassword} onChange={e => setInviteData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))} disabled={loading} />
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" size="lg" disabled={loading || !inviteCodeValidation.isValid}>
                    {loading ? <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta...
                      </> : 'Criar Conta'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>;
};
export default Login;