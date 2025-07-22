import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Screens
import LoginScreen from '@/screens/auth/LoginScreen';
import DashboardScreen from '@/screens/DashboardScreen';
import TasksScreen from '@/screens/TasksScreen';
import ChatScreen from '@/screens/ChatScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import TaskDetailScreen from '@/screens/TaskDetailScreen';
import CreateTaskScreen from '@/screens/CreateTaskScreen';
import OfflineScreen from '@/screens/OfflineScreen';

// Services and Hooks
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { OfflineProvider, useOffline } from '@/hooks/useOffline';
import { NotificationProvider } from '@/hooks/useNotifications';
import { LocationProvider } from '@/hooks/useLocation';
import { theme } from '@/utils/theme';
import { setupNotifications } from '@/services/notificationService';

// Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  TaskDetail: { taskId: string };
  CreateTask: undefined;
  Offline: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Chat: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Configurar notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});

function TabNavigator() {
  const { user } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ tabBarLabel: 'Início' }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TasksScreen}
        options={{ tabBarLabel: 'Tarefas' }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ tabBarLabel: 'Chat' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();
  const { isOnline } = useOffline();

  if (loading) {
    return null; // Ou um componente de loading
  }

  if (!isOnline) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Offline" component={OfflineScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen 
            name="TaskDetail" 
            component={TaskDetailScreen}
            options={{ 
              headerShown: true,
              title: 'Detalhes da Tarefa',
              headerStyle: { backgroundColor: theme.colors.primary },
              headerTintColor: 'white',
            }}
          />
          <Stack.Screen 
            name="CreateTask" 
            component={CreateTaskScreen}
            options={{ 
              headerShown: true,
              title: 'Nova Tarefa',
              headerStyle: { backgroundColor: theme.colors.primary },
              headerTintColor: 'white',
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');

  useEffect(() => {
    setupNotifications().then(token => {
      if (token) {
        setExpoPushToken(token);
      }
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <OfflineProvider>
                <NotificationProvider pushToken={expoPushToken}>
                  <LocationProvider>
                    <NavigationContainer>
                      <AppNavigator />
                      <StatusBar style="auto" />
                    </NavigationContainer>
                  </LocationProvider>
                </NotificationProvider>
              </OfflineProvider>
            </AuthProvider>
          </QueryClientProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}