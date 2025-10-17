-- ===== SCHEMA SQL FINAL - SEM FUNÇÕES PROBLEMÁTICAS =====
-- Este script é a versão mais simples e funcional

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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de movimentações
CREATE TABLE IF NOT EXISTS public.movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('entrada', 'saida', 'ajuste')),
    quantity INTEGER NOT NULL,
    destination VARCHAR(255),
    reason VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de tipos customizados
CREATE TABLE IF NOT EXISTS public.custom_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela de auditoria (simplificada)
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(type);
CREATE INDEX IF NOT EXISTS idx_movements_product_id ON public.movements(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_created_at ON public.movements(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);

-- 7. Habilitar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 8. Remover políticas existentes (se houver) e criar novas
-- Users
DROP POLICY IF EXISTS "Allow all operations on users" ON public.users;
CREATE POLICY "Allow all operations on users" ON public.users
FOR ALL USING (true);

-- Products
DROP POLICY IF EXISTS "Allow all operations on products" ON public.products;
CREATE POLICY "Allow all operations on products" ON public.products
FOR ALL USING (true);

-- Movements
DROP POLICY IF EXISTS "Allow all operations on movements" ON public.movements;
CREATE POLICY "Allow all operations on movements" ON public.movements
FOR ALL USING (true);

-- Custom Types
DROP POLICY IF EXISTS "Allow all operations on custom_types" ON public.custom_types;
CREATE POLICY "Allow all operations on custom_types" ON public.custom_types
FOR ALL USING (true);

-- Audit Log
DROP POLICY IF EXISTS "Allow all operations on audit_log" ON public.audit_log;
CREATE POLICY "Allow all operations on audit_log" ON public.audit_log
FOR ALL USING (true);

-- 9. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Triggers para updated_at (apenas nas tabelas que têm updated_at)
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Inserir usuário admin padrão (se não existir)
INSERT INTO public.users (id, email, full_name, role, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@scm.local',
    'Administrador do Sistema',
    'admin',
    true
) ON CONFLICT (id) DO NOTHING;

-- 12. Inserir alguns tipos customizados de exemplo
INSERT INTO public.custom_types (name, description)
VALUES 
    ('Material de Construção', 'Materiais para construção civil'),
    ('Ferramentas', 'Ferramentas e equipamentos'),
    ('Equipamentos de Segurança', 'EPIs e equipamentos de segurança'),
    ('Limpeza', 'Produtos de limpeza e higiene')
ON CONFLICT DO NOTHING;

-- 13. Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Schema criado com sucesso!';
    RAISE NOTICE 'Tabelas criadas: users, products, movements, custom_types, audit_log';
    RAISE NOTICE 'Usuário admin padrão: admin@scm.local';
    RAISE NOTICE 'Tipos customizados de exemplo inseridos';
    RAISE NOTICE 'Configure as URLs no Authentication Settings do Supabase';
    RAISE NOTICE 'Agora você pode criar usuários sem erro!';
END $$;
