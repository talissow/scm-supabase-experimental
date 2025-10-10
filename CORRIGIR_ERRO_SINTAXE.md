# 🔧 Corrigir Erro de Sintaxe SQL

## ❌ Erro Identificado

```
ERROR: 42601: syntax error at or near "NOT"
LINE 88: CREATE POLICY IF NOT EXISTS "Allow all operations on users"
```

Este erro acontece porque o Supabase não suporta `IF NOT EXISTS` nas políticas RLS. O PostgreSQL tem limitações específicas para políticas.

---

## ✅ SOLUÇÃO: Schema Corrigido

### **1️⃣ Execute o Schema Corrigido**

**No Supabase SQL Editor:**
1. Acesse: [supabase.com/dashboard/project/kaqkzrngebxfuvquromi/sql](https://supabase.com/dashboard/project/kaqkzrngebxfuvquromi/sql)
2. **Cole o conteúdo** do arquivo `supabase_schema_corrigido.sql`
3. **Clique em "Run"**

**Deve mostrar:**
```
NOTICE: Schema criado com sucesso!
NOTICE: Tabelas criadas: users, products, movements, custom_types, audit_log
NOTICE: Usuário admin padrão: admin@scm.local
NOTICE: Configure as URLs no Authentication Settings do Supabase
NOTICE: Agora você pode criar usuários sem erro!
```

### **2️⃣ Verificar Tabelas Criadas**

**Vá em Table Editor:**
- [supabase.com/dashboard/project/kaqkzrngebxfuvquromi/table-editor](https://supabase.com/dashboard/project/kaqkzrngebxfuvquromi/table-editor)

**Deve mostrar:**
- ✅ `users`
- ✅ `products`
- ✅ `movements`
- ✅ `custom_types`
- ✅ `audit_log`

### **3️⃣ Configurar Authentication**

**Vá em Authentication → Settings:**
- [supabase.com/dashboard/project/kaqkzrngebxfuvquromi/auth/settings](https://supabase.com/dashboard/project/kaqkzrngebxfuvquromi/auth/settings)

**Configure:**
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

3. **Desabilitar confirmações:**
   - ❌ **Enable email confirmations**
   - ❌ **Enable email change confirmations**
   - ❌ **Enable phone confirmations**

4. **Clique em "Save"**

---

## 🔍 CORREÇÕES APLICADAS

### **❌ Removido (causava erro):**
```sql
CREATE POLICY IF NOT EXISTS "Allow all operations on users" ON public.users
```

### **✅ Substituído por:**
```sql
DROP POLICY IF EXISTS "Allow all operations on users" ON public.users;
CREATE POLICY "Allow all operations on users" ON public.users
FOR ALL USING (true);
```

### **🔧 Outras correções:**
- Removido `IF NOT EXISTS` de todas as políticas
- Adicionado `DROP POLICY IF EXISTS` antes de criar
- Mantida compatibilidade com PostgreSQL/Supabase

---

## 🧪 TESTAR APÓS CORREÇÃO

### **1️⃣ Teste de Diagnóstico**
```
https://scm-supabase.vercel.app/TESTE_DIAGNOSTICO_COMPLETO.html
```
- Execute o diagnóstico completo
- Deve mostrar todas as tabelas como existentes

### **2️⃣ Teste de Conexão**
```
https://scm-supabase.vercel.app/TESTE_CONEXAO.html
```
- Deve mostrar "Conectado ao Supabase"
- Deve listar as 5 tabelas criadas

### **3️⃣ Teste de Criação de Usuário**
```
https://scm-supabase.vercel.app/CRIAR_ADMIN.html
```
- Preencha os dados
- Deve criar sem erro "User not allowed"

### **4️⃣ Teste de Admin Interno**
```
https://scm-supabase.vercel.app/admin-interno.html
```
- Deve carregar sem erro
- Deve mostrar formulário de adicionar usuário

---

## 🆘 SE AINDA DER ERRO

### **1. Verificar se as tabelas existem:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'products', 'movements', 'custom_types', 'audit_log');
```

### **2. Verificar políticas RLS:**
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### **3. Testar inserção simples:**
```sql
INSERT INTO public.users (email, full_name, role) 
VALUES ('teste@exemplo.com', 'Usuário Teste', 'user');
```

### **4. Verificar se RLS está habilitado:**
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'products', 'movements', 'custom_types', 'audit_log');
```

---

## 📋 CHECKLIST FINAL

### **Supabase Dashboard:**
- [ ] Schema corrigido executado com sucesso
- [ ] 5 tabelas criadas (users, products, movements, custom_types, audit_log)
- [ ] Authentication configurado com URLs corretas
- [ ] Email confirmations desabilitado

### **Testes:**
- [ ] TESTE_DIAGNOSTICO_COMPLETO.html: Todas as tabelas existem
- [ ] TESTE_CONEXAO.html: Conectado ao Supabase
- [ ] CRIAR_ADMIN.html: Cria usuário sem erro
- [ ] admin-interno.html: Funciona sem erro

### **Sistema:**
- [ ] Login funciona
- [ ] Proteção de rotas funciona
- [ ] Admin interno funciona
- [ ] Criação de usuários funciona

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ **Executar** `supabase_schema_corrigido.sql`
2. ✅ **Configurar** Authentication URLs
3. ✅ **Testar** criação de usuários
4. ✅ **Criar** primeiro administrador
5. ✅ **Testar** sistema completo

---

## 💡 DICA IMPORTANTE

**Sempre use o schema corrigido** (`supabase_schema_corrigido.sql`) em vez do schema simples, pois ele resolve os problemas de sintaxe do PostgreSQL/Supabase.

---

**O schema corrigido resolve o erro de sintaxe! 🚀✨**

---

**Última atualização:** 2025-10-10
