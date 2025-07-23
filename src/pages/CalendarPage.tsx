import React from 'react';
import { UnderDevelopment } from '@/components/ui/under-development';

const CalendarPage: React.FC = () => {
  return (
    <UnderDevelopment 
      title="Calendário" 
      description="Gerencie seus eventos e prazos de forma visual"
      features={[
        "Visualização mensal, semanal e diária",
        "Integração com tarefas e projetos",
        "Lembretes e notificações automáticas",
        "Compartilhamento de calendários entre equipes",
        "Sincronização com Google Calendar e Outlook"
      ]}
      estimatedCompletion="Próxima semana"
    />
  );
};

export default CalendarPage;