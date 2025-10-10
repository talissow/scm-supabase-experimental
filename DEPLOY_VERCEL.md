# 🚀 Deploy no Vercel - Guia Completo

## 📋 Passo a Passo

### 1️⃣ Preparar o Projeto

✅ **Já está pronto!** Os arquivos necessários já estão configurados:
- `vercel.json` - Configuração do Vercel
- `.gitignore` - Ignora arquivos sensíveis
- Todos os arquivos HTML, JS e CSS

---

### 2️⃣ Criar Conta no Vercel

1. Acesse: [vercel.com](https://vercel.com/)
2. Clique em **"Sign Up"**
3. Escolha **"Continue with GitHub"**
4. Autorize o Vercel a acessar seus repositórios

---

### 3️⃣ Fazer Deploy do Projeto

#### Opção A: Deploy via Dashboard (Mais Fácil)

1. No dashboard do Vercel, clique em **"Add New..."**
2. Selecione **"Project"**
3. Clique em **"Import"** no repositório `scm-supabase-experimental`
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `./`
   - **Build Command:** *(deixar vazio)*
   - **Output Directory:** *(deixar vazio)*
   - **Install Command:** *(deixar vazio)*
5. Clique em **"Deploy"** 🚀

#### Opção B: Deploy via CLI (Avançado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Na pasta experimental_supabase
cd experimental_supabase

# Fazer login
vercel login

# Deploy
vercel --prod
```

---

### 4️⃣ Após o Deploy

O Vercel vai te dar uma URL como:
```
https://scm-supabase-experimental.vercel.app
```

**Copie essa URL!** Você vai precisar dela no próximo passo.

---

### 5️⃣ Configurar Supabase

**MUITO IMPORTANTE:** Configure as URLs permitidas no Supabase:

1. Abra [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication** → **URL Configuration**
4. Configure:

   **Site URL:**
   ```
   https://seu-projeto.vercel.app
   ```

   **Redirect URLs** (adicione todas):
   ```
   https://seu-projeto.vercel.app/login.html
   https://seu-projeto.vercel.app/SCM_Supabase.html
   https://seu-projeto.vercel.app/CRIAR_ADMIN.html
   https://seu-projeto.vercel.app/**
   ```

5. Clique em **Save**

---

### 6️⃣ Criar Conta Admin

1. Acesse: `https://seu-projeto.vercel.app/CRIAR_ADMIN.html`
2. Preencha:
   - Nome completo
   - Email
   - Senha (mínimo 6 caracteres)
3. Clique em **"Criar Administrador"**
4. ✅ Conta admin criada!

---

### 7️⃣ Testar o Sistema

1. Acesse: `https://seu-projeto.vercel.app/login.html`
2. Faça login com suas credenciais admin
3. Teste:
   - ✅ Login/Logout
   - ✅ Criar produtos
   - ✅ Editar produtos
   - ✅ Movimentações
   - ✅ Importar CSV/JSON
   - ✅ Exportar dados

---

## 🎯 Personalizar Domínio

### Domínio Vercel (Grátis)

1. No projeto do Vercel, vá em **Settings**
2. **Domains** → **Edit**
3. Mude de:
   ```
   scm-supabase-experimental.vercel.app
   ```
   Para:
   ```
   scm-materiais.vercel.app
   ```

### Domínio Próprio (Seu domínio)

1. No Vercel: **Settings** → **Domains** → **Add**
2. Digite seu domínio: `scm-materiais.com.br`
3. Configure o DNS conforme instruções
4. Aguarde propagação (até 48h)

---

## 🔄 Atualizações Automáticas

**Toda vez que você fizer push no GitHub, o Vercel atualiza automaticamente!**

```bash
# Na pasta experimental_supabase
git add .
git commit -m "Atualização do sistema"
git push origin main
```

⏱️ Em **~30 segundos**, as mudanças estarão online!

---

## 📊 Monitorar Deploy

No dashboard do Vercel você pode:
- Ver logs de deploy
- Acompanhar visitantes
- Ver erros em tempo real
- Testar preview de branches

---

## 🆘 Problemas Comuns

### ❌ Erro 404 na página inicial

**Solução:** O arquivo `vercel.json` já está configurado para redirecionar `/` para `/login.html`

### ❌ Erro "Invalid login credentials"

**Solução:** 
1. Verifique se o SQL foi executado no Supabase
2. Confirme que a conta foi criada via `CRIAR_ADMIN.html`

### ❌ Erro "Supabase client não inicializado"

**Solução:** 
1. Verifique se `supabase-config.js` tem as credenciais corretas
2. Teste abrir `TESTE_CONFIG_SUPABASE.html`

### ❌ Deploy falhou

**Solução:**
1. Verifique se o repositório GitHub está atualizado
2. Tente fazer deploy novamente no dashboard
3. Veja os logs de erro no Vercel

---

## 🔐 Segurança

✅ **Já configurado:**
- HTTPS automático (certificado SSL)
- Headers de segurança (`vercel.json`)
- `.gitignore` protege credenciais
- Row Level Security no Supabase
- Autenticação JWT

---

## 📱 Compartilhar com a Equipe

Envie o link para sua equipe:
```
https://seu-projeto.vercel.app/login.html
```

**Orientações para usuários:**
1. Criar conta (ou admin cria para eles)
2. Fazer login com email/senha
3. Usar o sistema normalmente

---

## 📈 Próximos Passos

Após deploy bem-sucedido:

1. ✅ Criar contas para usuários
2. ✅ Importar dados iniciais (CSV)
3. ✅ Configurar tipos personalizados
4. ✅ Treinar equipe
5. ✅ Monitorar uso

---

## 🎉 Pronto!

Seu **SCM - Sistema de Controle de Materiais** está online e acessível de qualquer lugar do mundo! 🌍

**URL do Sistema:** `https://seu-projeto.vercel.app/login.html`

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Vercel Dashboard
2. Abra o Console do navegador (F12)
3. Consulte a documentação em `AUTENTICACAO.md`
4. Teste com `TESTE_CONFIG_SUPABASE.html`

---

**Deploy realizado com sucesso! 🚀✨**

