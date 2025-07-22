import React from 'react';
import Layout from '@/components/Layout';
import { IntegrationManager } from '@/components/integrations/IntegrationManager';

const IntegrationsPage: React.FC = () => {
  return (
    <Layout>
      <IntegrationManager />
    </Layout>
  );
};

export default IntegrationsPage;