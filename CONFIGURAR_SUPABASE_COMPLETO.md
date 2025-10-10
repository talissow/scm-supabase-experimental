# 🔧 Configuração Completa do Supabase

## 📋 Informações do Projeto

**Project ID:** `kaqkzrngebxfuvquromi`
**URL do Projeto:** `https://kaqkzrngebxfuvquromi.supabase.co`
**URL do Dashboard:** `https://supabase.com/dashboard/project/kaqkzrngebxfuvquromi`

---

## 🚀 CONFIGURAÇÃO PASSO A PASSO

### **1️⃣ Acessar Dashboard do Supabase**

**Link Direto:**
```
https://supabase.com/dashboard/project/kaqkzrngebxfuvquromi
```

### **2️⃣ Configurar Authentication**

**Vá em Authentication → Settings:**

1. **Site URL:**
   ```
   https://scm-supabase.vercel.app
   ```

2. **Redirect URLs (adicione TODAS):**
   ```
   https://scm-supabase.vercel.app
   https://scm-supabase.vercel.app/
   https://scm-supabase.vercel.app/login.html
   https://scm-supabase.vercel.app/SCM_Supabase.html
   https://scm-supabase.vercel.app/admin-interno.html
   https://scm-supabase.vercel.app/CRIAR_ADMIN.html
   https://scm-supabase.vercel.app/**
   ```

3. **Configurações de Email:**
   - ❌ **Enable email confirmations** (DESABILITADO)
   - ❌ **Enable email change confirmations** (DESABILITADO)
   - ❌ **Enable phone confirmations** (DESABILITADO)

4. **Clique em "Save"**

### **3️⃣ Executar Schema SQL**

**Vá em SQL Editor:**

1. **Clique em "New Query"**
2. **Cole o conteúdo do arquivo `supabase_schema_public.sql`**
3. **Clique em "Run"**

**Verificar se executou:**
- Deve mostrar "Success. No rows returned"
- Vá em **Table Editor** para confirmar que as tabelas foram criadas

### **4️⃣ Verificar Tabelas Criadas**

**Vá em Table Editor e confirme que existem:**
- ✅ `users`
- ✅ `products` 
- ✅ `movements`
- ✅ `custom_types`
- ✅ `audit_log`

### **5️⃣ Configurar Políticas RLS (Se Necessário)**

**Vá em Authentication → Policies:**

**Se houver erro de permissão, execute no SQL Editor:**
```sql
-- Política temporária para permitir criação de usuários
CREATE POLICY IF NOT EXISTS "Allow anonymous user creation" ON auth.users
FOR INSERT WITH CHECK (true);

-- Política para permitir acesso às tabelas
CREATE POLICY IF NOT EXISTS "Allow all operations on users" ON public.users
FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow all operations on products" ON public.products
FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow all operations on movements" ON public.movements
FOR ALL USING (true);
```

---

## 🧪 TESTAR CONFIGURAÇÃO

### **1️⃣ Teste de Diagnóstico**
```
https://scm-supabase.vercel.app/TESTE_DIAGNOSTICO_COMPLETO.html
```
- Execute o diagnóstico completo
- Verifique se todos os testes passam

### **2️⃣ Teste de Conexão**
```
https://scm-supabase.vercel.app/TESTE_CONEXAO.html
```
- Deve mostrar "Conectado ao Supabase"
- Deve listar as tabelas

### **3️⃣ Teste de Criação de Admin**
```
https://scm-supabase.vercel.app/CRIAR_ADMIN.html
```
- Preencha os dados
- Deve criar sem erro "User not allowed"

### **4️⃣ Teste de Login**
```
https://scm-supabase.vercel.app/login.html
```
- Faça login com as credenciais criadas
- Deve redirecionar para o sistema principal

---

## 🔧 VERIFICAR CONFIGURAÇÕES

### **No Supabase Dashboard:**

1. **Settings → API:**
   - **Project URL:** `https://kaqkzrngebxfuvquromi.supabase.co`
   - **anon public:** (sua chave anônima)
   - **service_role:** (não compartilhar)

2. **Authentication → Settings:**
   - **Site URL:** `https://scm-supabase.vercel.app`
   - **Redirect URLs:** Todas as URLs listadas acima
   - **Email confirmations:** DESABILITADO

3. **Table Editor:**
   - Verificar se todas as tabelas existem
   - Verificar se têm dados (se houver)

---

## 🆘 SOLUÇÃO DE PROBLEMAS

### **❌ Ainda "User not allowed"**

**Soluções:**
1. **Verificar URLs no Supabase:**
   - Authentication → Settings
   - Adicionar todas as URLs listadas acima

2. **Desabilitar confirmações:**
   - Email confirmations: ❌
   - Email change confirmations: ❌

3. **Executar políticas temporárias:**
   ```sql
   CREATE POLICY "Allow all" ON auth.users FOR ALL USING (true);
   ```

### **❌ Tabelas não existem**

**Solução:**
1. Vá em **SQL Editor**
2. Execute `supabase_schema_public.sql`
3. Verifique em **Table Editor**

### **❌ Erro de conexão**

**Solução:**
1. Verificar `supabase-config.js`
2. Confirmar URL e chave anônima
3. Testar com `TESTE_CONEXAO.html`

---

## 📋 CHECKLIST FINAL

### **Supabase Dashboard:**
- [ ] Site URL configurada: `https://scm-supabase.vercel.app`
- [ ] Redirect URLs adicionadas (todas as listadas)
- [ ] Email confirmations desabilitado
- [ ] Schema SQL executado
- [ ] Tabelas criadas (5 tabelas)

### **Testes:**
- [ ] TESTE_DIAGNOSTICO_COMPLETO.html: Todos os testes passam
- [ ] TESTE_CONEXAO.html: Conectado ao Supabase
- [ ] CRIAR_ADMIN.html: Cria usuário sem erro
- [ ] login.html: Login funciona
- [ ] admin-interno.html: Funciona sem erro

### **Sistema:**
- [ ] Proteção de rotas funcionando
- [ ] Apenas login.html acessível publicamente
- [ ] Páginas protegidas redirecionam para login
- [ ] Admin interno funciona

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ **Configurar** Supabase com as URLs corretas
2. ✅ **Executar** schema SQL
3. ✅ **Testar** criação de usuários
4. ✅ **Criar** primeiro administrador
5. ✅ **Testar** sistema completo

---

## 📞 SUPORTE

**Se ainda houver problemas:**
1. Execute `TESTE_DIAGNOSTICO_COMPLETO.html`
2. Exporte os logs
3. Verifique o console do navegador (F12)
4. Consulte os logs do Supabase Dashboard

---

**Com o Project ID, agora você pode configurar tudo diretamente! 🚀✨**

---

**Última atualização:** 2025-10-10
