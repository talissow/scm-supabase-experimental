-- ===== SCHEMA MÍNIMO - APENAS O ESSENCIAL =====
-- Este é o schema mais simples possível, apenas para o sistema funcionar

-- 1. Criar tabela de usuários
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de movimentações
CREATE TABLE IF NOT EXISTS public.movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    reason VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de tipos customizados
CREATE TABLE IF NOT EXISTS public.custom_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela de auditoria
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255),
    action VARCHAR(100),
    table_name VARCHAR(100),
    record_id UUID,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Habilitar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas permissivas (acesso total para desenvolvimento)
DROP POLICY IF EXISTS "Allow all on users" ON public.users;
CREATE POLICY "Allow all on users" ON public.users FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on products" ON public.products;
CREATE POLICY "Allow all on products" ON public.products FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on movements" ON public.movements;
CREATE POLICY "Allow all on movements" ON public.movements FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on custom_types" ON public.custom_types;
CREATE POLICY "Allow all on custom_types" ON public.custom_types FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on audit_log" ON public.audit_log;
CREATE POLICY "Allow all on audit_log" ON public.audit_log FOR ALL USING (true);

-- 8. Inserir usuário admin padrão
INSERT INTO public.users (id, email, full_name, role, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@scm.local',
    'Administrador',
    'admin',
    true
) ON CONFLICT (id) DO NOTHING;

-- 9. Inserir tipos customizados (sem description)
INSERT INTO public.custom_types (name)
VALUES 
    ('Material de Construção'),
    ('Ferramentas'),
    ('Equipamentos de Segurança'),
    ('Limpeza')
ON CONFLICT DO NOTHING;

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Schema mínimo criado com sucesso!';
    RAISE NOTICE '✅ Tabelas: users, products, movements, custom_types, audit_log';
    RAISE NOTICE '✅ Usuário admin: admin@scm.local';
    RAISE NOTICE '✅ Tipos customizados criados';
    RAISE NOTICE '⚙️ Configure Authentication URLs no Supabase';
    RAISE NOTICE '🚀 Sistema pronto para uso!';
END $$;
