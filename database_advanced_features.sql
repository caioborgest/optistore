-- =====================================================
-- EXTENSÕES AVANÇADAS PARA OPTIFLOW
-- Relatórios, Integrações e Funcionalidades Avançadas
-- =====================================================

-- =====================================================
-- TABELAS PARA INTEGRAÇÕES
-- =====================================================

-- Tabela de integrações configuradas
CREATE TABLE public.integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'erp', 'timeclock', 'ecommerce', 'bi'
    provider VARCHAR(100), -- 'sap', 'totvs', 'shopify', etc.
    api_url TEXT,
    api_key TEXT,
    credentials JSONB, -- Credenciais específicas por tipo
    config JSONB, -- Configurações específicas
    is_active BOOLEAN DEFAULT false,
    last_sync TIMESTAMP,
    sync_interval INTEGER DEFAULT 60, -- em minutos
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de produtos sincronizados do ERP
CREATE TABLE public.erp_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    external_id VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2),
    cost DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    unit VARCHAR(20),
    barcode VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(integration_id, external_id)
);

-- Tabela de registros de ponto
CREATE TABLE public.time_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.integrations(id),
    user_id UUID REFERENCES public.users(id),
    date DATE NOT NULL,
    clock_in TIMESTAMP,
    clock_out TIMESTAMP,
    break_start TIMESTAMP,
    break_end TIMESTAMP,
    total_hours DECIMAL(4,2),
    overtime_hours DECIMAL(4,2),
    location VARCHAR(255),
    device_id VARCHAR(100),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'normal', -- 'normal', 'late', 'absent', 'holiday'
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMP,
    last_sync TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Tabela de pedidos do e-commerce
CREATE TABLE public.ecommerce_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    external_id VARCHAR(255) NOT NULL,
    order_number VARCHAR(100) NOT NULL,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    total_amount DECIMAL(10,2),
    status VARCHAR(50),
    payment_method VARCHAR(100),
    shipping_method VARCHAR(100),
    shipping_address JSONB,
    items JSONB, -- Array de itens do pedido
    notes TEXT,
    order_date TIMESTAMP,
    last_sync TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(integration_id, external_id)
);

-- Tabela de webhooks configurados
CREATE TABLE public.webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    callback_url TEXT NOT NULL,
    secret_key VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_triggered TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de logs de sincronização
CREATE TABLE public.sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    sync_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'success', 'error', 'partial'
    records_processed INTEGER DEFAULT 0,
    records_success INTEGER DEFAULT 0,
    records_error INTEGER DEFAULT 0,
    error_message TEXT,
    execution_time INTEGER, -- em segundos
    started_at TIMESTAMP NOT NULL,
    finished_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELAS PARA RELATÓRIOS AVANÇADOS
-- =====================================================

-- Tabela de métricas calculadas (cache)
CREATE TABLE public.metrics_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type VARCHAR(100) NOT NULL,
    period_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    sector VARCHAR(100),
    user_id UUID REFERENCES public.users(id),
    metric_data JSONB NOT NULL,
    calculated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    UNIQUE(metric_type, period_type, period_start, period_end, sector, user_id)
);

-- Tabela de relatórios salvos
CREATE TABLE public.saved_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(100) NOT NULL,
    filters JSONB,
    config JSONB,
    created_by UUID REFERENCES public.users(id),
    is_public BOOLEAN DEFAULT false,
    scheduled BOOLEAN DEFAULT false,
    schedule_config JSONB, -- Configuração de agendamento
    last_generated TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de exportações de relatórios
CREATE TABLE public.report_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.saved_reports(id),
    export_type VARCHAR(50) NOT NULL, -- 'pdf', 'excel', 'csv'
    file_url TEXT,
    file_size INTEGER,
    status VARCHAR(50) DEFAULT 'processing', -- 'processing', 'completed', 'error'
    error_message TEXT,
    exported_by UUID REFERENCES public.users(id),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELAS PARA FUNCIONALIDADES AVANÇADAS
-- =====================================================

-- Tabela de automações/workflows
CREATE TABLE public.automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(100) NOT NULL, -- 'task_created', 'task_completed', 'time_record', etc.
    trigger_config JSONB,
    actions JSONB, -- Array de ações a executar
    is_active BOOLEAN DEFAULT true,
    execution_count INTEGER DEFAULT 0,
    last_executed TIMESTAMP,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de execuções de automações
CREATE TABLE public.automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES public.automations(id) ON DELETE CASCADE,
    trigger_data JSONB,
    status VARCHAR(50) NOT NULL, -- 'success', 'error', 'partial'
    actions_executed INTEGER DEFAULT 0,
    error_message TEXT,
    execution_time INTEGER, -- em milissegundos
    executed_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de templates de tarefas
CREATE TABLE public.task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    title_template VARCHAR(255) NOT NULL,
    description_template TEXT,
    sector VARCHAR(100),
    priority task_priority DEFAULT 'medium',
    estimated_hours INTEGER,
    tags TEXT[],
    checklist JSONB, -- Lista de itens de verificação
    attachments JSONB, -- Templates de anexos
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de avaliações de tarefas
CREATE TABLE public.task_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    rated_by UUID REFERENCES public.users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
    timeliness_score INTEGER CHECK (timeliness_score >= 1 AND timeliness_score <= 5),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(task_id, rated_by)
);

-- Tabela de metas e objetivos
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    goal_type VARCHAR(100) NOT NULL, -- 'productivity', 'quality', 'efficiency', 'custom'
    target_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(50), -- '%', 'hours', 'tasks', etc.
    period_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    sector VARCHAR(100),
    assigned_to UUID REFERENCES public.users(id),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
    progress DECIMAL(5,2) DEFAULT 0, -- Percentual de progresso
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para integrações
CREATE INDEX idx_integrations_type ON public.integrations(type);
CREATE INDEX idx_integrations_active ON public.integrations(is_active);
CREATE INDEX idx_integrations_last_sync ON public.integrations(last_sync);

-- Índices para produtos ERP
CREATE INDEX idx_erp_products_integration ON public.erp_products(integration_id);
CREATE INDEX idx_erp_products_sku ON public.erp_products(sku);
CREATE INDEX idx_erp_products_stock ON public.erp_products(stock);
CREATE INDEX idx_erp_products_active ON public.erp_products(is_active);

-- Índices para registros de ponto
CREATE INDEX idx_time_records_user_date ON public.time_records(user_id, date);
CREATE INDEX idx_time_records_date ON public.time_records(date);
CREATE INDEX idx_time_records_status ON public.time_records(status);

-- Índices para pedidos e-commerce
CREATE INDEX idx_ecommerce_orders_integration ON public.ecommerce_orders(integration_id);
CREATE INDEX idx_ecommerce_orders_status ON public.ecommerce_orders(status);
CREATE INDEX idx_ecommerce_orders_date ON public.ecommerce_orders(order_date);

-- Índices para métricas
CREATE INDEX idx_metrics_cache_type_period ON public.metrics_cache(metric_type, period_type, period_start);
CREATE INDEX idx_metrics_cache_expires ON public.metrics_cache(expires_at);

-- Índices para automações
CREATE INDEX idx_automations_trigger_type ON public.automations(trigger_type);
CREATE INDEX idx_automations_active ON public.automations(is_active);

-- Índices para avaliações
CREATE INDEX idx_task_ratings_task ON public.task_ratings(task_id);
CREATE INDEX idx_task_ratings_rating ON public.task_ratings(rating);

-- Índices para metas
CREATE INDEX idx_goals_period ON public.goals(period_start, period_end);
CREATE INDEX idx_goals_assigned_to ON public.goals(assigned_to);
CREATE INDEX idx_goals_status ON public.goals(status);

-- =====================================================
-- TRIGGERS E FUNÇÕES AVANÇADAS
-- =====================================================

-- Função para calcular métricas automaticamente
CREATE OR REPLACE FUNCTION calculate_daily_metrics()
RETURNS void AS $
DECLARE
    current_date DATE := CURRENT_DATE;
    sector_record RECORD;
    user_record RECORD;
BEGIN
    -- Calcular métricas por setor
    FOR sector_record IN 
        SELECT DISTINCT sector FROM public.tasks WHERE sector IS NOT NULL
    LOOP
        INSERT INTO public.metrics_cache (
            metric_type, period_type, period_start, period_end, sector, metric_data, expires_at
        )
        SELECT 
            'sector_productivity',
            'daily',
            current_date,
            current_date,
            sector_record.sector,
            jsonb_build_object(
                'total_tasks', COUNT(*),
                'completed_tasks', COUNT(*) FILTER (WHERE status = 'completed'),
                'completion_rate', ROUND(
                    (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 2
                ),
                'avg_completion_time', AVG(
                    EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600
                ) FILTER (WHERE status = 'completed' AND completed_at IS NOT NULL)
            ),
            current_date + INTERVAL '7 days'
        FROM public.tasks 
        WHERE sector = sector_record.sector 
        AND DATE(created_at) = current_date
        ON CONFLICT (metric_type, period_type, period_start, period_end, sector, user_id) 
        DO UPDATE SET 
            metric_data = EXCLUDED.metric_data,
            calculated_at = NOW(),
            expires_at = EXCLUDED.expires_at;
    END LOOP;

    -- Calcular métricas por usuário
    FOR user_record IN 
        SELECT DISTINCT assigned_to FROM public.tasks WHERE assigned_to IS NOT NULL
    LOOP
        INSERT INTO public.metrics_cache (
            metric_type, period_type, period_start, period_end, user_id, metric_data, expires_at
        )
        SELECT 
            'user_productivity',
            'daily',
            current_date,
            current_date,
            user_record.assigned_to,
            jsonb_build_object(
                'tasks_assigned', COUNT(*),
                'tasks_completed', COUNT(*) FILTER (WHERE status = 'completed'),
                'completion_rate', ROUND(
                    (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 2
                ),
                'hours_worked', COALESCE(SUM(actual_hours), 0)
            ),
            current_date + INTERVAL '7 days'
        FROM public.tasks 
        WHERE assigned_to = user_record.assigned_to 
        AND DATE(created_at) = current_date
        ON CONFLICT (metric_type, period_type, period_start, period_end, sector, user_id) 
        DO UPDATE SET 
            metric_data = EXCLUDED.metric_data,
            calculated_at = NOW(),
            expires_at = EXCLUDED.expires_at;
    END LOOP;
END;
$ language 'plpgsql';

-- Função para processar automações
CREATE OR REPLACE FUNCTION process_automations(trigger_type_param VARCHAR, trigger_data_param JSONB)
RETURNS void AS $
DECLARE
    automation_record RECORD;
    action_record JSONB;
    execution_id UUID;
    actions_count INTEGER := 0;
    success_count INTEGER := 0;
    start_time TIMESTAMP := NOW();
BEGIN
    -- Buscar automações ativas para o tipo de trigger
    FOR automation_record IN 
        SELECT * FROM public.automations 
        WHERE trigger_type = trigger_type_param 
        AND is_active = true
    LOOP
        -- Criar registro de execução
        INSERT INTO public.automation_executions (
            automation_id, trigger_data, status, executed_at
        ) VALUES (
            automation_record.id, trigger_data_param, 'processing', start_time
        ) RETURNING id INTO execution_id;

        -- Processar cada ação
        FOR action_record IN 
            SELECT * FROM jsonb_array_elements(automation_record.actions)
        LOOP
            actions_count := actions_count + 1;
            
            BEGIN
                -- Executar ação baseada no tipo
                CASE action_record->>'type'
                    WHEN 'create_task' THEN
                        INSERT INTO public.tasks (
                            title, description, sector, priority, status, created_by
                        ) VALUES (
                            action_record->>'title',
                            action_record->>'description',
                            action_record->>'sector',
                            (action_record->>'priority')::task_priority,
                            'pending',
                            (trigger_data_param->>'user_id')::UUID
                        );
                        
                    WHEN 'send_notification' THEN
                        INSERT INTO public.notifications (
                            user_id, title, content, type
                        ) VALUES (
                            (action_record->>'user_id')::UUID,
                            action_record->>'title',
                            action_record->>'content',
                            'system'
                        );
                        
                    WHEN 'update_task_status' THEN
                        UPDATE public.tasks 
                        SET status = (action_record->>'status')::task_status
                        WHERE id = (trigger_data_param->>'task_id')::UUID;
                END CASE;
                
                success_count := success_count + 1;
                
            EXCEPTION WHEN OTHERS THEN
                -- Log do erro, mas continua processando outras ações
                CONTINUE;
            END;
        END LOOP;

        -- Atualizar registro de execução
        UPDATE public.automation_executions 
        SET 
            status = CASE WHEN success_count = actions_count THEN 'success' 
                         WHEN success_count > 0 THEN 'partial' 
                         ELSE 'error' END,
            actions_executed = success_count,
            execution_time = EXTRACT(EPOCH FROM (NOW() - start_time)) * 1000
        WHERE id = execution_id;

        -- Atualizar contador de execuções da automação
        UPDATE public.automations 
        SET 
            execution_count = execution_count + 1,
            last_executed = NOW()
        WHERE id = automation_record.id;
    END LOOP;
END;
$ language 'plpgsql';

-- Trigger para executar automações quando tarefas são criadas
CREATE OR REPLACE FUNCTION trigger_task_automations()
RETURNS TRIGGER AS $
BEGIN
    -- Executar automações para tarefa criada
    IF TG_OP = 'INSERT' THEN
        PERFORM process_automations('task_created', to_jsonb(NEW));
    END IF;
    
    -- Executar automações para tarefa completada
    IF TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed' THEN
        PERFORM process_automations('task_completed', to_jsonb(NEW));
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$ language 'plpgsql';

CREATE TRIGGER task_automations_trigger
    AFTER INSERT OR UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION trigger_task_automations();

-- =====================================================
-- JOBS AGENDADOS AVANÇADOS
-- =====================================================

-- Job para calcular métricas diárias (executa todo dia às 1h)
SELECT cron.schedule('calculate-daily-metrics', '0 1 * * *', 'SELECT calculate_daily_metrics();');

-- Job para limpeza de cache de métricas expiradas (executa diariamente às 2h)
SELECT cron.schedule('cleanup-expired-metrics', '0 2 * * *', 
    'DELETE FROM public.metrics_cache WHERE expires_at < NOW();'
);

-- Job para limpeza de logs de sincronização antigos (executa semanalmente)
SELECT cron.schedule('cleanup-sync-logs', '0 3 * * 0',
    'DELETE FROM public.sync_logs WHERE created_at < NOW() - INTERVAL ''30 days'';'
);

-- Job para limpeza de exportações de relatórios expiradas
SELECT cron.schedule('cleanup-report-exports', '0 4 * * *',
    'DELETE FROM public.report_exports WHERE expires_at < NOW();'
);

-- =====================================================
-- POLÍTICAS RLS PARA NOVAS TABELAS
-- =====================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Políticas para integrações (apenas gerentes)
CREATE POLICY "Only managers can manage integrations" ON public.integrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'gerente'
        )
    );

-- Políticas para registros de ponto
CREATE POLICY "Users can view their own time records" ON public.time_records
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Supervisors can view team time records" ON public.time_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u1, public.users u2
            WHERE u1.id = auth.uid() 
            AND u2.id = time_records.user_id
            AND u1.role IN ('gerente', 'supervisor')
            AND (u1.role = 'gerente' OR u1.sector = u2.sector)
        )
    );

-- Políticas para métricas (baseado no papel do usuário)
CREATE POLICY "Users can view relevant metrics" ON public.metrics_cache
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (
                role = 'gerente' OR 
                (role = 'supervisor' AND sector = metrics_cache.sector)
            )
        )
    );

-- Políticas para relatórios salvos
CREATE POLICY "Users can manage their own reports" ON public.saved_reports
    FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Users can view public reports" ON public.saved_reports
    FOR SELECT USING (is_public = true);

-- Políticas para templates de tarefas
CREATE POLICY "Users can view relevant task templates" ON public.task_templates
    FOR SELECT USING (
        is_public = true OR 
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (role = 'gerente' OR sector = task_templates.sector)
        )
    );

-- Políticas para metas
CREATE POLICY "Users can view relevant goals" ON public.goals
    FOR SELECT USING (
        assigned_to = auth.uid() OR
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (
                role = 'gerente' OR 
                (role = 'supervisor' AND sector = goals.sector)
            )
        )
    );

-- =====================================================
-- VIEWS PARA RELATÓRIOS AVANÇADOS
-- =====================================================

-- View para dashboard executivo
CREATE VIEW executive_dashboard AS
SELECT 
    'today' as period,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'overdue') as overdue_tasks,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 2
    ) as completion_rate,
    COUNT(DISTINCT assigned_to) as active_users,
    COUNT(DISTINCT sector) as active_sectors
FROM public.tasks 
WHERE DATE(created_at) = CURRENT_DATE

UNION ALL

SELECT 
    'week' as period,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'overdue') as overdue_tasks,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 2
    ) as completion_rate,
    COUNT(DISTINCT assigned_to) as active_users,
    COUNT(DISTINCT sector) as active_sectors
FROM public.tasks 
WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)

UNION ALL

SELECT 
    'month' as period,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'overdue') as overdue_tasks,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 2
    ) as completion_rate,
    COUNT(DISTINCT assigned_to) as active_users,
    COUNT(DISTINCT sector) as active_sectors
FROM public.tasks 
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE);

-- View para análise de produtividade por usuário
CREATE VIEW user_productivity_analysis AS
SELECT 
    u.id,
    u.name,
    u.sector,
    u.role,
    COUNT(t.id) as total_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'overdue') as overdue_tasks,
    ROUND(
        (COUNT(t.id) FILTER (WHERE t.status = 'completed')::DECIMAL / NULLIF(COUNT(t.id), 0)) * 100, 2
    ) as completion_rate,
    AVG(t.actual_hours) FILTER (WHERE t.status = 'completed') as avg_hours_per_task,
    AVG(tr.rating) as avg_rating,
    SUM(COALESCE(time_rec.total_hours, 0)) as total_hours_worked
FROM public.users u
LEFT JOIN public.tasks t ON u.id = t.assigned_to
LEFT JOIN public.task_ratings tr ON t.id = tr.task_id
LEFT JOIN public.time_records time_rec ON u.id = time_rec.user_id 
    AND time_rec.date >= CURRENT_DATE - INTERVAL '30 days'
WHERE u.is_active = true
GROUP BY u.id, u.name, u.sector, u.role;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.integrations IS 'Configurações de integrações com sistemas externos';
COMMENT ON TABLE public.erp_products IS 'Produtos sincronizados de sistemas ERP';
COMMENT ON TABLE public.time_records IS 'Registros de ponto dos funcionários';
COMMENT ON TABLE public.ecommerce_orders IS 'Pedidos sincronizados de plataformas de e-commerce';
COMMENT ON TABLE public.metrics_cache IS 'Cache de métricas calculadas para performance';
COMMENT ON TABLE public.automations IS 'Automações e workflows configurados';
COMMENT ON TABLE public.task_templates IS 'Templates reutilizáveis para criação de tarefas';
COMMENT ON TABLE public.goals IS 'Metas e objetivos organizacionais';

-- Este schema adiciona funcionalidades avançadas ao OptiFlow:
-- - Sistema completo de integrações (ERP, E-commerce, Ponto, BI)
-- - Relatórios avançados com cache de métricas
-- - Automações e workflows
-- - Templates de tarefas
-- - Sistema de metas e objetivos
-- - Avaliações de performance
-- - Jobs agendados para manutenção automática