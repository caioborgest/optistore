import React from 'react';
import { UnderDevelopment } from '@/components/ui/under-development';

const UsersPage: React.FC = () => {
  return (
    <UnderDevelopment 
      title="Gestão de Usuários" 
      description="Gerencie os usuários e permissões do sistema"
      features={[
        "Cadastro e edição de usuários",
        "Controle de permissões e papéis",
        "Histórico de atividades",
        "Autenticação em dois fatores",
        "Integração com diretório corporativo"
      ]}
      estimatedCompletion="Próxima semana"
    />
  );
};

export default UsersPage;