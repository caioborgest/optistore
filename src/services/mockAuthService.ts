
import { UserProfile, Company } from '@/types/database';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export class MockAuthService {
  private static readonly MOCK_COMPANY: Company = {
    id: '1',
    name: 'Empresa Exemplo',
    email: 'contato@exemplo.com',
    phone: '(11) 99999-9999',
    address: 'Rua Exemplo, 123',
    invite_code: 'MOCK1234',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  private static readonly MOCK_USER: UserProfile = {
    id: '1',
    name: 'João Silva',
    email: 'admin@exemplo.com',
    avatar_url: null,
    company_id: '1',
    is_company_admin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Simular um "banco de dados" local
  private static users: UserProfile[] = [MockAuthService.MOCK_USER];
  private static companies: Company[] = [MockAuthService.MOCK_COMPANY];

  static async signIn(email: string, password: string): Promise<{ user: any; userProfile: UserProfile | null; company: Company | null; error: any }> {
    console.log('🔑 Tentando fazer login com:', email);
    
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Procurar usuário
    const userProfile = this.users.find(u => u.email === email);
    
    if (!userProfile) {
      console.log('❌ Usuário não encontrado');
      return {
        user: null,
        userProfile: null,
        company: null,
        error: { message: 'Usuário não encontrado' }
      };
    }

    // Simular verificação de senha (aceita qualquer senha para demo)
    console.log('✅ Login realizado com sucesso');
    
    // Buscar empresa do usuário
    const company = this.companies.find(c => c.id === userProfile.company_id);
    
    // Salvar no localStorage para persistência
    localStorage.setItem('mock-auth', 'true');
    localStorage.setItem('mock-user', JSON.stringify(userProfile));
    localStorage.setItem('mock-company', JSON.stringify(company));

    return {
      user: { id: userProfile.id, email: userProfile.email },
      userProfile,
      company,
      error: null
    };
  }

  static async signUp(data: RegisterData): Promise<{ user: any; userProfile: UserProfile | null; company: Company | null; error: any }> {
    console.log('📝 Registrando usuário:', data);
    
    // Simulate registration delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar se email já existe
    const existingUser = this.users.find(u => u.email === data.email);
    if (existingUser) {
      return {
        user: null,
        userProfile: null,
        company: null,
        error: { message: 'Email já cadastrado' }
      };
    }

    const newUser: UserProfile = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      avatar_url: null,
      company_id: '1',
      is_company_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Adicionar à lista de usuários
    this.users.push(newUser);
    
    // Salvar no localStorage
    localStorage.setItem('mock-auth', 'true');
    localStorage.setItem('mock-user', JSON.stringify(newUser));
    localStorage.setItem('mock-company', JSON.stringify(this.MOCK_COMPANY));

    console.log('✅ Usuário registrado com sucesso');

    return {
      user: { id: newUser.id, email: newUser.email },
      userProfile: newUser,
      company: this.MOCK_COMPANY,
      error: null
    };
  }

  static async signOut(): Promise<{ error: any }> {
    console.log('🚪 Fazendo logout');
    localStorage.removeItem('mock-auth');
    localStorage.removeItem('mock-user');
    localStorage.removeItem('mock-company');
    return { error: null };
  }

  static async getCurrentUser(): Promise<{ user: any; userProfile: UserProfile | null; company: Company | null; error: any }> {
    const isLoggedIn = localStorage.getItem('mock-auth') === 'true';
    
    if (isLoggedIn) {
      const userProfile = JSON.parse(localStorage.getItem('mock-user') || 'null');
      const company = JSON.parse(localStorage.getItem('mock-company') || 'null');
      
      if (userProfile && company) {
        return {
          user: { id: userProfile.id, email: userProfile.email },
          userProfile,
          company,
          error: null
        };
      }
    }

    return {
      user: null,
      userProfile: null,
      company: null,
      error: null
    };
  }

  static async updateProfile(updates: Partial<UserProfile>): Promise<{ userProfile: UserProfile | null; error: any }> {
    const currentUser = JSON.parse(localStorage.getItem('mock-user') || 'null');
    
    if (!currentUser) {
      return { userProfile: null, error: { message: 'Usuário não autenticado' } };
    }

    const updatedProfile = { ...currentUser, ...updates };
    
    // Atualizar na lista de usuários
    const userIndex = this.users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      this.users[userIndex] = updatedProfile;
    }
    
    // Salvar no localStorage
    localStorage.setItem('mock-user', JSON.stringify(updatedProfile));

    return { userProfile: updatedProfile, error: null };
  }

  // Método para registro de empresa
  static async registerCompany(companyData: any): Promise<{ company: Company | null; adminUser: UserProfile | null; error: any }> {
    console.log('🏢 Registrando empresa:', companyData);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newCompany: Company = {
      id: Date.now().toString(),
      name: companyData.name,
      email: companyData.email,
      phone: companyData.phone || '',
      address: companyData.address || '',
      invite_code: this.generateInviteCode(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const adminUser: UserProfile = {
      id: Date.now().toString(),
      name: companyData.adminName || 'Admin',
      email: companyData.adminEmail || companyData.email,
      avatar_url: null,
      company_id: newCompany.id,
      is_company_admin: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Adicionar à lista
    this.companies.push(newCompany);
    this.users.push(adminUser);

    // Fazer login automático
    localStorage.setItem('mock-auth', 'true');
    localStorage.setItem('mock-user', JSON.stringify(adminUser));
    localStorage.setItem('mock-company', JSON.stringify(newCompany));

    console.log('✅ Empresa registrada e login automático realizado');

    return {
      company: newCompany,
      adminUser,
      error: null
    };
  }

  private static generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const useMockAuth = () => {
  const signIn = async (email: string, password: string) => {
    return await MockAuthService.signIn(email, password);
  };

  const signUp = async (data: RegisterData) => {
    return await MockAuthService.signUp(data);
  };

  const signOut = async () => {
    return await MockAuthService.signOut();
  };

  const getCurrentUser = async () => {
    return await MockAuthService.getCurrentUser();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    return await MockAuthService.updateProfile(updates);
  };

  const registerCompany = async (companyData: any) => {
    return await MockAuthService.registerCompany(companyData);
  };

  return {
    signIn,
    signUp,
    signOut,
    getCurrentUser,
    updateProfile,
    registerCompany
  };
};
