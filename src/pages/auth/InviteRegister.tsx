import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const InviteRegister = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerWithInvite } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInviteRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 6 caracteres',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      const result = await registerWithInvite(inviteCode, { name, email, password });
      if (result.error) {
        toast({
          title: 'Erro no convite',
          description: result.error,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Conta criada com sucesso!',
          description: 'Você foi adicionado à empresa',
        });
        navigate('/');
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-4xl font-bold">
            <span className="text-green-500">Opti</span>
            <span className="text-gray-800">Flow</span>
          </span>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">Usar convite</h2>
          
          <form onSubmit={handleInviteRegister} className="space-y-4">
            <div>
              <Input
                id="inviteCode"
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Código de convite"
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo"
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha (mín. 6 caracteres)"
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Validando...
                </>
              ) : (
                'Usar Convite'
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

export default InviteRegister;