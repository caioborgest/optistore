import React from 'react';
import Layout from '@/components/Layout';
import { ModernTaskManager } from '@/components/tasks/ModernTaskManager';

const TasksPage: React.FC = () => {
  return (
    <Layout>
      <ModernTaskManager />
    </Layout>
  );
};

export default TasksPage;