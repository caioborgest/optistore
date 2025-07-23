import React from 'react';
import { UnderDevelopment } from '@/components/ui/under-development';

const IntegrationsPage: React.FC = () => {
  return (
    <UnderDevelopment 
      title="Integrações" 
      description="Conecte o OptiFlow com seus sistemas e ferramentas favoritas"
      features={[
        "Integração com ERPs e CRMs populares",
        "Conexão com ferramentas de produtividade",
        "APIs robustas e documentadas",
        "Webhooks personalizáveis",
        "Sincronização automática de dados"
      ]}
      estimatedCompletion="Em desenvolvimento"
    />
  );
};

export default IntegrationsPage;