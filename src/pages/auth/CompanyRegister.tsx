
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Logo } from '@/components/ui/logo';
import { Loader2, Building2, User, Mail, Lock, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const CompanyRegister = () => {
  const [formData, setFormData] = useState({
    // Dados da empresa
    companyName: '',
    email: '',
    phone: '',
    address: '',
    // Dados do administrador
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { registerCompany } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    const companyData = {
      name: formData.companyName,
      email: formData.email,
      phone: formData.phone || '',
      address: formData.address || '',
      is_active: true,
      invite_code: `${formData.companyName.toLowerCase().replace(/\s+/g, '')}-${Date.now()}`
    };

    const result = await registerCompany(companyData);
    
    if (result.error) {
      setError(result.error);
    } else {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-2xl font-bold">Registrar empresa</CardTitle>
          <CardDescription>
            Crie sua conta empresarial e comece a gerenciar sua equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Dados da empresa */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Dados da empresa
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da empresa *</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Nome da sua empresa"
                    value={formData.companyName}
                    onChange={handleChange('companyName')}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email da empresa *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="contato@empresa.com"
                      value={formData.email}
                      onChange={handleChange('email')}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 9999-9999"
                      value={formData.phone}
                      onChange={handleChange('phone')}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="address"
                      type="text"
                      placeholder="Endereço da empresa"
                      value={formData.address}
                      onChange={handleChange('address')}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Dados do administrador */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="mr-2 h-5 w-5" />
                Dados do administrador
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminName">Nome completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="adminName"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.adminName}
                      onChange={handleChange('adminName')}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email pessoal *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.adminEmail}
                      onChange={handleChange('adminEmail')}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleChange('password')}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirme sua senha"
                      value={formData.confirmPassword}
                      onChange={handleChange('confirmPassword')}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando empresa...
                </>
              ) : (
                'Registrar empresa'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/auth/login" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar para login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyRegister;
