# 🗄️ Como Executar o Schema SQL no Supabase

## ⚠️ **PROBLEMA IDENTIFICADO:**
O erro "Could not find the table 'public.users'" indica que as tabelas não foram criadas no Supabase ainda.

## 🔧 **SOLUÇÃO:**

### Passo 1: Acessar o Supabase
1. Vá para [https://supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Acesse seu projeto: `kaqkzrngebxfuvquromi`

### Passo 2: Abrir o SQL Editor
1. No painel do Supabase, clique em **"SQL Editor"** no menu lateral
2. Clique em **"New query"** para criar uma nova consulta

### Passo 3: Executar o Schema
1. **Copie TODO o conteúdo** do arquivo `supabase_schema.sql`
2. **Cole no SQL Editor** do Supabase
3. **Clique em "Run"** para executar

### Passo 4: Verificar se Funcionou
Após executar, você deve ver:
- ✅ Tabela `users` criada
- ✅ Tabela `audit_log` criada
- ✅ Campos de auditoria adicionados nas tabelas existentes
- ✅ Políticas RLS configuradas
- ✅ Triggers de auditoria criados

## 📋 **Schema Completo para Copiar:**

```sql
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

-- Tabela de Usuários (dados adicionais além do Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Auditoria
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

-- Adicionar campos de auditoria nas tabelas existentes
ALTER TABLE products ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE products ADD COLUMN updated_by UUID REFERENCES auth.users(id);
ALTER TABLE movements ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE custom_types ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Índices para auditoria
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Índices para campos de auditoria
CREATE INDEX idx_products_created_by ON products(created_by);
CREATE INDEX idx_products_updated_by ON products(updated_by);
CREATE INDEX idx_movements_created_by ON movements(created_by);

-- Função para capturar user_id automaticamente
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS UUID
LANGUAGE SQL STABLE
AS $$
  SELECT auth.uid()
$$;

-- Função para auditoria automática
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

-- Triggers para auditoria automática
CREATE TRIGGER products_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER movements_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON movements
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER custom_types_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON custom_types
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Habilitar RLS nas novas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para users
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.user_id() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.user_id() = id);

CREATE POLICY "Admin can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.user_id() AND role = 'admin'
        )
    );

-- Políticas RLS para audit_log (apenas admin)
CREATE POLICY "Admin can view audit log" ON audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.user_id() AND role = 'admin'
        )
    );

-- Atualizar políticas existentes para requerer autenticação
DROP POLICY IF EXISTS "Enable all access for now" ON products;
DROP POLICY IF EXISTS "Enable all access for now" ON movements;
DROP POLICY IF EXISTS "Enable all access for now" ON custom_types;

CREATE POLICY "Authenticated users can manage products" ON products
    FOR ALL USING (auth.user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can manage movements" ON movements
    FOR ALL USING (auth.user_id() IS NOT NULL);

CREATE POLICY "Authenticated users can manage custom_types" ON custom_types
    FOR ALL USING (auth.user_id() IS NOT NULL);

-- Comentários nas tabelas
COMMENT ON TABLE products IS 'Tabela de materiais/produtos do estoque';
COMMENT ON TABLE movements IS 'Histórico de movimentações (entradas e saídas)';
COMMENT ON TABLE custom_types IS 'Tipos/categorias personalizadas criadas pelo usuário';
COMMENT ON TABLE users IS 'Dados adicionais dos usuários autenticados';
COMMENT ON TABLE audit_log IS 'Log de auditoria de todas as ações do sistema';
```

## ✅ **Após Executar o Schema:**

1. **Teste novamente** o `CRIAR_ADMIN.html`
2. **Deve funcionar** sem erros
3. **Crie sua conta** de administrador
4. **Faça login** e acesse o sistema

## 🔍 **Se Ainda Houver Problemas:**

1. **Verifique se todas as tabelas foram criadas**:
   - Vá em **Table Editor** no Supabase
   - Deve ver: `products`, `movements`, `custom_types`, `users`, `audit_log`

2. **Verifique as políticas RLS**:
   - Vá em **Authentication** → **Policies**
   - Deve ver as políticas criadas

3. **Teste a conexão**:
   - Use `TESTE_CONFIG_SUPABASE.html`
   - Deve conectar sem erros

**Execute o schema SQL primeiro, depois teste a criação do administrador!** 🚀
