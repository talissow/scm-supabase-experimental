# 🔧 Correção do Erro "Erro inesperado" no Registro

## Problema Identificado

O erro "Erro inesperado" ao tentar registrar um usuário indica que há um problema na configuração do Supabase Auth ou nas permissões.

## Soluções

### 1. Verificar Configurações do Supabase Auth

Acesse o painel do Supabase e vá em **Authentication** → **Settings**:

#### Email Auth Settings
- ✅ **Enable email confirmations**: **DESABILITADO** (para testes)
- ✅ **Enable email change confirmations**: **DESABILITADO** (para testes)

#### URL Configuration
- **Site URL**: `http://localhost:3000` ou sua URL local
- **Redirect URLs**: Adicione as seguintes URLs:
  ```
  http://localhost:3000
  http://localhost:3000/login.html
  file://
  ```

### 2. Verificar Políticas RLS

Execute este SQL no SQL Editor do Supabase:

```sql
-- Verificar se as políticas estão corretas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'products', 'movements', 'custom_types');

-- Se necessário, recriar as políticas
DROP POLICY IF EXISTS "Enable all access for now" ON products;
DROP POLICY IF EXISTS "Enable all access for now" ON movements;
DROP POLICY IF EXISTS "Enable all access for now" ON custom_types;

-- Políticas temporárias para teste (menos restritivas)
CREATE POLICY "Temporary open access for testing" ON products
    FOR ALL USING (true);

CREATE POLICY "Temporary open access for testing" ON movements
    FOR ALL USING (true);

CREATE POLICY "Temporary open access for testing" ON custom_types
    FOR ALL USING (true);
```

### 3. Testar Configuração

Use o arquivo `TESTE_CONFIG_SUPABASE.html` para diagnosticar:

1. Abra `TESTE_CONFIG_SUPABASE.html`
2. Clique em "Verificar Config"
3. Clique em "Testar Conexão"
4. Clique em "Testar Registro"

### 4. Configurações de Email (Se Necessário)

Se o Supabase estiver bloqueando registros por email:

1. Vá em **Authentication** → **Settings**
2. Em **Email Auth**, configure:
   - **Enable email confirmations**: DESABILITADO
   - **Enable email change confirmations**: DESABILITADO
3. Em **SMTP Settings**, deixe vazio para usar o serviço padrão

### 5. Verificar Logs do Supabase

1. Vá em **Logs** no painel do Supabase
2. Filtre por "auth"
3. Verifique se há erros específicos

### 6. Teste Manual via SQL

Execute este SQL para criar um usuário diretamente:

```sql
-- Inserir usuário diretamente (apenas para teste)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'teste@exemplo.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Usuário Teste"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Criar perfil na tabela users
INSERT INTO users (
    id,
    email,
    full_name,
    role,
    is_active
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'teste@exemplo.com'),
    'teste@exemplo.com',
    'Usuário Teste',
    'admin',
    true
);
```

### 7. Verificar Console do Navegador

1. Abra o DevTools (F12)
2. Vá na aba Console
3. Tente registrar um usuário
4. Verifique se há mensagens de erro específicas

### 8. Configuração de Desenvolvimento

Para desenvolvimento local, adicione estas configurações:

```javascript
// No supabase-config.js, adicione configurações de debug
const SUPABASE_CONFIG = {
    url: 'https://kaqkzrngebxfuvquromi.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false
        }
    }
};
```

## Teste de Solução

Após aplicar as correções:

1. **Limpe o cache do navegador**
2. **Abra `TESTE_CONFIG_SUPABASE.html`**
3. **Execute todos os testes**
4. **Tente registrar um usuário via `login.html`**

## Se o Problema Persistir

1. Verifique se o projeto Supabase está ativo
2. Confirme se as credenciais estão corretas
3. Teste com um email diferente
4. Verifique se não há limitações de rate limiting

## Logs Úteis

Para debug, adicione estes logs no console:

```javascript
// No auth.js, adicione mais logs
console.log('Supabase client:', supabaseClient);
console.log('Config:', SUPABASE_CONFIG);
console.log('Online:', navigator.onLine);
```
