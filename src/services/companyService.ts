
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/database';

export interface CompanyRegistration {
  name: string;
  email: string;
  adminName: string;
  adminEmail: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface UserInvite {
  inviteCode: string;
  name: string;
  email: string;
  password: string;
  sector: string;
  role: 'admin' | 'manager' | 'employee';
  phone?: string;
}

export class CompanyService {
  /**
   * Gera um código de convite único
   */
  private static generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Registra uma nova empresa
   */
  static async registerCompany(data: CompanyRegistration): Promise<{ company: Company | null; error: any }> {
    try {
      console.log('🚀 Iniciando registro de empresa:', { 
        name: data.name, 
        email: data.email, 
        adminEmail: data.adminEmail 
      });

      // Mock company creation
      const mockCompany: Company = {
        id: '1',
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        invite_code: this.generateInviteCode(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('🎉 Registro de empresa concluído com sucesso!');
      return { company: mockCompany, error: null };
    } catch (error) {
      console.error('💥 Erro geral no registro de empresa:', error);
      return { company: null, error };
    }
  }

  /**
   * Valida código de convite
   */
  static async validateInviteCode(inviteCode: string): Promise<{ company: Company | null; error: any }> {
    // Mock validation
    const mockCompany: Company = {
      id: '1',
      name: 'Empresa Exemplo',
      email: 'contato@exemplo.com',
      phone: '(11) 99999-9999',
      address: 'Rua Exemplo, 123',
      invite_code: inviteCode.toUpperCase(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return { company: mockCompany, error: null };
  }

  /**
   * Atualiza informações da empresa
   */
  static async updateCompany(companyId: string, updates: Partial<Company>): Promise<{ error: any }> {
    // Mock update
    console.log('Atualizando empresa:', companyId, updates);
    return { error: null };
  }

  /**
   * Gera novo código de convite
   */
  static async regenerateInviteCode(companyId: string): Promise<{ inviteCode: string | null; error: any }> {
    const newInviteCode = this.generateInviteCode();
    return { inviteCode: newInviteCode, error: null };
  }

  /**
   * Lista usuários da empresa
   */
  static async getCompanyUsers(companyId: string): Promise<{ users: any[] | null; error: any }> {
    // Mock users
    const mockUsers = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@exemplo.com',
        role: 'gerente',
        sector: 'Vendas',
        is_company_admin: false,
        avatar_url: null
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@exemplo.com',
        role: 'colaborador',
        sector: 'Estoque',
        is_company_admin: false,
        avatar_url: null
      }
    ];

    return { users: mockUsers, error: null };
  }

  /**
   * Remove usuário da empresa
   */
  static async removeUserFromCompany(userId: string): Promise<{ error: any }> {
    console.log('Removendo usuário:', userId);
    return { error: null };
  }

  /**
   * Busca estatísticas da empresa
   */
  static async getCompanyStats(companyId: string): Promise<{ stats: any | null; error: any }> {
    const stats = {
      totalUsers: 5,
      totalTasks: 23,
      completedTasks: 15,
      pendingTasks: 8,
      overdueTasks: 2
    };

    return { stats, error: null };
  }
}

// Hook para usar o serviço de empresas
export const useCompany = () => {
  const registerCompany = async (data: CompanyRegistration) => {
    return await CompanyService.registerCompany(data);
  };

  const validateInviteCode = async (inviteCode: string) => {
    return await CompanyService.validateInviteCode(inviteCode);
  };

  const updateCompany = async (companyId: string, updates: Partial<Company>) => {
    return await CompanyService.updateCompany(companyId, updates);
  };

  const regenerateInviteCode = async (companyId: string) => {
    return await CompanyService.regenerateInviteCode(companyId);
  };

  const getCompanyUsers = async (companyId: string) => {
    return await CompanyService.getCompanyUsers(companyId);
  };

  const removeUserFromCompany = async (userId: string) => {
    return await CompanyService.removeUserFromCompany(userId);
  };

  const getCompanyStats = async (companyId: string) => {
    return await CompanyService.getCompanyStats(companyId);
  };

  return {
    registerCompany,
    validateInviteCode,
    updateCompany,
    regenerateInviteCode,
    getCompanyUsers,
    removeUserFromCompany,
    getCompanyStats
  };
};
