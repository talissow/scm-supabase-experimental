# 🚀 DEPLOY EM VERCEL - 5 MINUTOS

## ⚡ Resumo Rápido

Vamos deployar o novo SCM em React em 5 minutos. Super fácil!

## 📋 Passos

### 1. Ir para Vercel (1 min)
- Abra: https://vercel.com/dashboard
- Clique: "New Project"

### 2. Selecionar Git (1 min)
- Clique: "Import Git Repository"
- Cole: https://github.com/talissow/scm-supabase-experimental
- Selecione branch: `progresso-do-projeto`
- Clique: "Import"

### 3. Configurar Env Vars (1 min)
- Vercel vai pedir Environment Variables
- Adicione essas 2:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
```

Onde pegar? Dashboard Supabase → Settings → API

### 4. Deploy (1 min)
- Clique: "Deploy"
- Espere ~2 minutos
- Pronto! 🎉

### 5. Testar (1 min)
- Vercel gera uma URL: `https://seu-projeto.vercel.app`
- Abra no navegador
- Faça login com `admin@scm.local` / `password`

## ✅ Pronto!

Seu app está 100% funcional na internet!

Compartilhe a URL com seu time!

## 🔗 Links Úteis
- Dashboard: https://vercel.com/dashboard
- Seu Projeto: Será criado automaticamente
- Domínio Custom: Configure depois
