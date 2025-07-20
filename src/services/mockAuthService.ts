
import { UserProfile, Company } from '@/types/database';

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
    email: 'joao@exemplo.com',
    avatar_url: null,
    company_id: '1',
    role: 'admin',
    sector: 'TI',
    is_active: true,
    is_company_admin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  static async login(email: string, password: string): Promise<{ user: any; userProfile: UserProfile | null; company: Company | null; error: any }> {
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === 'admin@exemplo.com' && password === 'admin123') {
      return {
        user: { id: '1', email: 'admin@exemplo.com' },
        userProfile: this.MOCK_USER,
        company: this.MOCK_COMPANY,
        error: null
      };
    }

    return {
      user: null,
      userProfile: null,
      company: null,
      error: { message: 'Credenciais inválidas' }
    };
  }

  static async register(data: any): Promise<{ user: any; userProfile: UserProfile | null; company: Company | null; error: any }> {
    // Simulate registration delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockProfile: UserProfile = {
      id: '2',
      name: data.name,
      email: data.email,
      avatar_url: null,
      company_id: '1',
      role: data.role || 'employee',
      sector: data.sector || 'Geral',
      is_active: true,
      is_company_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return {
      user: { id: '2', email: data.email },
      userProfile: mockProfile,
      company: this.MOCK_COMPANY,
      error: null
    };
  }

  static async logout(): Promise<{ error: any }> {
    return { error: null };
  }

  static async getCurrentUser(): Promise<{ user: any; userProfile: UserProfile | null; company: Company | null; error: any }> {
    // Check if user is "logged in" (simulate session)
    const isLoggedIn = localStorage.getItem('mock-auth') === 'true';
    
    if (isLoggedIn) {
      return {
        user: { id: '1', email: 'admin@exemplo.com' },
        userProfile: this.MOCK_USER,
        company: this.MOCK_COMPANY,
        error: null
      };
    }

    return {
      user: null,
      userProfile: null,
      company: null,
      error: null
    };
  }

  static async updateProfile(updates: Partial<UserProfile>): Promise<{ userProfile: UserProfile | null; error: any }> {
    const updatedProfile = { ...this.MOCK_USER, ...updates };
    return { userProfile: updatedProfile, error: null };
  }
}

export const useMockAuth = () => {
  const login = async (email: string, password: string) => {
    const result = await MockAuthService.login(email, password);
    if (!result.error) {
      localStorage.setItem('mock-auth', 'true');
    }
    return result;
  };

  const register = async (data: any) => {
    const result = await MockAuthService.register(data);
    if (!result.error) {
      localStorage.setItem('mock-auth', 'true');
    }
    return result;
  };

  const logout = async () => {
    localStorage.removeItem('mock-auth');
    return await MockAuthService.logout();
  };

  const getCurrentUser = async () => {
    return await MockAuthService.getCurrentUser();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    return await MockAuthService.updateProfile(updates);
  };

  return {
    login,
    register,
    logout,
    getCurrentUser,
    updateProfile
  };
};
