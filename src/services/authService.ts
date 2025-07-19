import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type UserRole = 'gerente' | 'supervisor' | 'colaborador';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  sector: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  sector: string;
  phone?: string;
  role?: UserRole;
}

export class AuthService {
  /**
   * Realiza login do usuário
   */
  static async signIn(credentials: LoginCredentials): Promise<{ user: User | null; error: any }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    if (error) {
      return { user: null, error: this.translateAuthError(error.message) };
    }

    return { user: data.user, error: null };
  }

  /**
   * Registra novo usuário
   */
  static async signUp(userData: RegisterData): Promise<{ user: User | null; error: any }> {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          sector: userData.sector,
          phone: userData.phone,
          role: userData.role || 'colaborador'
        }
      }
    });

    if (error) {
      return { user: null, error: this.translateAuthError(error.message) };
    }

    // Criar perfil do usuário na tabela users
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: userData.email,
          name: userData.name,
          sector: userData.sector,
          phone: userData.phone,
          role: userData.role || 'colaborador'
        });

      if (profileError) {
        console.error('Erro ao criar perfil do usuário:', profileError);
      }
    }

    return { user: data.user, error: null };
  }

  /**
   * Realiza logout do usuário
   */
  static async signOut(): Promise<{ error: any }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  /**
   * Busca perfil completo do usuário atual
   */
  static async getCurrentUserProfile(): Promise<{ profile: UserProfile | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { profile: null, error: 'Usuário não autenticado' };
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return { profile: data, error };
  }

  /**
   * Atualiza perfil do usuário
   */
  static async updateProfile(updates: Partial<UserProfile>): Promise<{ error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Usuário não autenticado' };
    }

    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    return { error };
  }

  /**
   * Verifica se o usuário tem permissão para uma ação específica
   */
  static async hasPermission(
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete',
    targetUserId?: string,
    targetSector?: string
  ): Promise<boolean> {
    const { profile } = await this.getCurrentUserProfile();
    
    if (!profile) return false;

    return this.checkPermission(profile, resource, action, targetUserId, targetSector);
  }

  /**
   * Lógica de verificação de permissões
   */
  private static checkPermission(
    userProfile: UserProfile,
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete',
    targetUserId?: string,
    targetSector?: string
  ): boolean {
    const { role, sector, id: userId } = userProfile;

    // Gerente tem acesso total
    if (role === 'gerente') {
      return true;
    }

    switch (resource) {
      case 'tasks':
        return this.checkTaskPermission(role, sector, action, targetUserId, targetSector, userId);
      
      case 'users':
        return this.checkUserPermission(role, sector, action, targetUserId, targetSector);
      
      case 'chats':
        return this.checkChatPermission(role, action);
      
      case 'reports':
        return this.checkReportPermission(role, sector, targetSector);
      
      default:
        return false;
    }
  }

  private static checkTaskPermission(
    role: UserRole,
    userSector: string,
    action: string,
    targetUserId?: string,
    targetSector?: string,
    userId?: string
  ): boolean {
    switch (action) {
      case 'create':
        // Supervisor pode criar tarefas no seu setor
        // Colaborador não pode criar tarefas
        return role === 'supervisor';
      
      case 'read':
        // Todos podem ver tarefas atribuídas a eles
        if (targetUserId === userId) return true;
        // Supervisor pode ver tarefas do seu setor
        if (role === 'supervisor' && targetSector === userSector) return true;
        return false;
      
      case 'update':
        // Usuário pode atualizar suas próprias tarefas
        if (targetUserId === userId) return true;
        // Supervisor pode atualizar tarefas do seu setor
        if (role === 'supervisor' && targetSector === userSector) return true;
        return false;
      
      case 'delete':
        // Apenas supervisor pode deletar tarefas do seu setor
        return role === 'supervisor' && targetSector === userSector;
      
      default:
        return false;
    }
  }

  private static checkUserPermission(
    role: UserRole,
    userSector: string,
    action: string,
    targetUserId?: string,
    targetSector?: string
  ): boolean {
    switch (action) {
      case 'create':
        // Apenas gerente pode criar usuários
        return role === 'gerente';
      
      case 'read':
        // Supervisor pode ver usuários do seu setor
        if (role === 'supervisor' && targetSector === userSector) return true;
        // Todos podem ver informações básicas de outros usuários
        return true;
      
      case 'update':
        // Supervisor pode atualizar usuários do seu setor
        if (role === 'supervisor' && targetSector === userSector) return true;
        return false;
      
      case 'delete':
        // Apenas gerente pode deletar usuários
        return role === 'gerente';
      
      default:
        return false;
    }
  }

  private static checkChatPermission(role: UserRole, action: string): boolean {
    switch (action) {
      case 'create':
        // Todos podem criar chats
        return true;
      
      case 'read':
        // Todos podem ler chats que participam
        return true;
      
      case 'update':
        // Todos podem atualizar chats que são admins
        return true;
      
      case 'delete':
        // Supervisor e gerente podem deletar chats
        return role === 'supervisor' || role === 'gerente';
      
      default:
        return false;
    }
  }

  private static checkReportPermission(
    role: UserRole,
    userSector: string,
    targetSector?: string
  ): boolean {
    // Gerente vê todos os relatórios
    if (role === 'gerente') return true;
    
    // Supervisor vê relatórios do seu setor
    if (role === 'supervisor' && targetSector === userSector) return true;
    
    // Colaborador não vê relatórios
    return false;
  }

  /**
   * Busca usuários com filtros baseados nas permissões
   */
  static async getUsers(sector?: string): Promise<{ users: UserProfile[] | null; error: any }> {
    const { profile } = await this.getCurrentUserProfile();
    
    if (!profile) {
      return { users: null, error: 'Usuário não autenticado' };
    }

    let query = supabase
      .from('users')
      .select('*')
      .eq('is_active', true);

    // Aplicar filtros baseados no papel do usuário
    if (profile.role === 'supervisor') {
      // Supervisor só vê usuários do seu setor
      query = query.eq('sector', profile.sector);
    } else if (profile.role === 'colaborador') {
      // Colaborador só vê informações básicas
      query = query.select('id, name, sector, avatar_url');
    }

    if (sector) {
      query = query.eq('sector', sector);
    }

    const { data, error } = await query.order('name');

    return { users: data, error };
  }

  /**
   * Cria novo usuário (apenas gerente)
   */
  static async createUser(userData: RegisterData): Promise<{ user: UserProfile | null; error: any }> {
    const hasPermission = await this.hasPermission('users', 'create');
    
    if (!hasPermission) {
      return { user: null, error: 'Sem permissão para criar usuários' };
    }

    const { user, error } = await this.signUp(userData);
    
    if (error) return { user: null, error };

    // Buscar perfil criado
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user?.id)
      .single();

    return { user: profile, error: null };
  }

  /**
   * Atualiza usuário (gerente ou supervisor do mesmo setor)
   */
  static async updateUser(userId: string, updates: Partial<UserProfile>): Promise<{ error: any }> {
    // Buscar usuário alvo para verificar setor
    const { data: targetUser } = await supabase
      .from('users')
      .select('sector')
      .eq('id', userId)
      .single();

    const hasPermission = await this.hasPermission('users', 'update', userId, targetUser?.sector);
    
    if (!hasPermission) {
      return { error: 'Sem permissão para atualizar este usuário' };
    }

    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    return { error };
  }

  /**
   * Desativa usuário (apenas gerente)
   */
  static async deactivateUser(userId: string): Promise<{ error: any }> {
    const hasPermission = await this.hasPermission('users', 'delete');
    
    if (!hasPermission) {
      return { error: 'Sem permissão para desativar usuários' };
    }

    const { error } = await supabase
      .from('users')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    return { error };
  }

  /**
   * Traduz erros de autenticação para português
   */
  private static translateAuthError(errorMessage: string): string {
    const translations: { [key: string]: string } = {
      'Invalid login credentials': 'Email ou senha incorretos',
      'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
      'User already registered': 'Usuário já cadastrado com este email',
      'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
      'Unable to validate email address: invalid format': 'Formato de email inválido',
      'Signup is disabled': 'Cadastro desabilitado',
      'Email rate limit exceeded': 'Muitas tentativas. Tente novamente mais tarde.'
    };

    return translations[errorMessage] || errorMessage;
  }

  /**
   * Verifica se o usuário atual é gerente
   */
  static async isManager(): Promise<boolean> {
    const { profile } = await this.getCurrentUserProfile();
    return profile?.role === 'gerente';
  }

  /**
   * Verifica se o usuário atual é supervisor
   */
  static async isSupervisor(): Promise<boolean> {
    const { profile } = await this.getCurrentUserProfile();
    return profile?.role === 'supervisor';
  }

  /**
   * Busca setores disponíveis
   */
  static async getSectors(): Promise<{ sectors: string[] | null; error: any }> {
    const { data, error } = await supabase
      .from('users')
      .select('sector')
      .eq('is_active', true);

    if (error) return { sectors: null, error };

    const uniqueSectors = [...new Set(data?.map(u => u.sector).filter(Boolean))];
    return { sectors: uniqueSectors, error: null };
  }
}

// Hook para usar o serviço de autenticação
export const useAuthService = () => {
  const signIn = async (credentials: LoginCredentials) => {
    return await AuthService.signIn(credentials);
  };

  const signUp = async (userData: RegisterData) => {
    return await AuthService.signUp(userData);
  };

  const signOut = async () => {
    return await AuthService.signOut();
  };

  const getCurrentUserProfile = async () => {
    return await AuthService.getCurrentUserProfile();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    return await AuthService.updateProfile(updates);
  };

  const hasPermission = async (resource: string, action: 'create' | 'read' | 'update' | 'delete', targetUserId?: string, targetSector?: string) => {
    return await AuthService.hasPermission(resource, action, targetUserId, targetSector);
  };

  const getUsers = async (sector?: string) => {
    return await AuthService.getUsers(sector);
  };

  const createUser = async (userData: RegisterData) => {
    return await AuthService.createUser(userData);
  };

  const updateUser = async (userId: string, updates: Partial<UserProfile>) => {
    return await AuthService.updateUser(userId, updates);
  };

  const deactivateUser = async (userId: string) => {
    return await AuthService.deactivateUser(userId);
  };

  const isManager = async () => {
    return await AuthService.isManager();
  };

  const isSupervisor = async () => {
    return await AuthService.isSupervisor();
  };

  const getSectors = async () => {
    return await AuthService.getSectors();
  };

  return {
    signIn,
    signUp,
    signOut,
    getCurrentUserProfile,
    updateProfile,
    hasPermission,
    getUsers,
    createUser,
    updateUser,
    deactivateUser,
    isManager,
    isSupervisor,
    getSectors
  };
};