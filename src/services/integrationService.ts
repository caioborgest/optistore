import { supabase } from '@/integrations/supabase/client';

// Tipos para diferentes integrações
export interface ERPIntegration {
  id: string;
  name: string;
  type: 'sap' | 'oracle' | 'totvs' | 'senior' | 'custom';
  apiUrl: string;
  apiKey: string;
  isActive: boolean;
  lastSync: string;
  config: Record<string, any>;
}

export interface TimeClockIntegration {
  id: string;
  name: string;
  type: 'biometric' | 'card' | 'mobile' | 'web';
  apiUrl: string;
  credentials: Record<string, string>;
  isActive: boolean;
  syncInterval: number; // em minutos
}

export interface ECommerceIntegration {
  id: string;
  platform: 'shopify' | 'woocommerce' | 'magento' | 'vtex' | 'mercadolivre';
  storeUrl: string;
  apiCredentials: Record<string, string>;
  isActive: boolean;
  syncProducts: boolean;
  syncOrders: boolean;
  syncInventory: boolean;
}

export interface BIIntegration {
  id: string;
  platform: 'powerbi' | 'tableau' | 'looker' | 'metabase';
  connectionString: string;
  credentials: Record<string, string>;
  isActive: boolean;
  autoSync: boolean;
}

// Dados de exemplo para diferentes tipos de ERP
const ERP_TEMPLATES = {
  sap: {
    name: 'SAP Business One',
    endpoints: {
      products: '/api/products',
      inventory: '/api/inventory',
      sales: '/api/sales',
      customers: '/api/customers'
    },
    authType: 'oauth2'
  },
  totvs: {
    name: 'TOTVS Protheus',
    endpoints: {
      products: '/rest/products',
      stock: '/rest/stock',
      orders: '/rest/orders'
    },
    authType: 'basic'
  },
  senior: {
    name: 'Senior Sistemas',
    endpoints: {
      produtos: '/api/v1/produtos',
      estoque: '/api/v1/estoque',
      vendas: '/api/v1/vendas'
    },
    authType: 'apikey'
  }
};

export const IntegrationService = {
  // ===== GESTÃO DE INTEGRAÇÕES =====
  
  async getIntegrations(): Promise<{ data?: any[]; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { error };
    }
  },

  async createIntegration(integration: Partial<ERPIntegration | TimeClockIntegration | ECommerceIntegration>): Promise<{ data?: any; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .insert([integration])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { error };
    }
  },

  async testConnection(integration: any): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const response = await fetch(`${integration.apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${integration.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // ===== INTEGRAÇÃO COM ERP =====
  
  async syncERPProducts(erpId: string): Promise<{ success: boolean; synced: number; error?: string }> {
    try {
      // Buscar configuração do ERP
      const { data: erp, error: erpError } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', erpId)
        .eq('type', 'erp')
        .single();

      if (erpError) throw erpError;

      const template = ERP_TEMPLATES[erp.erp_type as keyof typeof ERP_TEMPLATES];
      if (!template) throw new Error('Tipo de ERP não suportado');

      // Fazer requisição para o ERP
      const response = await fetch(`${erp.api_url}${template.endpoints.products}`, {
        headers: {
          'Authorization': `Bearer ${erp.api_key}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API do ERP: ${response.statusText}`);
      }

      const products = await response.json();

      // Sincronizar produtos no banco local
      let syncedCount = 0;
      for (const product of products.data || products) {
        const { error: insertError } = await supabase
          .from('erp_products')
          .upsert({
            erp_id: erpId,
            external_id: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            stock: product.stock,
            category: product.category,
            last_sync: new Date().toISOString()
          });

        if (!insertError) syncedCount++;
      }

      // Atualizar timestamp da última sincronização
      await supabase
        .from('integrations')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', erpId);

      return { success: true, synced: syncedCount };
    } catch (error: any) {
      return { success: false, synced: 0, error: error.message };
    }
  },

  async getERPInventory(erpId: string): Promise<{ data?: any[]; error?: string }> {
    try {
      const { data: erp } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', erpId)
        .single();

      if (!erp) throw new Error('ERP não encontrado');

      const template = ERP_TEMPLATES[erp.erp_type as keyof typeof ERP_TEMPLATES];
      const endpoint = template.endpoints.inventory || template.endpoints.stock;

      const response = await fetch(`${erp.api_url}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${erp.api_key}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
      }

      const inventory = await response.json();
      return { data: inventory.data || inventory };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // ===== INTEGRAÇÃO COM SISTEMA DE PONTO =====
  
  async syncTimeClockData(integrationId: string, startDate: Date, endDate: Date): Promise<{ success: boolean; records: number; error?: string }> {
    try {
      const { data: integration } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', integrationId)
        .eq('type', 'timeclock')
        .single();

      if (!integration) throw new Error('Integração de ponto não encontrada');

      // Simular chamada para API de ponto
      const response = await fetch(`${integration.api_url}/timerecords`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${integration.credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API de ponto: ${response.statusText}`);
      }

      const timeRecords = await response.json();
      let recordCount = 0;

      // Sincronizar registros de ponto
      for (const record of timeRecords.data || timeRecords) {
        const { error } = await supabase
          .from('time_records')
          .upsert({
            integration_id: integrationId,
            user_id: record.userId,
            clock_in: record.clockIn,
            clock_out: record.clockOut,
            total_hours: record.totalHours,
            date: record.date,
            location: record.location,
            last_sync: new Date().toISOString()
          });

        if (!error) recordCount++;
      }

      return { success: true, records: recordCount };
    } catch (error: any) {
      return { success: false, records: 0, error: error.message };
    }
  },

  async getUserTimeRecords(userId: string, startDate: Date, endDate: Date): Promise<{ data?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('time_records')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      return { data, error: error?.message };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // ===== INTEGRAÇÃO COM E-COMMERCE =====
  
  async syncECommerceOrders(integrationId: string): Promise<{ success: boolean; orders: number; error?: string }> {
    try {
      const { data: integration } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', integrationId)
        .eq('type', 'ecommerce')
        .single();

      if (!integration) throw new Error('Integração de e-commerce não encontrada');

      let apiUrl = '';
      let headers: Record<string, string> = {};

      // Configurar API baseada na plataforma
      switch (integration.platform) {
        case 'shopify':
          apiUrl = `${integration.store_url}/admin/api/2023-10/orders.json`;
          headers = {
            'X-Shopify-Access-Token': integration.api_credentials.accessToken,
            'Content-Type': 'application/json'
          };
          break;
        case 'woocommerce':
          apiUrl = `${integration.store_url}/wp-json/wc/v3/orders`;
          headers = {
            'Authorization': `Basic ${btoa(`${integration.api_credentials.consumerKey}:${integration.api_credentials.consumerSecret}`)}`,
            'Content-Type': 'application/json'
          };
          break;
        case 'vtex':
          apiUrl = `${integration.store_url}/api/oms/pvt/orders`;
          headers = {
            'X-VTEX-API-AppKey': integration.api_credentials.appKey,
            'X-VTEX-API-AppToken': integration.api_credentials.appToken,
            'Content-Type': 'application/json'
          };
          break;
      }

      const response = await fetch(apiUrl, { headers });

      if (!response.ok) {
        throw new Error(`Erro na API do e-commerce: ${response.statusText}`);
      }

      const orders = await response.json();
      let orderCount = 0;

      // Sincronizar pedidos
      const orderList = orders.orders || orders.data || orders;
      for (const order of orderList) {
        const { error } = await supabase
          .from('ecommerce_orders')
          .upsert({
            integration_id: integrationId,
            external_id: order.id,
            order_number: order.number || order.order_number,
            customer_email: order.email || order.customer?.email,
            total_amount: order.total_price || order.total,
            status: order.status,
            created_at: order.created_at,
            items: order.line_items || order.items,
            last_sync: new Date().toISOString()
          });

        if (!error) orderCount++;
      }

      return { success: true, orders: orderCount };
    } catch (error: any) {
      return { success: false, orders: 0, error: error.message };
    }
  },

  async updateInventoryFromECommerce(integrationId: string): Promise<{ success: boolean; updated: number; error?: string }> {
    try {
      // Buscar pedidos recentes do e-commerce
      const { data: orders, error: ordersError } = await supabase
        .from('ecommerce_orders')
        .select('*')
        .eq('integration_id', integrationId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // últimas 24h

      if (ordersError) throw ordersError;

      let updatedCount = 0;

      // Atualizar estoque baseado nos pedidos
      for (const order of orders || []) {
        const items = order.items || [];
        
        for (const item of items) {
          // Criar tarefa para reposição se estoque baixo
          const { data: product } = await supabase
            .from('erp_products')
            .select('*')
            .eq('sku', item.sku)
            .single();

          if (product && product.stock < 10) { // Estoque baixo
            await supabase
              .from('tasks')
              .insert({
                title: `Repor estoque: ${product.name}`,
                description: `Produto com estoque baixo (${product.stock} unidades). Pedido #${order.order_number} pode ficar em falta.`,
                sector: 'Estoque',
                priority: 'high',
                status: 'pending',
                created_by: null, // Sistema
                tags: ['estoque', 'reposição', 'ecommerce']
              });

            updatedCount++;
          }
        }
      }

      return { success: true, updated: updatedCount };
    } catch (error: any) {
      return { success: false, updated: 0, error: error.message };
    }
  },

  // ===== INTEGRAÇÃO COM BI =====
  
  async exportToBITool(biIntegrationId: string, dataType: 'tasks' | 'users' | 'performance'): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: integration } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', biIntegrationId)
        .eq('type', 'bi')
        .single();

      if (!integration) throw new Error('Integração de BI não encontrada');

      let data: any[] = [];

      // Buscar dados baseado no tipo
      switch (dataType) {
        case 'tasks':
          const { data: tasks } = await supabase
            .from('tasks')
            .select(`
              *,
              assigned_user:users!assigned_to(name, sector),
              creator:users!created_by(name, sector)
            `);
          data = tasks || [];
          break;
        
        case 'users':
          const { data: users } = await supabase
            .from('users')
            .select('*');
          data = users || [];
          break;
        
        case 'performance':
          // Buscar dados de performance (implementar lógica específica)
          data = [];
          break;
      }

      // Enviar dados para ferramenta de BI
      const response = await fetch(`${integration.connection_string}/api/data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${integration.credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dataset: dataType,
          data: data,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API do BI: ${response.statusText}`);
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // ===== WEBHOOKS E AUTOMAÇÕES =====
  
  async setupWebhook(integrationId: string, eventType: string, callbackUrl: string): Promise<{ success: boolean; webhookId?: string; error?: string }> {
    try {
      const { data: integration } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', integrationId)
        .single();

      if (!integration) throw new Error('Integração não encontrada');

      // Registrar webhook na API externa
      const response = await fetch(`${integration.api_url}/webhooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${integration.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: eventType,
          callback_url: callbackUrl,
          active: true
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar webhook: ${response.statusText}`);
      }

      const webhook = await response.json();

      // Salvar webhook no banco
      await supabase
        .from('webhooks')
        .insert({
          integration_id: integrationId,
          external_id: webhook.id,
          event_type: eventType,
          callback_url: callbackUrl,
          is_active: true
        });

      return { success: true, webhookId: webhook.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async processWebhookEvent(eventType: string, payload: any): Promise<{ success: boolean; error?: string }> {
    try {
      switch (eventType) {
        case 'order.created':
          // Criar tarefa para processar pedido
          await supabase
            .from('tasks')
            .insert({
              title: `Processar pedido #${payload.order_number}`,
              description: `Novo pedido recebido no e-commerce. Cliente: ${payload.customer_email}`,
              sector: 'Vendas',
              priority: 'medium',
              status: 'pending',
              tags: ['ecommerce', 'pedido']
            });
          break;

        case 'inventory.low':
          // Criar tarefa para reposição
          await supabase
            .from('tasks')
            .insert({
              title: `Repor estoque: ${payload.product_name}`,
              description: `Produto com estoque baixo: ${payload.current_stock} unidades`,
              sector: 'Estoque',
              priority: 'high',
              status: 'pending',
              tags: ['estoque', 'reposição']
            });
          break;

        case 'employee.clockin':
          // Registrar entrada do funcionário
          await supabase
            .from('time_records')
            .insert({
              user_id: payload.employee_id,
              clock_in: payload.timestamp,
              date: new Date().toISOString().split('T')[0],
              location: payload.location
            });
          break;
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};