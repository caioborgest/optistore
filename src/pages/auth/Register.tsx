import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive'
      });
      return;
    }

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
      const result = await signUp(email, password, name);
      if (result.error) {
        toast({
          title: 'Erro no cadastro',
          description: result.error,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Conta criada com sucesso!',
          description: 'Você pode fazer login agora',
        });
        navigate('/auth/login');
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast({
        title: 'Erro no cadastro',
        description: error.message || 'Ocorreu um erro inesperado',
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
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">Criar conta</h2>
          
          <form onSubmit={handleSignUp} className="space-y-4">
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

            <div>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar senha"
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
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link 
              to="/auth/login" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Já tem uma conta? Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;