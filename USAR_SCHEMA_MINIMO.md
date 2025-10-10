# 🎯 Schema Mínimo - Apenas o Essencial

## ✅ Este é o schema mais simples possível!

Sem funções complexas, sem triggers problemáticos, sem campos extras. **APENAS O NECESSÁRIO PARA FUNCIONAR.**

---

## 🚀 COMO USAR

### **1️⃣ Abra o SQL Editor do Supabase**
[supabase.com/dashboard/project/kaqkzrngebxfuvquromi/sql](https://supabase.com/dashboard/project/kaqkzrngebxfuvquromi/sql)

### **2️⃣ Cole o conteúdo do arquivo**
`supabase_schema_minimo.sql`

### **3️⃣ Clique em "Run"**

**Deve mostrar:**
```
NOTICE: ✅ Schema mínimo criado com sucesso!
NOTICE: ✅ Tabelas: users, products, movements, custom_types, audit_log
NOTICE: ✅ Usuário admin: admin@scm.local
NOTICE: ✅ Tipos customizados criados
NOTICE: ⚙️ Configure Authentication URLs no Supabase
NOTICE: 🚀 Sistema pronto para uso!
```

---

## 📋 O QUE ESTE SCHEMA FAZ

### **Tabelas Criadas:**
1. **users** - Usuários do sistema
2. **products** - Produtos/Materiais
3. **movements** - Movimentações de estoque
4. **custom_types** - Tipos customizados
5. **audit_log** - Log de auditoria

### **Configurações:**
- ✅ RLS habilitado em todas as tabelas
- ✅ Políticas permissivas (acesso total)
- ✅ Usuário admin padrão criado
- ✅ 4 tipos customizados de exemplo

### **SEM:**
- ❌ Triggers complexos
- ❌ Funções de auditoria automática
- ❌ Campos created_by/updated_by
- ❌ Campo description em custom_types
- ❌ Campos updated_at

---

## ⚙️ CONFIGURAÇÃO APÓS EXECUTAR

### **1. Configure Authentication URLs**
[supabase.com/dashboard/project/kaqkzrngebxfuvquromi/auth/settings](https://supabase.com/dashboard/project/kaqkzrngebxfuvquromi/auth/settings)

**Site URL:**
```
https://scm-supabase.vercel.app
```

**Redirect URLs:**
```
https://scm-supabase.vercel.app
https://scm-supabase.vercel.app/
https://scm-supabase.vercel.app/login.html
https://scm-supabase.vercel.app/SCM_Supabase.html
https://scm-supabase.vercel.app/admin-interno.html
https://scm-supabase.vercel.app/**
```

**Desabilitar:**
- ❌ Enable email confirmations
- ❌ Enable email change confirmations
- ❌ Enable phone confirmations

---

## 🧪 TESTAR

### **1. Verificar Tabelas**
[supabase.com/dashboard/project/kaqkzrngebxfuvquromi/table-editor](https://supabase.com/dashboard/project/kaqkzrngebxfuvquromi/table-editor)

Deve mostrar:
- ✅ users (com 1 registro: admin@scm.local)
- ✅ products (vazia)
- ✅ movements (vazia)
- ✅ custom_types (com 4 registros)
- ✅ audit_log (vazia)

### **2. Teste de Conexão**
```
https://scm-supabase.vercel.app/TESTE_CONEXAO.html
```

### **3. Criar Administrador**
```
https://scm-supabase.vercel.app/CRIAR_ADMIN.html
```

### **4. Fazer Login**
```
https://scm-supabase.vercel.app/login.html
```

---

## 📊 ESTRUTURA DAS TABELAS

### **users**
```sql
- id (UUID)
- email (VARCHAR)
- full_name (VARCHAR)
- role (VARCHAR: 'user' ou 'admin')
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

### **products**
```sql
- id (UUID)
- name (VARCHAR)
- description (TEXT)
- quantity (INTEGER)
- min_quantity (INTEGER)
- unit (VARCHAR)
- type (VARCHAR)
- location (VARCHAR)
- supplier (VARCHAR)
- cost (DECIMAL)
- created_at (TIMESTAMP)
```

### **movements**
```sql
- id (UUID)
- product_id (UUID)
- type (VARCHAR: 'entrada', 'saida', 'ajuste')
- quantity (INTEGER)
- reason (VARCHAR)
- notes (TEXT)
- created_at (TIMESTAMP)
```

### **custom_types**
```sql
- id (UUID)
- name (VARCHAR)
- created_at (TIMESTAMP)
```

### **audit_log**
```sql
- id (UUID)
- user_email (VARCHAR)
- action (VARCHAR)
- table_name (VARCHAR)
- record_id (UUID)
- details (TEXT)
- created_at (TIMESTAMP)
```

---

## 💡 POR QUE ESTE SCHEMA É MELHOR?

1. **Sem erros de campo inexistente** - Não usa campos que não existem
2. **Sem erros de permissão** - Não acessa schema auth
3. **Sem erros de sintaxe** - Não usa IF NOT EXISTS em políticas
4. **Sem triggers problemáticos** - Não tem funções de auditoria complexas
5. **Estrutura mínima** - Apenas o essencial para funcionar

---

## 🆘 SE DER ERRO

### **Limpar Tabelas Existentes (se necessário):**
```sql
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.movements CASCADE;
DROP TABLE IF EXISTS public.custom_types CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
```

Depois execute o `supabase_schema_minimo.sql` novamente.

---

## 📝 CHECKLIST

- [ ] Schema mínimo executado com sucesso
- [ ] 5 tabelas criadas no Table Editor
- [ ] Usuário admin padrão criado (admin@scm.local)
- [ ] 4 tipos customizados criados
- [ ] Authentication URLs configuradas
- [ ] Email confirmations desabilitado
- [ ] TESTE_CONEXAO.html: Conectado ao Supabase
- [ ] CRIAR_ADMIN.html: Cria usuário sem erro
- [ ] login.html: Login funciona
- [ ] Sistema principal funciona

---

**Este é o schema definitivo! Simples, funcional e sem erros! 🚀✨**

---

**Última atualização:** 2025-10-10
