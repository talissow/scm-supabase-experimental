-- ===== SCHEMA SQL SIMPLES - SEM ACESSO AO AUTH =====
-- Este script evita acessar o schema auth diretamente
-- Use este se o supabase_schema_public.sql der erro de permissão

-- 1. Criar tabela de usuários (sem referência ao auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de produtos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'unidade',
    type VARCHAR(100) DEFAULT 'material',
    location VARCHAR(255),
    supplier VARCHAR(255),
    cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id)
);

-- 3. Criar tabela de movimentações
CREATE TABLE IF NOT EXISTS public.movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('entrada', 'saida', 'ajuste')),
    quantity INTEGER NOT NULL,
    reason VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id)
);

-- 4. Criar tabela de tipos customizados
CREATE TABLE IF NOT EXISTS public.custom_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id)
);

-- 5. Criar tabela de auditoria
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(type);
CREATE INDEX IF NOT EXISTS idx_movements_product_id ON public.movements(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_created_at ON public.movements(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);

-- 7. Habilitar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas RLS temporárias (permissivas para desenvolvimento)
-- ATENÇÃO: Estas políticas são muito permissivas - ajuste conforme necessário

-- Política para users (permitir tudo temporariamente)
CREATE POLICY IF NOT EXISTS "Allow all operations on users" ON public.users
FOR ALL USING (true);

-- Política para products (permitir tudo temporariamente)
CREATE POLICY IF NOT EXISTS "Allow all operations on products" ON public.products
FOR ALL USING (true);

-- Política para movements (permitir tudo temporariamente)
CREATE POLICY IF NOT EXISTS "Allow all operations on movements" ON public.movements
FOR ALL USING (true);

-- Política para custom_types (permitir tudo temporariamente)
CREATE POLICY IF NOT EXISTS "Allow all operations on custom_types" ON public.custom_types
FOR ALL USING (true);

-- Política para audit_log (permitir tudo temporariamente)
CREATE POLICY IF NOT EXISTS "Allow all operations on audit_log" ON public.audit_log
FOR ALL USING (true);

-- 9. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Função para log de auditoria (simplificada)
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_log (
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values
    ) VALUES (
        COALESCE(NEW.created_by, OLD.created_by),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- 12. Triggers de auditoria
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON public.users
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON public.products
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_movements AFTER INSERT OR UPDATE OR DELETE ON public.movements
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_custom_types AFTER INSERT OR UPDATE OR DELETE ON public.custom_types
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- 13. Inserir usuário admin padrão (se não existir)
INSERT INTO public.users (id, email, full_name, role, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@scm.local',
    'Administrador do Sistema',
    'admin',
    true
) ON CONFLICT (id) DO NOTHING;

-- 14. Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Schema criado com sucesso!';
    RAISE NOTICE 'Tabelas criadas: users, products, movements, custom_types, audit_log';
    RAISE NOTICE 'Usuário admin padrão: admin@scm.local';
    RAISE NOTICE 'Configure as URLs no Authentication Settings do Supabase';
END $$;
