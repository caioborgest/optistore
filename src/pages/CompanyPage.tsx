import React from 'react';
import Layout from '@/components/Layout';
import { CompanySettings } from '@/components/CompanySettings';

const CompanyPage: React.FC = () => {
  return (
    <Layout>
      <CompanySettings />
    </Layout>
  );
};

export default CompanyPage;