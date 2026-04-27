# 🔧 Corrigir Erro "User not allowed"

## ❌ Problema Identificado

O erro **"User not allowed"** acontece porque o Supabase está bloqueando a criação de usuários. Isso pode ser devido a:

1. **Configurações de autenticação** não configuradas
2. **Políticas RLS** muito restritivas
3. **Permissões** do usuário anônimo
4. **Schema SQL** não executado

---

## 🔍 Diagnóstico

### **1. Verificar Console do Navegador**
1. Abra **F12** (DevTools)
2. Vá na aba **Console**
3. Procure por erros relacionados ao Supabase
4. Anote as mensagens de erro específicas

### **2. Verificar Supabase Dashboard**
1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Vá no seu projeto
3. **Authentication** → **Settings**
4. Verifique se **"Enable email confirmations"** está desabilitado
5. Verifique se **"Enable email change confirmations"** está desabilitado

---

## 🚀 Soluções

### **Solução 1: Configurar Autenticação no Supabase**

1. **Acesse Supabase Dashboard:**
   - Vá em **Authentication** → **Settings**
   - **Site URL:** `https://scm-supabase.vercel.app`
   - **Redirect URLs:** Adicione:
     ```
     https://scm-supabase.vercel.app/login.html
     https://scm-supabase.vercel.app/SCM_Supabase.html
     https://scm-supabase.vercel.app/admin-interno.html
     https://scm-supabase.vercel.app/**
     ```

2. **Desabilitar Confirmação de Email:**
   - **Enable email confirmations:** ❌ **DESABILITADO**
   - **Enable email change confirmations:** ❌ **DESABILITADO**

3. **Configurar Políticas RLS:**
   - Vá em **Authentication** → **Policies**
   - Verifique se as políticas estão corretas

### **Solução 2: Executar Schema SQL**

1. **Acesse SQL Editor:**
   - Vá em **SQL Editor** no Supabase
   - Execute o arquivo `supabase_schema_public.sql`

2. **Verificar Tabelas:**
   - Vá em **Table Editor**
   - Confirme que as tabelas existem:
     - `users`
     - `products`
     - `movements`
     - `custom_types`
     - `audit_log`

### **Solução 3: Usar CRIAR_ADMIN.html**

Se o admin interno não funcionar, use a página específica:

1. **Acesse:**
   ```
   https://scm-supabase.vercel.app/CRIAR_ADMIN.html
   ```

2. **Preencha:**
   - Nome completo
   - Email
   - Senha (mínimo 6 caracteres)

3. **Clique em "Criar Administrador"**

---

## 🧪 Teste Passo a Passo

### **1. Testar Conexão Básica**
```
https://scm-supabase.vercel.app/TESTE_CONEXAO.html
```
**Verificar:**
- ✅ Deve mostrar "Conectado ao Supabase"
- ✅ Deve listar as tabelas existentes

### **2. Testar Configuração**
```
https://scm-supabase.vercel.app/TESTE_CONFIG_SUPABASE.html
```
**Verificar:**
- ✅ Deve mostrar "Supabase inicializado"
- ✅ Deve mostrar configurações corretas

### **3. Testar Criação de Admin**
```
https://scm-supabase.vercel.app/CRIAR_ADMIN.html
```
**Verificar:**
- ✅ Deve criar usuário sem erro
- ✅ Deve redirecionar para login

### **4. Testar Login**
```
https://scm-supabase.vercel.app/login.html
```
**Verificar:**
- ✅ Deve fazer login com sucesso
- ✅ Deve redirecionar para sistema principal

---

## 🔧 Configurações Específicas

### **No Supabase Dashboard:**

1. **Authentication → Settings:**
   ```
   Site URL: https://scm-supabase.vercel.app
   
   Redirect URLs:
   - https://scm-supabase.vercel.app/login.html
   - https://scm-supabase.vercel.app/SCM_Supabase.html
   - https://scm-supabase.vercel.app/admin-interno.html
   - https://scm-supabase.vercel.app/**
   
   Enable email confirmations: ❌ DESABILITADO
   Enable email change confirmations: ❌ DESABILITADO
   ```

2. **Authentication → Policies:**
   - Verificar se as políticas permitem criação de usuários
   - Se necessário, criar política temporária:
   ```sql
   CREATE POLICY "Allow anonymous user creation" ON auth.users
   FOR INSERT WITH CHECK (true);
   ```

### **Executar SQL no Supabase:**

1. **Acesse SQL Editor**
2. **Execute este script:**
   ```sql
   -- Permitir criação de usuários anônimos temporariamente
   CREATE POLICY IF NOT EXISTS "Allow anonymous user creation" ON auth.users
   FOR INSERT WITH CHECK (true);
   
   -- Verificar se tabela users existe
   SELECT * FROM users LIMIT 1;
   ```

---

## 🆘 Se Ainda Não Funcionar

### **1. Verificar Logs do Supabase**
- Vá em **Logs** → **Auth**
- Veja se há erros específicos

### **2. Testar com Usuário Existente**
- Tente fazer login com um usuário que já existe
- Se funcionar, o problema é só na criação

### **3. Usar Modo Desenvolvimento**
- No Supabase, vá em **Settings** → **API**
- Verifique se está usando a chave correta

---

## 📋 Checklist de Verificação

### **Supabase Dashboard:**
- [ ] Site URL configurada
- [ ] Redirect URLs adicionadas
- [ ] Email confirmations desabilitado
- [ ] Schema SQL executado
- [ ] Tabelas criadas

### **Testes:**
- [ ] TESTE_CONEXAO.html funciona
- [ ] TESTE_CONFIG_SUPABASE.html funciona
- [ ] CRIAR_ADMIN.html funciona
- [ ] login.html funciona

### **Sistema:**
- [ ] Admin interno funciona
- [ ] Criação de usuários funciona
- [ ] Login funciona
- [ ] Sistema principal funciona

---

## 🎯 Próximos Passos

1. ✅ **Configurar** Supabase Authentication
2. ✅ **Executar** schema SQL
3. ✅ **Testar** criação de usuários
4. ✅ **Testar** login completo
5. ✅ **Testar** sistema principal

---

**Siga este guia passo a passo para resolver o erro! 🔧✨**

---

**Última atualização:** 2025-10-10
