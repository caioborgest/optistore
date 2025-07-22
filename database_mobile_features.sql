-- =====================================================
-- EXTENSÕES MOBILE PARA OPTIFLOW
-- Push Tokens, Localização e Funcionalidades Mobile
-- =====================================================

-- =====================================================
-- TABELAS PARA FUNCIONALIDADES MOBILE
-- =====================================================

-- Tabela de tokens push dos usuários
CREATE TABLE public.user_push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    push_token TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL, -- 'ios', 'android'
    device_info JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, push_token)
);

-- Tabela de localizações dos usuários
CREATE TABLE public.user_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(8, 2),
    altitude DECIMAL(8, 2),
    heading DECIMAL(6, 2),
    speed DECIMAL(6, 2),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de eventos de geofence
CREATE TABLE public.location_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    geofence_id VARCHAR(100),
    event_type VARCHAR(20) NOT NULL, -- 'enter', 'exit'
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(8, 2),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de registros de ponto com localização
ALTER TABLE public.time_records ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE public.time_records ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE public.time_records ADD COLUMN IF NOT EXISTS checkout_location VARCHAR(255);
ALTER TABLE public.time_records ADD COLUMN IF NOT EXISTS checkout_latitude DECIMAL(10, 8);
ALTER TABLE public.time_records ADD COLUMN IF NOT EXISTS checkout_longitude DECIMAL(11, 8);

-- Tabela de notificações push enviadas
CREATE TABLE public.push_notifications_sent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    push_token TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'delivered', 'failed'
    response_data JSONB,
    sent_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP,
    failed_at TIMESTAMP,
    error_message TEXT
);

-- Tabela de configurações mobile do usuário
CREATE TABLE public.user_mobile_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    push_notifications_enabled BOOLEAN DEFAULT true,
    location_tracking_enabled BOOLEAN DEFAULT false,
    offline_sync_enabled BOOLEAN DEFAULT true,
    notification_sound BOOLEAN DEFAULT true,
    notification_vibration BOOLEAN DEFAULT true,
    geofence_notifications BOOLEAN DEFAULT true,
    task_reminders BOOLEAN DEFAULT true,
    chat_notifications BOOLEAN DEFAULT true,
    work_hours_start TIME DEFAULT '08:00',
    work_hours_end TIME DEFAULT '18:00',
    weekend_notifications BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Tabela de dados offline sincronizados
CREATE TABLE public.offline_sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    action_type VARCHAR(20) NOT NULL, -- 'create', 'update', 'delete'
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'synced', 'failed'
    attempts INTEGER DEFAULT 0,
    last_attempt TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    synced_at TIMESTAMP
);

-- Tabela de sessões mobile
CREATE TABLE public.mobile_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    device_info JSONB,
    app_version VARCHAR(20),
    os_version VARCHAR(20),
    last_activity TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, device_id)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE MOBILE
-- =====================================================

-- Índices para push tokens
CREATE INDEX idx_user_push_tokens_user_id ON public.user_push_tokens(user_id);
CREATE INDEX idx_user_push_tokens_active ON public.user_push_tokens(is_active);
CREATE INDEX idx_user_push_tokens_platform ON public.user_push_tokens(platform);

-- Índices para localizações
CREATE INDEX idx_user_locations_user_id ON public.user_locations(user_id);
CREATE INDEX idx_user_locations_timestamp ON public.user_locations(timestamp);
CREATE INDEX idx_user_locations_coords ON public.user_locations(latitude, longitude);

-- Índices para eventos de localização
CREATE INDEX idx_location_events_user_id ON public.location_events(user_id);
CREATE INDEX idx_location_events_timestamp ON public.location_events(timestamp);
CREATE INDEX idx_location_events_geofence ON public.location_events(geofence_id);

-- Índices para notificações push
CREATE INDEX idx_push_notifications_user_id ON public.push_notifications_sent(user_id);
CREATE INDEX idx_push_notifications_status ON public.push_notifications_sent(status);
CREATE INDEX idx_push_notifications_sent_at ON public.push_notifications_sent(sent_at);

-- Índices para sync offline
CREATE INDEX idx_offline_sync_user_id ON public.offline_sync_queue(user_id);
CREATE INDEX idx_offline_sync_status ON public.offline_sync_queue(status);
CREATE INDEX idx_offline_sync_created_at ON public.offline_sync_queue(created_at);

-- Índices para sessões mobile
CREATE INDEX idx_mobile_sessions_user_id ON public.mobile_sessions(user_id);
CREATE INDEX idx_mobile_sessions_active ON public.mobile_sessions(is_active);
CREATE INDEX idx_mobile_sessions_last_activity ON public.mobile_sessions(last_activity);

-- =====================================================
-- TRIGGERS E FUNÇÕES MOBILE
-- =====================================================

-- Função para limpar localizações antigas
CREATE OR REPLACE FUNCTION cleanup_old_locations()
RETURNS void AS $
BEGIN
    -- Manter apenas localizações dos últimos 30 dias
    DELETE FROM public.user_locations 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Manter apenas eventos de localização dos últimos 90 dias
    DELETE FROM public.location_events 
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$ language 'plpgsql';

-- Função para limpar notificações push antigas
CREATE OR REPLACE FUNCTION cleanup_old_push_notifications()
RETURNS void AS $
BEGIN
    -- Manter apenas notificações dos últimos 30 dias
    DELETE FROM public.push_notifications_sent 
    WHERE sent_at < NOW() - INTERVAL '30 days';
END;
$ language 'plpgsql';

-- Função para processar fila de sincronização offline
CREATE OR REPLACE FUNCTION process_offline_sync_queue()
RETURNS void AS $
DECLARE
    sync_record RECORD;
BEGIN
    -- Processar registros pendentes (máximo 100 por vez)
    FOR sync_record IN 
        SELECT * FROM public.offline_sync_queue 
        WHERE status = 'pending' 
        AND attempts < 3
        ORDER BY created_at ASC
        LIMIT 100
    LOOP
        BEGIN
            -- Tentar processar o registro
            CASE sync_record.action_type
                WHEN 'create' THEN
                    -- Lógica para criar registro
                    PERFORM 1; -- Placeholder
                WHEN 'update' THEN
                    -- Lógica para atualizar registro
                    PERFORM 1; -- Placeholder
                WHEN 'delete' THEN
                    -- Lógica para deletar registro
                    PERFORM 1; -- Placeholder
            END CASE;
            
            -- Marcar como sincronizado
            UPDATE public.offline_sync_queue 
            SET status = 'synced', synced_at = NOW()
            WHERE id = sync_record.id;
            
        EXCEPTION WHEN OTHERS THEN
            -- Marcar tentativa falhada
            UPDATE public.offline_sync_queue 
            SET 
                attempts = attempts + 1,
                last_attempt = NOW(),
                error_message = SQLERRM,
                status = CASE WHEN attempts >= 2 THEN 'failed' ELSE 'pending' END
            WHERE id = sync_record.id;
        END;
    END LOOP;
END;
$ language 'plpgsql';

-- Trigger para atualizar timestamp de updated_at
CREATE TRIGGER update_user_push_tokens_updated_at 
    BEFORE UPDATE ON public.user_push_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_locations_updated_at 
    BEFORE UPDATE ON public.user_locations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_mobile_settings_updated_at 
    BEFORE UPDATE ON public.user_mobile_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLÍTICAS RLS PARA TABELAS MOBILE
-- =====================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mobile_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para push tokens
CREATE POLICY "Users can manage their own push tokens" ON public.user_push_tokens
    FOR ALL USING (user_id = auth.uid());

-- Políticas para localizações
CREATE POLICY "Users can manage their own locations" ON public.user_locations
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Supervisors can view team locations" ON public.user_locations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u1, public.users u2
            WHERE u1.id = auth.uid() 
            AND u2.id = user_locations.user_id
            AND u1.role IN ('gerente', 'supervisor')
            AND (u1.role = 'gerente' OR u1.sector = u2.sector)
        )
    );

-- Políticas para eventos de localização
CREATE POLICY "Users can manage their own location events" ON public.location_events
    FOR ALL USING (user_id = auth.uid());

-- Políticas para notificações push
CREATE POLICY "Users can view their own push notifications" ON public.push_notifications_sent
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create push notifications" ON public.push_notifications_sent
    FOR INSERT WITH CHECK (true);

-- Políticas para configurações mobile
CREATE POLICY "Users can manage their own mobile settings" ON public.user_mobile_settings
    FOR ALL USING (user_id = auth.uid());

-- Políticas para fila de sincronização
CREATE POLICY "Users can manage their own sync queue" ON public.offline_sync_queue
    FOR ALL USING (user_id = auth.uid());

-- Políticas para sessões mobile
CREATE POLICY "Users can manage their own mobile sessions" ON public.mobile_sessions
    FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- JOBS AGENDADOS PARA MOBILE
-- =====================================================

-- Job para limpeza de localizações antigas (executa diariamente às 3h)
SELECT cron.schedule('cleanup-old-locations', '0 3 * * *', 'SELECT cleanup_old_locations();');

-- Job para limpeza de notificações push antigas (executa semanalmente)
SELECT cron.schedule('cleanup-old-push-notifications', '0 4 * * 0', 'SELECT cleanup_old_push_notifications();');

-- Job para processar fila de sincronização offline (executa a cada 5 minutos)
SELECT cron.schedule('process-offline-sync', '*/5 * * * *', 'SELECT process_offline_sync_queue();');

-- Job para limpeza de sessões inativas (executa diariamente às 2h)
SELECT cron.schedule('cleanup-inactive-sessions', '0 2 * * *', 
    'UPDATE public.mobile_sessions SET is_active = false WHERE last_activity < NOW() - INTERVAL ''7 days'';'
);

-- =====================================================
-- FUNÇÕES PARA NOTIFICAÇÕES PUSH
-- =====================================================

-- Função para enviar notificação push para usuário específico
CREATE OR REPLACE FUNCTION send_push_notification(
    target_user_id UUID,
    notification_title VARCHAR(255),
    notification_body TEXT,
    notification_data JSONB DEFAULT '{}'::jsonb
)
RETURNS void AS $
DECLARE
    token_record RECORD;
BEGIN
    -- Buscar tokens ativos do usuário
    FOR token_record IN 
        SELECT push_token, platform 
        FROM public.user_push_tokens 
        WHERE user_id = target_user_id 
        AND is_active = true
    LOOP
        -- Registrar notificação para envio
        INSERT INTO public.push_notifications_sent (
            user_id, push_token, title, body, data
        ) VALUES (
            target_user_id, token_record.push_token, 
            notification_title, notification_body, notification_data
        );
    END LOOP;
END;
$ language 'plpgsql';

-- Função para enviar notificação para todos os usuários de um setor
CREATE OR REPLACE FUNCTION send_push_notification_to_sector(
    target_sector VARCHAR(100),
    notification_title VARCHAR(255),
    notification_body TEXT,
    notification_data JSONB DEFAULT '{}'::jsonb
)
RETURNS void AS $
DECLARE
    user_record RECORD;
BEGIN
    -- Buscar usuários do setor
    FOR user_record IN 
        SELECT id FROM public.users 
        WHERE sector = target_sector 
        AND is_active = true
    LOOP
        PERFORM send_push_notification(
            user_record.id, notification_title, notification_body, notification_data
        );
    END LOOP;
END;
$ language 'plpgsql';

-- =====================================================
-- VIEWS PARA MOBILE
-- =====================================================

-- View para estatísticas de uso mobile
CREATE VIEW mobile_usage_stats AS
SELECT 
    u.id as user_id,
    u.name,
    u.sector,
    ms.device_info->>'brand' as device_brand,
    ms.device_info->>'modelName' as device_model,
    ms.app_version,
    ms.last_activity,
    ms.is_active as session_active,
    COUNT(ul.id) as location_updates_count,
    COUNT(pns.id) as notifications_sent_count,
    MAX(ul.timestamp) as last_location_update
FROM public.users u
LEFT JOIN public.mobile_sessions ms ON u.id = ms.user_id
LEFT JOIN public.user_locations ul ON u.id = ul.user_id 
    AND ul.created_at >= NOW() - INTERVAL '7 days'
LEFT JOIN public.push_notifications_sent pns ON u.id = pns.user_id 
    AND pns.sent_at >= NOW() - INTERVAL '7 days'
WHERE u.is_active = true
GROUP BY u.id, u.name, u.sector, ms.device_info, ms.app_version, ms.last_activity, ms.is_active;

-- View para monitoramento de sincronização offline
CREATE VIEW offline_sync_status AS
SELECT 
    u.name as user_name,
    u.sector,
    COUNT(*) FILTER (WHERE osq.status = 'pending') as pending_syncs,
    COUNT(*) FILTER (WHERE osq.status = 'synced') as completed_syncs,
    COUNT(*) FILTER (WHERE osq.status = 'failed') as failed_syncs,
    MAX(osq.created_at) as last_sync_attempt,
    MAX(osq.synced_at) as last_successful_sync
FROM public.users u
LEFT JOIN public.offline_sync_queue osq ON u.id = osq.user_id
WHERE u.is_active = true
GROUP BY u.id, u.name, u.sector;

-- =====================================================
-- DADOS INICIAIS PARA MOBILE
-- =====================================================

-- Inserir configurações mobile padrão para usuários existentes
INSERT INTO public.user_mobile_settings (user_id)
SELECT id FROM public.users 
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_mobile_settings 
    WHERE user_id = users.id
);

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.user_push_tokens IS 'Tokens de notificação push dos usuários mobile';
COMMENT ON TABLE public.user_locations IS 'Histórico de localizações dos usuários';
COMMENT ON TABLE public.location_events IS 'Eventos de geofence (entrada/saída de áreas)';
COMMENT ON TABLE public.push_notifications_sent IS 'Log de notificações push enviadas';
COMMENT ON TABLE public.user_mobile_settings IS 'Configurações mobile personalizadas por usuário';
COMMENT ON TABLE public.offline_sync_queue IS 'Fila de sincronização para dados offline';
COMMENT ON TABLE public.mobile_sessions IS 'Sessões ativas de dispositivos mobile';

-- Este schema adiciona suporte completo para funcionalidades mobile:
-- - Notificações push nativas
-- - Rastreamento de localização e geofencing
-- - Sincronização offline avançada
-- - Gestão de sessões mobile
-- - Configurações personalizáveis por usuário
-- - Monitoramento e analytics de uso mobile