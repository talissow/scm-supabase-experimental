# 🔧 Resolver Erro de Permissão do Schema Auth

## ❌ Erro Identificado

```
ERROR: 42501: permission denied for schema auth
```

Este erro acontece porque usuários anônimos não podem criar políticas no schema `auth` do Supabase. Isso é uma limitação de segurança normal.

---

## ✅ SOLUÇÃO: Usar Schema Simples

### **1️⃣ Execute o Schema Simples**

**No Supabase SQL Editor:**
1. Acesse: [supabase.com/dashboard/project/kaqkzrngebxfuvquromi/sql](https://supabase.com/dashboard/project/kaqkzrngebxfuvquromi/sql)
2. **Cole o conteúdo** do arquivo `supabase_schema_simples.sql`
3. **Clique em "Run"**

**Deve mostrar:**
```
NOTICE: Schema criado com sucesso!
NOTICE: Tabelas criadas: users, products, movements, custom_types, audit_log
NOTICE: Usuário admin padrão: admin@scm.local
NOTICE: Configure as URLs no Authentication Settings do Supabase
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

## 🧪 TESTAR APÓS CONFIGURAÇÃO

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

## 🔍 DIFERENÇAS DO SCHEMA SIMPLES

### **✅ O que foi removido:**
- Referências diretas ao schema `auth`
- Políticas no schema `auth`
- Funções que acessam `auth.users`

### **✅ O que foi mantido:**
- Todas as tabelas necessárias
- RLS (Row Level Security) habilitado
- Políticas permissivas para desenvolvimento
- Triggers de auditoria
- Usuário admin padrão

### **✅ Vantagens:**
- Funciona sem permissões especiais
- Compatível com usuários anônimos
- Mais simples de configurar
- Resolve o erro de permissão

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

---

## 📋 CHECKLIST FINAL

### **Supabase Dashboard:**
- [ ] Schema simples executado com sucesso
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

1. ✅ **Executar** `supabase_schema_simples.sql`
2. ✅ **Configurar** Authentication URLs
3. ✅ **Testar** criação de usuários
4. ✅ **Criar** primeiro administrador
5. ✅ **Testar** sistema completo

---

**O schema simples resolve o erro de permissão! 🚀✨**

---

**Última atualização:** 2025-10-10
