import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const CompanyRegister = () => {
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCompanyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validações básicas
      if (adminPassword.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }

      // Gerar código de convite único
      const inviteCode = `${companyName.substring(0, 3).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // 1. Criar empresa primeiro (com email único baseado no timestamp se necessário)
      let finalCompanyEmail = companyEmail;
      let companyCreated = false;
      let company;

      // Tentar criar empresa, se email duplicado, adicionar timestamp
      try {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert([{
            name: companyName,
            email: finalCompanyEmail,
            phone: companyPhone,
            address: companyAddress,
            is_active: true,
            invite_code: inviteCode,
          }])
          .select()
          .single();

        if (companyError) {
          if (companyError.code === '23505' && companyError.message.includes('companies_email_key')) {
            // Email duplicado, tentar com timestamp
            finalCompanyEmail = `${companyEmail.split('@')[0]}_${Date.now()}@${companyEmail.split('@')[1]}`;
            
            const { data: retryCompanyData, error: retryError } = await supabase
              .from('companies')
              .insert([{
                name: companyName,
                email: finalCompanyEmail,
                phone: companyPhone,
                address: companyAddress,
                is_active: true,
                invite_code: inviteCode,
              }])
              .select()
              .single();

            if (retryError) {
              throw new Error(retryError.message);
            }
            company = retryCompanyData;
          } else {
            throw new Error(companyError.message);
          }
        } else {
          company = companyData;
        }
        companyCreated = true;
      } catch (error: any) {
        throw new Error(`Erro ao criar empresa: ${error.message}`);
      }

      // 2. Criar conta do administrador
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: {
            name: adminName,
          },
        },
      });

      if (signUpError) {
        // Se falhou, limpar empresa criada
        if (companyCreated && company) {
          await supabase.from('companies').delete().eq('id', company.id);
        }
        throw new Error(signUpError.message);
      }

      if (!authData.user) {
        // Se falhou, limpar empresa criada
        if (companyCreated && company) {
          await supabase.from('companies').delete().eq('id', company.id);
        }
        throw new Error('Falha ao criar conta do administrador');
      }

      // 3. Criar perfil do usuário como admin da empresa
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          name: adminName,
          email: adminEmail,
          company_id: company.id,
          is_company_admin: true,
        }]);

      if (profileError) {
        // Se falhou, limpar empresa e usuário criados
        if (companyCreated && company) {
          await supabase.from('companies').delete().eq('id', company.id);
        }
        throw new Error(profileError.message);
      }

      toast({
        title: 'Empresa registrada com sucesso!',
        description: `Código de convite: ${inviteCode}`,
        duration: 10000,
      });
      
      // Fazer login automaticamente se possível
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

      if (signInError) {
        // Se não conseguir fazer login, redirecionar para página de login
        navigate('/auth/login');
      } else {
        // Login bem-sucedido, redirecionar para dashboard
        navigate('/');
      }
    } catch (error: any) {
      console.error('Erro no registro:', error);
      toast({
        title: 'Erro no registro da empresa',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-4xl font-bold">
            <span className="text-green-500">Opti</span>
            <span className="text-gray-800">Flow</span>
          </span>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">Criar conta</h2>
          
          <form onSubmit={handleCompanyRegister} className="space-y-4">
            {/* Dados do Administrador */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Dados do Administrador</h3>
              
              <div className="space-y-3">
                <Input
                  id="adminName"
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Nome do administrador"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                
                <Input
                  id="adminEmail"
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Email do administrador"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                
                <Input
                  id="adminPassword"
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Senha (mín. 6 caracteres)"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Dados da Empresa */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Dados da Empresa</h3>
              
              <div className="space-y-3">
                <Input
                  id="companyName"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Nome da Empresa"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                
                <Input
                  id="companyEmail"
                  type="email"
                  required
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="Email da Empresa"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                
                <Input
                  id="companyPhone"
                  type="tel"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="Telefone"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                
                <Input
                  id="companyAddress"
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="Endereço"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Registrando...
                </>
              ) : (
                'Registrar Empresa'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link 
              to="/auth/login" 
              className="text-gray-600 hover:text-gray-700 text-sm"
            >
              Voltar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegister;