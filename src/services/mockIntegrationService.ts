
// Mock integration service since integration tables don't exist in the database
export interface Integration {
  id: string;
  name: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const mockIntegrationService = {
  async getIntegrations(): Promise<{ data: Integration[]; error: null }> {
    // Mock data for integrations
    const mockData: Integration[] = [
      {
        id: '1',
        name: 'Sistema ERP',
        type: 'ERP',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'CRM Salesforce',
        type: 'CRM',
        status: 'inactive',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return { data: mockData, error: null };
  },

  async createIntegration(integrationData: Omit<Integration, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Integration; error: null }> {
    const newIntegration: Integration = {
      id: Math.random().toString(36).substr(2, 9),
      ...integrationData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return { data: newIntegration, error: null };
  },

  async updateIntegration(id: string, updates: Partial<Integration>): Promise<{ data: Integration; error: null }> {
    const updatedIntegration: Integration = {
      id,
      name: 'Updated Integration',
      type: 'ERP',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...updates
    };

    return { data: updatedIntegration, error: null };
  },

  async deleteIntegration(id: string): Promise<{ error: null }> {
    return { error: null };
  },

  async syncData(integrationId: string): Promise<{ data: any; error: null }> {
    return { data: { status: 'synced' }, error: null };
  }
};
