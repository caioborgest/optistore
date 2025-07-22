import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeSettings } from '@/components/settings/ThemeSettings';
import { AccessibilitySettings } from '@/components/settings/AccessibilitySettings';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Eye, 
  User, 
  Bell, 
  Shield,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
  const settingsTabs = [
    {
      value: 'appearance',
      label: 'Aparência',
      icon: Palette,
      component: <ThemeSettings />
    },
    {
      value: 'accessibility',
      label: 'Acessibilidade',
      icon: Eye,
      component: <AccessibilitySettings />
    },
    {
      value: 'profile',
      label: 'Perfil',
      icon: User,
      component: <ProfileSettings />
    },
    {
      value: 'notifications',
      label: 'Notificações',
      icon: Bell,
      component: <NotificationSettings />
    },
    {
      value: 'security',
      label: 'Segurança',
      icon: Shield,
      component: <SecuritySettings />
    },
    {
      value: 'performance',
      label: 'Performance',
      icon: Zap,
      component: <PerformanceSettings />
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <SettingsIcon className="h-8 w-8" />
            Configurações
          </h1>
          <p className="text-muted-foreground mt-2">
            Personalize sua experiência no OptiFlow
          </p>
        </div>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value}
                  className="flex items-center gap-2 text-xs md:text-sm"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {settingsTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {tab.component}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </div>
  );
};

// Placeholder components for other settings sections
const ProfileSettings = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <User className="h-5 w-5" />
        Configurações de Perfil
      </CardTitle>
      <CardDescription>
        Gerencie suas informações pessoais e preferências de conta
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Configurações de perfil em desenvolvimento...
      </p>
    </CardContent>
  </Card>
);

const NotificationSettings = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Bell className="h-5 w-5" />
        Configurações de Notificações
      </CardTitle>
      <CardDescription>
        Controle como e quando você recebe notificações
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Configurações de notificações em desenvolvimento...
      </p>
    </CardContent>
  </Card>
);

const SecuritySettings = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Shield className="h-5 w-5" />
        Configurações de Segurança
      </CardTitle>
      <CardDescription>
        Gerencie sua segurança e privacidade
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Configurações de segurança em desenvolvimento...
      </p>
    </CardContent>
  </Card>
);

const PerformanceSettings = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Zap className="h-5 w-5" />
        Configurações de Performance
      </CardTitle>
      <CardDescription>
        Otimize o desempenho da aplicação
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Configurações de performance em desenvolvimento...
      </p>
    </CardContent>
  </Card>
);

export default Settings;