-- ===== ESTRUTURA DE TABELAS PARA SUPABASE =====
-- Execute este SQL no Supabase SQL Editor

-- Tabela de Produtos
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

-- Tabela de Movimentações
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

-- Tabela de Tipos Personalizados
CREATE TABLE custom_types (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at em products
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS) - Importante para segurança!
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_types ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (por enquanto, acesso público)
-- Você pode adicionar autenticação depois!
CREATE POLICY "Enable all access for now" ON products FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON movements FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON custom_types FOR ALL USING (true);

-- Comentários nas tabelas
COMMENT ON TABLE products IS 'Tabela de materiais/produtos do estoque';
COMMENT ON TABLE movements IS 'Histórico de movimentações (entradas e saídas)';
COMMENT ON TABLE custom_types IS 'Tipos/categorias personalizadas criadas pelo usuário';

