import React from 'react';
import { UnderDevelopment } from '@/components/ui/under-development';

const ReportsPage: React.FC = () => {
  return (
    <UnderDevelopment 
      title="Relatórios Avançados" 
      description="Visualize dados e métricas importantes para sua empresa"
      features={[
        "Dashboards personalizáveis",
        "Gráficos interativos e dinâmicos",
        "Exportação em múltiplos formatos",
        "Relatórios agendados por email",
        "Análise de produtividade e desempenho"
      ]}
      estimatedCompletion="Próximo mês"
    />
  );
};

export default ReportsPage;