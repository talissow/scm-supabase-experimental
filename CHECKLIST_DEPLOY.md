# ✅ Checklist de Deploy - Vercel

Use este checklist para garantir que tudo está configurado corretamente!

---

## 📋 ANTES DO DEPLOY

### 1. Supabase - Banco de Dados
- [ ] Projeto criado no Supabase
- [ ] SQL executado (`supabase_schema_public.sql`)
- [ ] Tabelas criadas: `products`, `movements`, `custom_types`, `users`, `audit_log`
- [ ] Credenciais copiadas (URL + Anon Key)

### 2. Configuração Local
- [ ] Arquivo `supabase-config.js` atualizado com suas credenciais
- [ ] Teste de conexão OK (`TESTE_CONFIG_SUPABASE.html`)
- [ ] Sistema funciona localmente

### 3. GitHub
- [ ] Repositório criado: `scm-supabase-experimental`
- [ ] Código commitado e enviado
- [ ] Repositório público ou Vercel tem acesso

---

## 🚀 DURANTE O DEPLOY

### 4. Vercel - Conta e Deploy
- [ ] Conta criada no Vercel
- [ ] GitHub conectado ao Vercel
- [ ] Repositório importado no Vercel
- [ ] Configuração:
  - Framework: Other
  - Build/Install: vazio
- [ ] Deploy iniciado
- [ ] Deploy concluído ✅
- [ ] URL recebida (ex: `https://seu-projeto.vercel.app`)

---

## ⚙️ APÓS O DEPLOY

### 5. Configurar Supabase Authentication
- [ ] Abrir Supabase Dashboard
- [ ] Ir em **Authentication** → **URL Configuration**
- [ ] Site URL configurada: `https://seu-projeto.vercel.app`
- [ ] Redirect URLs adicionadas:
  - `https://seu-projeto.vercel.app/login.html`
  - `https://seu-projeto.vercel.app/SCM_Supabase.html`
  - `https://seu-projeto.vercel.app/CRIAR_ADMIN.html`
  - `https://seu-projeto.vercel.app/**`
- [ ] Configurações salvas

### 6. Criar Conta Admin
- [ ] Acessar: `https://seu-projeto.vercel.app/CRIAR_ADMIN.html`
- [ ] Preencher formulário:
  - Nome completo
  - Email
  - Senha (mínimo 6 caracteres)
- [ ] Conta criada com sucesso ✅

---

## 🧪 TESTES

### 7. Testar Funcionalidades
- [ ] Acessar: `https://seu-projeto.vercel.app/login.html`
- [ ] Fazer login com credenciais admin
- [ ] Testar funcionalidades:
  - [ ] **Login** funciona
  - [ ] **Logout** funciona
  - [ ] **Criar produto** salva no Supabase
  - [ ] **Editar produto** atualiza no Supabase
  - [ ] **Excluir produto** remove do Supabase
  - [ ] **Movimentações** salvam corretamente
  - [ ] **Importar CSV** funciona
  - [ ] **Exportar dados** funciona
  - [ ] **Filtros** funcionam
  - [ ] **Paginação** funciona
  - [ ] **Sincronização** online/offline funciona

### 8. Verificar Console
- [ ] Abrir Console (F12)
- [ ] Não há erros críticos
- [ ] Conexão Supabase: 🟢 (verde)
- [ ] Dados carregam corretamente

---

## 👥 COMPARTILHAR

### 9. Preparar para Equipe
- [ ] URL do sistema documentada
- [ ] Credenciais admin seguras
- [ ] Criar contas para usuários (ou orientar registro)
- [ ] Enviar link: `https://seu-projeto.vercel.app/login.html`
- [ ] Documentação compartilhada:
  - `AUTENTICACAO.md`
  - `README.md`
  - Manual de uso

---

## 📊 MONITORAMENTO

### 10. Acompanhar Sistema
- [ ] Vercel Dashboard configurado
- [ ] Notificações de deploy ativas
- [ ] Analytics habilitado (opcional)
- [ ] Backup automático do Supabase

---

## 🎯 STATUS FINAL

Marque quando tudo estiver pronto:

- [ ] ✅ Sistema online e acessível
- [ ] ✅ Login funcionando
- [ ] ✅ CRUD completo testado
- [ ] ✅ Equipe tem acesso
- [ ] ✅ Dados sincronizando com Supabase

---

## 📝 INFORMAÇÕES IMPORTANTES

**URL do Sistema:**
```
https://_____________________________.vercel.app/login.html
```

**Credenciais Admin:**
```
Email: _____________________________
Senha: (guardar em local seguro)
```

**Supabase Project:**
```
URL: https://kaqkzrngebxfuvquromi.supabase.co
```

**Data do Deploy:**
```
Data: ____/____/________
```

---

## 🆘 SE ALGO DER ERRADO

### Erros Comuns:

**❌ Erro 404 na página**
→ Verificar se `vercel.json` está no repositório

**❌ "Supabase client não inicializado"**
→ Verificar `supabase-config.js` com credenciais corretas

**❌ "Invalid login credentials"**
→ Verificar se SQL foi executado e conta criada

**❌ Deploy falhou**
→ Ver logs no Vercel Dashboard

---

**🎉 Parabéns! Sistema no ar! 🚀**

---

**Última atualização:** 2025-10-10

