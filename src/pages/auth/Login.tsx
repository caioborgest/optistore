import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/ui/logo';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    console.log('Login component mounted, checking auth status:', { isAuthenticated, authLoading });
    
    if (isAuthenticated && !authLoading) {
      console.log('User is authenticated, redirecting to dashboard');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Attempting login with:', { email });
      const result = await signIn(email, password);
      
      if (result.error) {
        console.error('Login error:', result.error);
        toast({
          title: 'Erro no login',
          description: result.error,
          variant: 'destructive'
        });
      } else {
        console.log('Login successful, redirecting to dashboard');
        // Login bem-sucedido, redirecionar imediatamente
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast({
        title: 'Erro no login',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Usuário de teste para desenvolvimento
  const loginAsTestUser = async () => {
    setEmail('admin@optiflow.com');
    setPassword('password123');
    
    try {
      setLoading(true);
      const result = await signIn('admin@optiflow.com', 'password123');
      
      if (result.error) {
        toast({
          title: 'Erro no login de teste',
          description: result.error,
          variant: 'destructive'
        });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      toast({
        title: 'Erro no login de teste',
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
          <Logo size="lg" className="justify-center" />
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">Entrar</h2>
          
          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="h-12 border-gray-300 focus:border-primary focus:ring-primary"
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
                placeholder="Senha"
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-4">
            <Button 
              type="button" 
              variant="outline"
              className="w-full"
              onClick={loginAsTestUser}
              disabled={loading}
            >
              Entrar como usuário de teste
            </Button>
          </div>

          <div className="mt-8 text-center space-y-4">
            <Link 
              to="/auth/register" 
              className="block text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Não tem conta? Criar conta
            </Link>
            
            <div className="space-y-2">
              <Link 
                to="/auth/company-register" 
                className="block text-gray-600 hover:text-gray-700 text-sm"
              >
                Registrar Empresa
              </Link>
              
              <Link 
                to="/auth/invite" 
                className="block text-gray-600 hover:text-gray-700 text-sm"
              >
                Tenho um código de convite
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;