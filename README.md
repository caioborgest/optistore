# OptiFlow - Sistema de Gestão Operacional Inteligente

Sistema completo de gestão operacional para lojas de material de construção, com foco em tarefas, comunicação interna e produtividade da equipe.

## 🚀 Funcionalidades

### ✅ **Sistema de Tarefas Avançado**

- Criação e atribuição de tarefas por setor
- **Tarefas recorrentes** (diárias, semanais, mensais)
- Controle de status e prioridades
- Comentários e anexos
- Histórico completo de execução

### 💬 **Chat em Tempo Real**

- Conversas diretas entre funcionários
- Chats por setor e departamento
- Chats específicos por tarefa
- Notificações em tempo real
- Upload de arquivos e imagens

### 👥 **Controle de Acesso por Papel**

- **Gerente**: Acesso total, relatórios globais
- **Supervisor**: Gestão do setor, relatórios setoriais
- **Colaborador**: Tarefas pessoais, chat da equipe

### 📊 **Dashboard Personalizado**

- Métricas específicas por papel do usuário
- Gráficos de performance e produtividade
- Atividade recente da equipe
- Ações rápidas contextuais

### 🔔 **Sistema de Notificações**

- Notificações em tempo real
- Alertas de tarefas atrasadas
- Notificações de novas mensagens
- Centro de notificações integrado

### 📱 **PWA (Progressive Web App)**

- Funciona offline
- Instalável em dispositivos móveis
- Interface responsiva
- Performance otimizada

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Tailwind CSS + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Estado**: TanStack Query (React Query)
- **Formulários**: React Hook Form + Zod
- **Roteamento**: React Router DOM

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <YOUR_GIT_URL>
cd optiflow
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie `.env.example` para `.env.local`
3. Configure as variáveis de ambiente:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Configure o banco de dados

1. Acesse o Supabase SQL Editor
2. Execute o script `setup_database.sql`
3. Verifique se todas as tabelas foram criadas

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

## 👤 Usuários de Teste

Após executar o setup do banco, você pode usar estes usuários para testar:

- **Gerente**: `admin@loja.com` / `123456`
- **Supervisor**: `supervisor@loja.com` / `123456`
- **Colaborador**: `funcionario@loja.com` / `123456`

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes base (shadcn)
│   ├── forms/           # Formulários específicos
│   ├── dashboard/       # Componentes do dashboard
│   └── ...
├── hooks/               # Custom hooks
├── services/            # Serviços e APIs
├── pages/               # Páginas da aplicação
└── lib/                 # Utilitários
```

## 🔧 Principais Serviços

### `recurringTaskService.ts`

- Criação de tarefas recorrentes
- Geração automática de próximas ocorrências
- Cálculo de datas baseado em padrões

### `chatService.ts`

- Chat em tempo real via WebSocket
- Diferentes tipos de conversa
- Gerenciamento de membros

### `authService.ts`

- Autenticação e autorização
- Controle de permissões por papel
- Gestão de perfis de usuário

### `notificationService.ts`

- Sistema de notificações em tempo real
- Diferentes tipos de notificação
- Subscrição para eventos

## 🎯 Como Usar

### Para Gerentes

1. Acesse o dashboard gerencial
2. Visualize métricas de toda a loja
3. Crie tarefas globais e recorrentes
4. Gerencie usuários e setores
5. Acesse relatórios completos

### Para Supervisores

1. Gerencie tarefas do seu setor
2. Atribua atividades à equipe
3. Acompanhe performance setorial
4. Use o chat do setor
5. Aprove horas trabalhadas

### Para Colaboradores

1. Visualize suas tarefas pendentes
2. Atualize status das atividades
3. Participe dos chats da equipe
4. Comente e anexe arquivos
5. Acompanhe seu progresso

## 🔒 Segurança

- **Row Level Security (RLS)** no Supabase
- Controle granular de permissões
- Validação de dados com Zod
- Sanitização de inputs
- Logs de auditoria

## 📈 Performance

- Lazy loading de componentes
- Cache inteligente com React Query
- Otimização de queries SQL
- Compressão de assets
- Service Worker para cache

## 🚀 Deploy

### Vercel (Recomendado)

```bash
npm run build
# Deploy via Vercel CLI ou GitHub integration
```

### Netlify

```bash
npm run build
# Upload da pasta dist/ para Netlify
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:

- Abra uma issue no GitHub
- Entre em contato via email
- Consulte a documentação técnica

---

**OptiFlow** - Transformando a gestão operacional de lojas de material de construção! 🏗️
