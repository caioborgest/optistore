
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import Dashboard from '../components/Dashboard';
import ClientManager from '../components/ClientManager';
import InteractionManager from '../components/InteractionManager';
import TaskManager from '../components/TaskManager';
import Calendar from '../components/Calendar';
import Chat from '../components/Chat';
import Reports from '../components/Reports';
import Settings from '../components/Settings';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';

const Index = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<ClientManager />} />
          <Route path="/interactions" element={<InteractionManager />} />
          <Route path="/tasks" element={<TaskManager />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default Index;
