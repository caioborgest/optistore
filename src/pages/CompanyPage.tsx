import React from 'react';
import { UnderDevelopment } from '@/components/ui/under-development';

const CompanyPage: React.FC = () => {
  return (
    <UnderDevelopment 
      title="Gestão da Empresa" 
      description="Configure e gerencie os dados da sua empresa"
      features={[
        "Perfil completo da empresa",
        "Gerenciamento de filiais e departamentos",
        "Configurações fiscais e financeiras",
        "Personalização de marca e identidade visual",
        "Controle de permissões por departamento"
      ]}
      estimatedCompletion="Em breve"
    />
  );
};

export default CompanyPage;