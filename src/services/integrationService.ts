
import { supabase } from '@/integrations/supabase/client';

export interface Integration {
  id: string;
  name: string;
  type: string;
  provider?: string;
  api_url?: string;
  api_key?: string;
  credentials?: any;
  config?: any;
  status: string;
  last_sync?: string;
  sync_interval?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const integrationService = {
  async getIntegrations(): Promise<{ data: Integration[]; error: any }> {
    return await supabase
      .from('integrations')
      .select('*')
      .order('created_at', { ascending: false });
  },

  async getIntegrationById(id: string): Promise<{ data: Integration | null; error: any }> {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  },

  async createIntegration(integrationData: Omit<Integration, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Integration | null; error: any }> {
    const { data, error } = await supabase
      .from('integrations')
      .insert([integrationData])
      .select()
      .single();
    
    return { data, error };
  },

  async updateIntegration(id: string, updates: Partial<Integration>): Promise<{ data: Integration | null; error: any }> {
    const { data, error } = await supabase
      .from('integrations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },

  async deleteIntegration(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', id);
    
    return { error };
  },

  async syncData(integrationId: string): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .rpc('sync_integration_data', { integration_id: integrationId });
    
    return { data, error };
  },

  async getIntegrationLogs(integrationId: string): Promise<{ data: any[]; error: any }> {
    const { data, error } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('integration_id', integrationId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  async getIntegrationProducts(integrationId: string): Promise<{ data: any[]; error: any }> {
    const { data, error } = await supabase
      .from('erp_products')
      .select('*')
      .eq('integration_id', integrationId)
      .order('name', { ascending: true });
    
    return { data, error };
  },

  async getIntegrationOrders(integrationId: string): Promise<{ data: any[]; error: any }> {
    const { data, error } = await supabase
      .from('ecommerce_orders')
      .select('*')
      .eq('integration_id', integrationId)
      .order('order_date', { ascending: false });
    
    return { data, error };
  }
};
