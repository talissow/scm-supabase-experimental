-- ===== SCHEMA SQL SEGURO PARA SUPABASE =====
-- Este script verifica se as tabelas existem antes de criá-las
-- Execute este SQL no Supabase SQL Editor

-- Verificar e criar tabela de Produtos (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
        CREATE TABLE products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            type TEXT NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 0,
            min_quantity INTEGER NOT NULL DEFAULT 0,
            unit TEXT NOT NULL DEFAULT 'unid',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
        
        -- Índices para melhor performance
        CREATE INDEX idx_products_name ON products(name);
        CREATE INDEX idx_products_type ON products(type);
        CREATE INDEX idx_products_quantity ON products(quantity);
        
        RAISE NOTICE 'Tabela products criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela products já existe, pulando criação';
    END IF;
END $$;

-- Verificar e criar tabela de Movimentações (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'movements') THEN
        CREATE TABLE movements (
            id TEXT PRIMARY KEY,
            product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
            quantity INTEGER NOT NULL,
            timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
        
        -- Índices
        CREATE INDEX idx_movements_product_id ON movements(product_id);
        CREATE INDEX idx_movements_timestamp ON movements(timestamp);
        
        RAISE NOTICE 'Tabela movements criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela movements já existe, pulando criação';
    END IF;
END $$;

-- Verificar e criar tabela de Tipos Personalizados (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'custom_types') THEN
        CREATE TABLE custom_types (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            icon TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
        
        RAISE NOTICE 'Tabela custom_types criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela custom_types já existe, pulando criação';
    END IF;
END $$;

-- Verificar e criar tabela de Usuários (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
        
        RAISE NOTICE 'Tabela users criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela users já existe, pulando criação';
    END IF;
END $$;

-- Verificar e criar tabela de Auditoria (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_log') THEN
        CREATE TABLE audit_log (
            id TEXT PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            action TEXT NOT NULL,
            table_name TEXT NOT NULL,
            record_id TEXT,
            old_values JSONB,
            new_values JSONB,
            ip_address TEXT,
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
        
        -- Índices para auditoria
        CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
        CREATE INDEX idx_audit_log_action ON audit_log(action);
        CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
        CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
        
        RAISE NOTICE 'Tabela audit_log criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela audit_log já existe, pulando criação';
    END IF;
END $$;

-- Adicionar campos de auditoria nas tabelas existentes (se não existirem)
DO $$
BEGIN
    -- Adicionar campos na tabela products
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_by') THEN
        ALTER TABLE products ADD COLUMN created_by UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Campo created_by adicionado à tabela products';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_by') THEN
        ALTER TABLE products ADD COLUMN updated_by UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Campo updated_by adicionado à tabela products';
    END IF;
    
    -- Adicionar campos na tabela movements
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'movements' AND column_name = 'created_by') THEN
        ALTER TABLE movements ADD COLUMN created_by UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Campo created_by adicionado à tabela movements';
    END IF;
    
    -- Adicionar campos na tabela custom_types
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'custom_types' AND column_name = 'created_by') THEN
        ALTER TABLE custom_types ADD COLUMN created_by UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Campo created_by adicionado à tabela custom_types';
    END IF;
END $$;

-- Criar índices para campos de auditoria (se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_products_created_by') THEN
        CREATE INDEX idx_products_created_by ON products(created_by);
        RAISE NOTICE 'Índice idx_products_created_by criado';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_products_updated_by') THEN
        CREATE INDEX idx_products_updated_by ON products(updated_by);
        RAISE NOTICE 'Índice idx_products_updated_by criado';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_movements_created_by') THEN
        CREATE INDEX idx_movements_created_by ON movements(created_by);
        RAISE NOTICE 'Índice idx_movements_created_by criado';
    END IF;
END $$;

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at em products (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
        CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Trigger update_products_updated_at criado';
    END IF;
END $$;

-- Criar função para capturar user_id automaticamente
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS UUID
LANGUAGE SQL STABLE
AS $$
  SELECT auth.uid()
$$;

-- Criar função para auditoria automática
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        id,
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        user_agent
    ) VALUES (
        gen_random_uuid()::text,
        auth.user_id(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
        current_setting('request.headers', true)::json->>'x-forwarded-for',
        current_setting('request.headers', true)::json->>'user-agent'
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar triggers para auditoria automática (se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'products_audit_trigger') THEN
        CREATE TRIGGER products_audit_trigger
            AFTER INSERT OR UPDATE OR DELETE ON products
            FOR EACH ROW EXECUTE FUNCTION create_audit_log();
        RAISE NOTICE 'Trigger products_audit_trigger criado';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'movements_audit_trigger') THEN
        CREATE TRIGGER movements_audit_trigger
            AFTER INSERT OR UPDATE OR DELETE ON movements
            FOR EACH ROW EXECUTE FUNCTION create_audit_log();
        RAISE NOTICE 'Trigger movements_audit_trigger criado';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'custom_types_audit_trigger') THEN
        CREATE TRIGGER custom_types_audit_trigger
            AFTER INSERT OR UPDATE OR DELETE ON custom_types
            FOR EACH ROW EXECUTE FUNCTION create_audit_log();
        RAISE NOTICE 'Trigger custom_types_audit_trigger criado';
    END IF;
END $$;

-- Habilitar RLS nas tabelas (se não estiver habilitado)
DO $$
BEGIN
    -- Habilitar RLS na tabela users
    IF NOT EXISTS (SELECT FROM pg_class WHERE relname = 'users' AND relrowsecurity = true) THEN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado na tabela users';
    END IF;
    
    -- Habilitar RLS na tabela audit_log
    IF NOT EXISTS (SELECT FROM pg_class WHERE relname = 'audit_log' AND relrowsecurity = true) THEN
        ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado na tabela audit_log';
    END IF;
    
    -- Habilitar RLS nas outras tabelas
    IF NOT EXISTS (SELECT FROM pg_class WHERE relname = 'products' AND relrowsecurity = true) THEN
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado na tabela products';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_class WHERE relname = 'movements' AND relrowsecurity = true) THEN
        ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado na tabela movements';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_class WHERE relname = 'custom_types' AND relrowsecurity = true) THEN
        ALTER TABLE custom_types ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado na tabela custom_types';
    END IF;
END $$;

-- Criar políticas RLS (se não existirem)
DO $$
BEGIN
    -- Políticas para users
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON users
            FOR SELECT USING (auth.user_id() = id);
        RAISE NOTICE 'Política Users can view their own profile criada';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON users
            FOR UPDATE USING (auth.user_id() = id);
        RAISE NOTICE 'Política Users can update their own profile criada';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Admin can view all users') THEN
        CREATE POLICY "Admin can view all users" ON users
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE id = auth.user_id() AND role = 'admin'
                )
            );
        RAISE NOTICE 'Política Admin can view all users criada';
    END IF;
    
    -- Políticas para audit_log
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Admin can view audit log') THEN
        CREATE POLICY "Admin can view audit log" ON audit_log
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE id = auth.user_id() AND role = 'admin'
                )
            );
        RAISE NOTICE 'Política Admin can view audit log criada';
    END IF;
    
    -- Políticas para products
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Authenticated users can manage products') THEN
        -- Remover políticas antigas se existirem
        DROP POLICY IF EXISTS "Enable all access for now" ON products;
        
        CREATE POLICY "Authenticated users can manage products" ON products
            FOR ALL USING (auth.user_id() IS NOT NULL);
        RAISE NOTICE 'Política Authenticated users can manage products criada';
    END IF;
    
    -- Políticas para movements
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Authenticated users can manage movements') THEN
        -- Remover políticas antigas se existirem
        DROP POLICY IF EXISTS "Enable all access for now" ON movements;
        
        CREATE POLICY "Authenticated users can manage movements" ON movements
            FOR ALL USING (auth.user_id() IS NOT NULL);
        RAISE NOTICE 'Política Authenticated users can manage movements criada';
    END IF;
    
    -- Políticas para custom_types
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Authenticated users can manage custom_types') THEN
        -- Remover políticas antigas se existirem
        DROP POLICY IF EXISTS "Enable all access for now" ON custom_types;
        
        CREATE POLICY "Authenticated users can manage custom_types" ON custom_types
            FOR ALL USING (auth.user_id() IS NOT NULL);
        RAISE NOTICE 'Política Authenticated users can manage custom_types criada';
    END IF;
END $$;

-- Adicionar comentários nas tabelas
COMMENT ON TABLE products IS 'Tabela de materiais/produtos do estoque';
COMMENT ON TABLE movements IS 'Histórico de movimentações (entradas e saídas)';
COMMENT ON TABLE custom_types IS 'Tipos/categorias personalizadas criadas pelo usuário';
COMMENT ON TABLE users IS 'Dados adicionais dos usuários autenticados';
COMMENT ON TABLE audit_log IS 'Log de auditoria de todas as ações do sistema';

-- Mensagem final
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SCHEMA SQL EXECUTADO COM SUCESSO!';
    RAISE NOTICE 'Todas as tabelas e políticas foram criadas/verificadas';
    RAISE NOTICE 'Agora você pode criar o administrador';
    RAISE NOTICE '========================================';
END $$;
