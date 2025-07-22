import React from 'react';
import Layout from '@/components/Layout';
import { DevelopmentStatus } from '@/components/ui/development-status';

const UsersPage: React.FC = () => {
  return (
    <Layout>
      <DevelopmentStatus
        title="Gerenciamento de Usuários"
        description="Gerencie todos os usuários da sua empresa de forma centralizada"
        features={[
          'Visualizar lista de usuários',
          'Adicionar novos usuários',
          'Editar permissões e papéis',
          'Gerenciar setores e departamentos',
          'Enviar convites por email',
          'Controle de acesso avançado'
        ]}
        status="development"
      />
    </Layout>
  );
};

export default UsersPage;