import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, Button, Badge, SearchBar } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';
import { useOffline } from '@/hooks/useOffline';
import { theme } from '@/utils/theme';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  sector: string;
  assigned_user?: {
    name: string;
    email: string;
  };
  offline?: boolean;
}

export default function TasksScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { isOnline, getOfflineData, updateTaskOffline } = useOffline();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'overdue'>('all');

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchQuery, selectedFilter]);

  const loadTasks = async () => {
    try {
      const offlineTasks = await getOfflineData('tasks');
      setTasks(offlineTasks);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Filtrar por status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(task => task.status === selectedFilter);
    }

    // Filtrar por busca
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.sector.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetail' as never, { taskId: task.id } as never);
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await updateTaskOffline(taskId, { 
        status: newStatus,
        ...(newStatus === 'completed' && { completed_at: new Date().toISOString() })
      });
      
      // Atualizar estado local
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { ...task, status: newStatus }
            : task
        )
      );

      Alert.alert('✅ Sucesso', 'Status da tarefa atualizado!');
    } catch (error) {
      Alert.alert('❌ Erro', 'Não foi possível atualizar o status da tarefa');
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in_progress': return '#3B82F6';
      case 'overdue': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'in_progress': return 'Em Andamento';
      case 'overdue': return 'Atrasada';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const renderTaskItem = ({ item: task }: { item: Task }) => (
    <Card containerStyle={styles.taskCard}>
      <TouchableOpacity onPress={() => handleTaskPress(task)}>
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleContainer}>
            <Text style={styles.taskTitle} numberOfLines={2}>
              {task.title}
            </Text>
            {task.offline && (
              <Ionicons name="cloud-offline" size={16} color="#F59E0B" style={styles.offlineIcon} />
            )}
          </View>
          <Badge
            value={getPriorityLabel(task.priority)}
            badgeStyle={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}
            textStyle={styles.badgeText}
          />
        </View>

        {task.description && (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {task.description}
          </Text>
        )}

        <View style={styles.taskMeta}>
          <Text style={styles.taskSector}>{task.sector}</Text>
          {task.due_date && (
            <Text style={styles.taskDueDate}>
              Vence: {new Date(task.due_date).toLocaleDateString('pt-BR')}
            </Text>
          )}
        </View>

        <View style={styles.taskFooter}>
          <Badge
            value={getStatusLabel(task.status)}
            badgeStyle={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}
            textStyle={styles.badgeText}
          />
          
          {task.status !== 'completed' && (
            <View style={styles.taskActions}>
              {task.status === 'pending' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
                  onPress={() => handleStatusChange(task.id, 'in_progress')}
                >
                  <Ionicons name="play" size={16} color="white" />
                </TouchableOpacity>
              )}
              
              {(task.status === 'pending' || task.status === 'in_progress') && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                  onPress={() => handleStatusChange(task.id, 'completed')}
                >
                  <Ionicons name="checkmark" size={16} color="white" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      {[
        { key: 'all', label: 'Todas' },
        { key: 'pending', label: 'Pendentes' },
        { key: 'in_progress', label: 'Em Andamento' },
        { key: 'completed', label: 'Concluídas' },
        { key: 'overdue', label: 'Atrasadas' },
      ].map(filter => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            selectedFilter === filter.key && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter(filter.key as any)}
        >
          <Text style={[
            styles.filterButtonText,
            selectedFilter === filter.key && styles.filterButtonTextActive
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Tarefas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateTask' as never)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <SearchBar
        placeholder="Buscar tarefas..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
        inputStyle={styles.searchInput}
        searchIcon={{ color: '#6B7280' }}
        clearIcon={{ color: '#6B7280' }}
      />

      {renderFilterButtons()}

      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Nenhuma tarefa encontrada</Text>
            <Text style={styles.emptySubtext}>
              {selectedFilter === 'all' 
                ? 'Você não tem tarefas no momento'
                : `Nenhuma tarefa ${getStatusLabel(selectedFilter as Task['status']).toLowerCase()}`
              }
            </Text>
          </View>
        }
      />

      {!isOnline && (
        <View style={styles.offlineNotice}>
          <Ionicons name="cloud-offline" size={16} color="#F59E0B" />
          <Text style={styles.offlineText}>Modo Offline - Alterações serão sincronizadas</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    backgroundColor: 'white',
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  searchInputContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  searchInput: {
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
  },
  taskCard: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  offlineIcon: {
    marginLeft: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  taskSector: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskDueDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  offlineText: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 8,
  },
});