import React from 'react';
import { UnderDevelopment } from '@/components/ui/under-development';

const ChatPage: React.FC = () => {
  return (
    <UnderDevelopment 
      title="Chat Corporativo" 
      description="Comunique-se em tempo real com sua equipe"
      features={[
        "Mensagens em tempo real",
        "Compartilhamento de arquivos",
        "Canais por departamento e projetos",
        "Histórico completo de conversas",
        "Notificações personalizáveis"
      ]}
      estimatedCompletion="Duas semanas"
    />
  );
};

export default ChatPage;
