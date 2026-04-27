# 🚀 Setup Completo - Passo a Passo

## 📊 Resumo das Tarefas

Este guia configura seu projeto SCM + Supabase em 6 etapas principais. Cada etapa é independente e verificável.

---

## ✅ ETAPA 1: Configurar Authentication URLs no Supabase

### Informações do Seu Projeto
- **Project ID:** `kaqkzrngebxfuvquromi`
- **URL:** `https://kaqkzrngebxfuvquromi.supabase.co`
- **Dashboard:** https://supabase.com/dashboard/project/kaqkzrngebxfuvquromi

### Instruções

1. **Acesse o Dashboard do Supabase:**
   ```
   https://supabase.com/dashboard/project/kaqkzrngebxfuvquromi
   ```

2. **Vá em Authentication → Settings:**
   - Clique em "Authentication" na barra lateral esquerda
   - Clique em "Settings"

3. **Configure Site URL:**
   - Procure por "Site URL"
   - Defina para: `https://scm-supabase.vercel.app`

4. **Adicione Redirect URLs:**
   - Procure por "Redirect URLs"
   - Clique em "Add URL"
   - Adicione TODAS estas URLs:
     ```
     https://scm-supabase.vercel.app
     https://scm-supabase.vercel.app/
     https://scm-supabase.vercel.app/login.html
     https://scm-supabase.vercel.app/SCM_Supabase.html
     https://scm-supabase.vercel.app/admin-interno.html
     https://scm-supabase.vercel.app/CRIAR_ADMIN.html
     https://scm-supabase.vercel.app/**
     ```

5. **Clique em "Save"**

### Verificação
- Site URL aparece corretamente
- Todas as 7 redirect URLs estão listadas
- Botão "Save" foi clicado

### ✅ Próxima: ETAPA 2

---

## ✅ ETAPA 2: Desabilitar Email Confirmations

### Por Quê?
Em desenvolvimento, você não quer confirmar email para cada usuário criado. Isso acelera os testes.

### Instruções

1. **Ainda em Authentication → Settings**

2. **Procure por Email:**
   - "Enable email confirmations"
   - Marque como ❌ DESABILITADO

3. **Procure por Email Change:**
   - "Enable email change confirmations"
   - Marque como ❌ DESABILITADO

4. **Procure por Phone:**
   - "Enable phone confirmations"
   - Marque como ❌ DESABILITADO

5. **Clique em "Save"**

### Verificação
- Todos os 3 checkboxes estão DESMARCADOS
- Você vê a confirmação de salvamento

### ✅ Próxima: ETAPA 3

---

## ✅ ETAPA 3: Executar Schema SQL no Supabase

### O que é?
O schema define as tabelas (users, products, movements, etc.) no banco de dados.

### Instruções

1. **Vá em SQL Editor:**
   - Clique em "SQL Editor" na barra lateral esquerda
   - Clique em "New query"

2. **Cole o SQL:**
   - Abra o arquivo: `/sql/supabase_schema_public.sql`
   - Copie TODO o conteúdo
   - Cole no editor SQL do Supabase

3. **Execute:**
   - Clique no botão verde "Run" (ou Ctrl+Enter)
   - Aguarde alguns segundos

4. **Verifique sucesso:**
   - Deve aparecer: "Success. No rows returned"

### Verificação
- Mesagem de sucesso aparece
- Não há erro em vermelho
- Vá em "Table Editor" e confirme que as tabelas existem:
  - `public.users`
  - `public.products`
  - `public.movements`
  - `public.custom_types`
  - `public.audit_log`

### ✅ Próxima: ETAPA 4

---

## ✅ ETAPA 4: Criar Primeiro Usuário Admin

### Opção A: Via Página Web (Recomendado)

1. **Abra no navegador:**
   ```
   http://localhost:8000/CRIAR_ADMIN.html
   ```
   
   Ou se já estiver no Vercel:
   ```
   https://scm-supabase.vercel.app/CRIAR_ADMIN.html
   ```

2. **Preencha os dados:**
   - Email: `admin@scm.local` (ou seu email)
   - Senha: Uma senha segura (mín 8 caracteres)
   - Nome Completo: Seu nome

3. **Clique em "Criar Admin"**

4. **Se funcionar:**
   - Mensagem de sucesso deve aparecer
   - Usuário foi criado no Supabase

5. **Se der erro "User not allowed":**
   - Execute o SQL de políticas abaixo
   - Tente novamente

### Opção B: Via SQL (Se A não funcionar)

1. **Vá em SQL Editor**
2. **Cole este SQL:**
   ```sql
   -- Inserir usuário de teste via SQL
   INSERT INTO auth.users 
   (email, encrypted_password, email_confirmed_at, created_at, updated_at, role)
   VALUES 
   ('admin@scm.local', crypt('Senha123!', gen_salt('bf')), now(), now(), now(), 'authenticated')
   ON CONFLICT (email) DO NOTHING;
   ```

3. **Execute (Run)**

### Verificação
- Vá em Authentication → Users
- Procure por "admin@scm.local"
- Deve estar listado

### ✅ Próxima: ETAPA 5

---

## ✅ ETAPA 5: Testar Conexão com Supabase

### Instruções

1. **Abra a página de teste:**
   ```
   http://localhost:8000/TESTE_CONEXAO.html
   ```

2. **Clique em "Testar Conexão"**
   - Deve aparecer: "✅ Conectado ao Supabase"
   - Mostra a URL do projeto

3. **Clique em "Testar Tabelas"**
   - Deve listar todas as 5 tabelas:
     - users
     - products
     - movements
     - custom_types
     - audit_log

4. **Clique em "Testar Inserção"**
   - Insere um registro de teste
   - Deve aparecer sucesso

5. **Clique em "Listar Dados"**
   - Deve mostrar os dados inseridos

### Verificação
- Todos os testes passam com ✅
- Não há mensagens de erro
- Dados aparecem corretamente

### ✅ Próxima: ETAPA 6

---

## ✅ ETAPA 6: Validar Fluxo Completo Login/Logout

### Teste de Login

1. **Abra a página de login:**
   ```
   http://localhost:8000/login.html
   ```

2. **Faça login:**
   - Email: `admin@scm.local`
   - Senha: A senha que criou
   - Clique em "Entrar"

3. **Verificações:**
   - ✅ Deve redirecionar para `/dashboard`
   - ✅ Deve carregar o sistema principal
   - ✅ Console não deve ter erros (F12)

### Teste de Logout

1. **Na página do dashboard:**
   - Procure por botão "Sair" ou "Logout"
   - Clique nele

2. **Verificações:**
   - ✅ Deve redirecionar para `/login.html`
   - ✅ Deve limpar a sessão

### Teste de Proteção de Rotas

1. **Saia do sistema (logout)**

2. **Tente acessar direto:**
   ```
   http://localhost:8000/SCM_Supabase.html
   ```

3. **Verificações:**
   - ✅ Deve redirecionar para `/login.html`
   - ✅ Não deve permitir acesso sem autenticação

### Verificação Final
- Login funciona
- Logout funciona
- Rotas são protegidas
- Sistema carrega corretamente após login

---

## 🆘 Solução de Problemas

### Erro: "User not allowed"
**Solução:**
1. Verifique se email confirmations está DESABILITADO
2. Verifique se todas as URLs estão configuradas
3. Execute o SQL de políticas:
   ```sql
   CREATE POLICY IF NOT EXISTS "Allow anonymous user creation" ON auth.users
   FOR INSERT WITH CHECK (true);
   ```

### Erro: "Tabelas não encontradas"
**Solução:**
1. Abra SQL Editor
2. Execute o supabase_schema_public.sql novamente
3. Verifique em Table Editor

### Erro: "Conexão recusada"
**Solução:**
1. Verifique sua internet
2. Verifique se URL está correta em supabase-config.js
3. Verifique se chave anônima está correta

### Login não funciona
**Solução:**
1. Verifique se usuário existe em Authentication → Users
2. Verifique a senha
3. Verifique console (F12) para mensagens de erro

---

## 📋 Checklist Final

### Supabase Dashboard
- [ ] Site URL: `https://scm-supabase.vercel.app`
- [ ] Redirect URLs: Todas as 7 URLs adicionadas
- [ ] Email confirmations: DESABILITADO
- [ ] Email change confirmations: DESABILITADO
- [ ] Phone confirmations: DESABILITADO
- [ ] Schema SQL: Executado com sucesso
- [ ] Tabelas: Todas as 5 existem

### Usuário Admin
- [ ] Email: `admin@scm.local` criado
- [ ] Aparece em Authentication → Users
- [ ] Senha funciona para login

### Testes
- [ ] TESTE_CONEXAO.html: Todos os testes passam
- [ ] login.html: Login funciona
- [ ] Dashboard: Carrega após login
- [ ] Logout: Redireciona para login
- [ ] Proteção: Não acessa sem login

---

## 🎉 Sucesso!

Se todos os testes passaram, seu sistema está **100% configurado e funcionando**!

Você pode agora:
- ✅ Criar múltiplos usuários
- ✅ Gerenciar produtos
- ✅ Registrar movimentações
- ✅ Usar em produção

---

## 📞 Próximos Passos

1. **Criar mais usuários:** Use a página de registro ou CRIAR_ADMIN.html
2. **Começar a usar:** Acesse o sistema via login.html
3. **Configurar em produção:** Deploy no Vercel (já configurado)
4. **Adicionar mais funcionalidades:** Conforme necessário

---

**Última atualização:** 2025-04-27
**Status:** Produção-Pronto
