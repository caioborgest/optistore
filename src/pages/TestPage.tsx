import React from 'react';
import Layout from '@/components/Layout';
import { TestFunctionalities } from '@/components/TestFunctionalities';
import { TestAdvancedFeatures } from '@/components/TestAdvancedFeatures';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TestPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <Tabs defaultValue="advanced" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="advanced">Funcionalidades Avançadas</TabsTrigger>
            <TabsTrigger value="basic">Funcionalidades Básicas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="advanced">
            <TestAdvancedFeatures />
          </TabsContent>
          
          <TabsContent value="basic">
            <TestFunctionalities />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TestPage;