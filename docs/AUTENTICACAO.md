# 🔐 Sistema de Autenticação - SCM

## Visão Geral

O Sistema de Controle de Materiais (SCM) agora possui autenticação completa com Supabase Auth, incluindo:

- **Login/Logout** com email e senha
- **Registro de novos usuários**
- **Recuperação de senha**
- **Gerenciamento de usuários** (apenas para administradores)
- **Auditoria completa** de todas as ações
- **Controle de acesso** baseado em roles (admin/user)

## 🚀 Configuração Inicial

### 1. Configurar Autenticação no Supabase

1. Acesse o painel do Supabase
2. Vá em **Authentication** → **Settings**
3. Configure as seguintes opções:

#### Email Auth
- ✅ **Enable email confirmations**: Desabilitado (para testes)
- ✅ **Enable email change confirmations**: Desabilitado (para testes)
- ✅ **Enable phone confirmations**: Desabilitado

#### Password Settings
- **Minimum password length**: 6
- ✅ **Require uppercase**: Desabilitado
- ✅ **Require lowercase**: Desabilitado
- ✅ **Require numbers**: Desabilitado
- ✅ **Require special characters**: Desabilitado

#### URL Configuration
- **Site URL**: `http://localhost:3000` (ou sua URL)
- **Redirect URLs**: Adicione as URLs que podem redirecionar após login

### 2. Executar Schema SQL

Execute o arquivo `supabase_schema.sql` no SQL Editor do Supabase para criar:
- Tabela `users` (dados adicionais dos usuários)
- Tabela `audit_log` (log de auditoria)
- Campos de auditoria nas tabelas existentes
- Políticas RLS (Row Level Security)
- Triggers de auditoria automática

### 3. Criar Primeiro Usuário Admin

Após configurar o Supabase, você tem várias opções para criar o primeiro usuário admin:

#### Opção 1: Via Interface Web (Recomendado)
1. Abra `CRIAR_ADMIN.html` no navegador
2. Preencha os dados do administrador:
   - Nome completo
   - Email
   - Senha (mínimo 6 caracteres)
   - Confirmar senha
3. Clique em **"👑 Criar Administrador"**
4. Aguarde a confirmação de sucesso
5. Faça login com as credenciais criadas

#### Opção 2: Via SQL (Manual)
```sql
-- Primeiro, criar usuário no auth.users via registro normal
-- Depois, atualizar role para admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'seu-email@exemplo.com';
```

#### Opção 3: Via Painel Supabase
1. Vá em **Authentication** → **Users**
2. Clique em **Add user**
3. Preencha email e senha
4. Após criar, execute o SQL acima para torná-lo admin

## 👤 Como Usar o Sistema

### Login
1. Acesse `login.html`
2. Digite email e senha
3. Clique em **Entrar**
4. Será redirecionado para `SCM_Supabase.html`

### Registro de Novo Usuário
1. Na tela de login, clique em **Criar conta**
2. Preencha nome, email e senha
3. Clique em **Criar Conta**
4. Verifique seu email para confirmar a conta

### Recuperação de Senha
1. Na tela de login, clique em **Esqueci minha senha**
2. Digite seu email
3. Verifique sua caixa de entrada
4. Siga o link para redefinir a senha

### Gerenciamento de Usuários (Admin)
1. Faça login como administrador
2. Acesse `usuarios.html` (link no sistema principal)
3. Visualize todos os usuários cadastrados
4. Gerencie status, roles e senhas

## 🔒 Estrutura de Permissões

### Roles Disponíveis

#### `user` (Usuário Padrão)
- ✅ Acessar sistema principal
- ✅ Gerenciar produtos e movimentações
- ✅ Visualizar relatórios
- ❌ Gerenciar usuários
- ❌ Visualizar log de auditoria

#### `admin` (Administrador)
- ✅ Todas as permissões de usuário
- ✅ Gerenciar usuários
- ✅ Visualizar log de auditoria
- ✅ Resetar senhas
- ✅ Promover usuários a admin

### Controle de Acesso

O sistema implementa **Row Level Security (RLS)** no Supabase:

```sql
-- Apenas usuários autenticados podem acessar
CREATE POLICY "Authenticated users can manage products" ON products
    FOR ALL USING (auth.user_id() IS NOT NULL);

-- Apenas admin pode ver audit_log
CREATE POLICY "Admin can view audit log" ON audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.user_id() AND role = 'admin'
        )
    );
```

## 📋 Sistema de Auditoria

### O que é Registrado

Todas as ações são automaticamente registradas no `audit_log`:

- **INSERT**: Criação de novos registros
- **UPDATE**: Modificação de registros existentes  
- **DELETE**: Exclusão de registros

### Informações Capturadas

- **Usuário**: Quem fez a ação
- **Ação**: INSERT/UPDATE/DELETE
- **Tabela**: products/movements/custom_types
- **Registro**: ID do registro afetado
- **Valores**: Dados antes/depois (JSON)
- **Metadados**: IP, User-Agent, timestamp

### Visualizar Auditoria

1. Faça login como admin
2. Acesse `usuarios.html`
3. Role para baixo até "Log de Auditoria"
4. Visualize as últimas 50 ações

## 🛠️ Arquivos do Sistema

### Arquivos Principais
- `login.html` - Tela de login e registro
- `auth.js` - Módulo de autenticação
- `usuarios.html` - Gerenciamento de usuários (admin)
- `SCM_Supabase.html` - Sistema principal (protegido)

### Arquivos de Configuração
- `supabase-config.js` - Configuração do Supabase
- `supabase_schema.sql` - Schema do banco de dados

### Arquivos Modificados
- `styles.css` - Estilos para login e header
- `app.js` - Integração com auditoria

## 🔧 Solução de Problemas

### Erro: "Acesso negado"
- Verifique se o usuário está logado
- Confirme se o usuário tem as permissões necessárias
- Verifique se o Supabase está configurado corretamente

### Erro: "Usuário não encontrado"
- Verifique se o usuário existe na tabela `users`
- Confirme se o registro foi criado após o login

### Erro: "Não é possível acessar audit_log"
- Apenas administradores podem ver o log de auditoria
- Promova o usuário a admin via SQL ou painel

### Problemas de Sessão
- Limpe o cache do navegador
- Verifique se as URLs de redirecionamento estão corretas
- Confirme se o Supabase está acessível

## 🔐 Segurança

### Implementado
- ✅ Autenticação JWT via Supabase Auth
- ✅ Senhas criptografadas com bcrypt
- ✅ Row Level Security (RLS) no banco
- ✅ Tokens de sessão seguros
- ✅ Auditoria completa de ações
- ✅ Controle de acesso baseado em roles

### Recomendações Adicionais
- Configure HTTPS em produção
- Implemente rate limiting
- Configure backup automático do banco
- Monitore logs de acesso
- Implemente 2FA (futuro)

## 📞 Suporte

Para problemas técnicos:
1. Verifique os logs do console do navegador
2. Confirme a configuração do Supabase
3. Teste com um usuário admin
4. Verifique se todas as tabelas foram criadas

Para questões de segurança:
1. Não compartilhe credenciais de admin
2. Monitore regularmente o log de auditoria
3. Mantenha o Supabase atualizado
4. Configure backups regulares
