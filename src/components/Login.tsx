import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isCompanyRegister, setIsCompanyRegister] = useState(false);
  const [isInviteRegister, setIsInviteRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, registerCompany, registerWithInvite } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await signIn(email, password);
      if (result.error) {
        toast({
          title: 'Erro no login',
          description: result.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro no login',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await signUp(email, password, name);
      if (result.error) {
        toast({
          title: 'Erro no cadastro',
          description: result.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro no cadastro',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const companyData = {
        name: companyName,
        email: companyEmail,
        phone: companyPhone,
        address: companyAddress,
        is_active: true,
        invite_code: Math.random().toString(36).substring(2, 15),
      };
      
      const result = await registerCompany(companyData);
      if (result.error) {
        toast({
          title: 'Erro no registro da empresa',
          description: result.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro no registro da empresa',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await registerWithInvite(inviteCode);
      if (result.error) {
        toast({
          title: 'Erro no convite',
          description: result.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro no convite',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {isSignUp ? 'Criar conta' : 'Entrar no OptiFlow'}
          </h2>
        </div>

        {!isCompanyRegister && !isInviteRegister && (
          <form className="mt-8 space-y-6" onSubmit={isSignUp ? handleSignUp : handleSignIn}>
            <div className="space-y-4">
              {isSignUp && (
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processando...' : (isSignUp ? 'Criar conta' : 'Entrar')}
              </Button>
            </div>

            <div className="text-center space-y-2">
              <Button
                type="button"
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem conta? Criar'}
              </Button>
              
              {isSignUp && (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsCompanyRegister(true)}
                  >
                    Registrar Empresa
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsInviteRegister(true)}
                  >
                    Tenho um código de convite
                  </Button>
                </div>
              )}
            </div>
          </form>
        )}

        {isCompanyRegister && (
          <form className="mt-8 space-y-6" onSubmit={handleCompanyRegister}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Nome da sua empresa"
                />
              </div>
              
              <div>
                <Label htmlFor="companyEmail">Email da Empresa</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  required
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="contato@empresa.com"
                />
              </div>
              
              <div>
                <Label htmlFor="companyPhone">Telefone</Label>
                <Input
                  id="companyPhone"
                  type="tel"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <Label htmlFor="companyAddress">Endereço</Label>
                <Input
                  id="companyAddress"
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="Endereço da empresa"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrar Empresa'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsCompanyRegister(false)}
              >
                Voltar
              </Button>
            </div>
          </form>
        )}

        {isInviteRegister && (
          <form className="mt-8 space-y-6" onSubmit={handleInviteRegister}>
            <div>
              <Label htmlFor="inviteCode">Código de Convite</Label>
              <Input
                id="inviteCode"
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Digite o código de convite"
              />
            </div>

            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Validando...' : 'Usar Convite'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsInviteRegister(false)}
              >
                Voltar
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
