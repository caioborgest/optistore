
import React from 'react';
import Layout from './Layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Componente simplificado que apenas envolve o conteúdo com o Layout
// O Layout já lida com autenticação, loading e redirecionamento
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;
