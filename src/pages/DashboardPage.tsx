import React from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { useAuth } from '@/hooks/useAuth';

const DashboardPage = () => {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return null;
  }

  return <RoleDashboard userProfile={userProfile} />;
};

export default DashboardPage;