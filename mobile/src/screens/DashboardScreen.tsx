import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Button, Avatar, Badge } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';
import { useOffline } from '@/hooks/useOffline';
import { useLocation } from '@/hooks/useLocation';
import { useNotifications } from '@/hooks/useNotifications';
import { theme } from '@/utils/theme';

interface DashboardStats {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  overdueTasks: number;
  unreadMessages: number;
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { isOnline, pendingActions, syncData, syncInProgress } = useOffline();
  const { currentLocation, registerCheckIn, registerCheckOut } = useLocation();
  const { unreadCount } = useNotifications();
  
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    unreadMessages: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simular carregamento de dados
      // Em produção, buscar do serviço offline ou API
      setStats({
        totalTasks: 12,
        pendingTasks: 5,
        completedTasks: 6,
        overdueTasks: 1,
        unreadMessages: unreadCount,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    
    if (isOnline) {
      await syncData();
    }
    
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleCheckIn = async () => {
    try {
      const success = await registerCheckIn();
      if (success) {
        Alert.alert('✅ Check-in', 'Check-in registrado com sucesso!');
      } else {
        Alert.alert('❌ Erro', 'Não foi possível registrar o check-in');
      }
    } catch (error) {
      Alert.alert('❌ Erro', 'Erro ao registrar check-in');
    }
  };

  const handleCheckOut = async () => {
    Alert.alert(
      '🏁 Check-out',
      'Deseja registrar sua saída?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const success = await registerCheckOut();
              if (success) {
                Alert.alert('✅ Check-out', 'Check-out registrado com sucesso!');
              } else {
                Alert.alert('❌ Erro', 'Não foi possível registrar o check-out');
              }
            } catch (error) {
              Alert.alert('❌ Erro', 'Erro ao registrar check-out');
            }
          },
        },
      ]
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const renderConnectionStatus = () => (
    <View style={[styles.statusCard, { backgroundColor: isOnline ? '#10B981' : '#EF4444' }]}>
      <Ionicons 
        name={isOnline ? 'wifi' : 'wifi-off'} 
        size={20} 
        color="white" 
      />
      <Text style={styles.statusText}>
        {isOnline ? 'Online' : 'Offline'}
      </Text>
      {pendingActions > 0 && (
        <Badge
          value={pendingActions}
          status="warning"
          containerStyle={{ marginLeft: 8 }}
        />
      )}
    </View>
  );

  const renderQuickActions = () => (
    <Card containerStyle={styles.card}>
      <Text style={styles.cardTitle}>Ações Rápidas</Text>
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity 
          style={[styles.quickAction, { backgroundColor: theme.colors.primary }]}
          onPress={handleCheckIn}
        >
          <Ionicons name="log-in" size={24} color="white" />
          <Text style={styles.quickActionText}>Check-in</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.quickAction, { backgroundColor: '#EF4444' }]}
          onPress={handleCheckOut}
        >
          <Ionicons name="log-out" size={24} color="white" />
          <Text style={styles.quickActionText}>Check-out</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.quickAction, { backgroundColor: '#10B981' }]}
          onPress={() => navigation.navigate('CreateTask' as never)}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.quickActionText}>Nova Tarefa</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.quickAction, { backgroundColor: '#8B5CF6' }]}
          onPress={() => navigation.navigate('Chat' as never)}
        >
          <Ionicons name="chatbubbles" size={24} color="white" />
          <Text style={styles.quickActionText}>Chat</Text>
          {unreadCount > 0 && (
            <Badge
              value={unreadCount}
              status="error"
              containerStyle={styles.badge}
            />
          )}
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderStats = () => (
    <Card containerStyle={styles.card}>
      <Text style={styles.cardTitle}>Resumo de Tarefas</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalTasks}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{stats.pendingTasks}</Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.completedTasks}</Text>
          <Text style={styles.statLabel}>Concluídas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#EF4444' }]}>{stats.overdueTasks}</Text>
          <Text style={styles.statLabel}>Atrasadas</Text>
        </View>
      </View>
    </Card>
  );

  const renderLocationInfo = () => (
    <Card containerStyle={styles.card}>
      <Text style={styles.cardTitle}>Localização</Text>
      <View style={styles.locationContainer}>
        <Ionicons name="location" size={20} color={theme.colors.primary} />
        <Text style={styles.locationText}>
          {currentLocation 
            ? `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
            : 'Localização não disponível'
          }
        </Text>
      </View>
      {currentLocation && (
        <Text style={styles.locationAccuracy}>
          Precisão: {currentLocation.accuracy?.toFixed(0)}m
        </Text>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar
              rounded
              size="medium"
              source={user?.avatar_url ? { uri: user.avatar_url } : undefined}
              title={user?.name?.charAt(0) || 'U'}
              containerStyle={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
              <Text style={styles.userRole}>{user?.role || 'Colaborador'}</Text>
            </View>
          </View>
          {renderConnectionStatus()}
        </View>

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Stats */}
        {renderStats()}

        {/* Location Info */}
        {renderLocationInfo()}

        {/* Sync Button */}
        {!isOnline && pendingActions > 0 && (
          <Card containerStyle={styles.card}>
            <Text style={styles.cardTitle}>Sincronização Pendente</Text>
            <Text style={styles.syncMessage}>
              {pendingActions} ação(ões) aguardando sincronização
            </Text>
            <Button
              title={syncInProgress ? "Sincronizando..." : "Tentar Sincronizar"}
              onPress={syncData}
              disabled={syncInProgress}
              buttonStyle={[styles.syncButton, { backgroundColor: theme.colors.primary }]}
            />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  userRole: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  locationAccuracy: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  syncMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  syncButton: {
    borderRadius: 8,
  },
});