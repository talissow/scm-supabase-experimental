# 🚀 DEPLOY VERCEL - PASSO A PASSO COMPLETO

## Pré-requisitos
- Git instalado (você já tem)
- Conta Vercel (usa GitHub login)
- Credenciais Supabase

## 3 PASSOS PRINCIPAIS

### PASSO 1: Push para GitHub
**Local: Casa ou PC pessoal com Git**

```bash
# Terminal/Prompt
cd /caminho/do/projeto/scm-supabase-experimental
git add .
git commit -m "FASE 4 COMPLETA: Redesign React - Production Ready"
git push origin progresso-do-projeto
```

**Verificar no GitHub:**
- Abra: https://github.com/talissow/scm-supabase-experimental
- Branch `progresso-do-projeto` deve ter os novos arquivos
- Procure por: app/, src/, package.json, tsconfig.json

### PASSO 2: Conectar em Vercel
**Online: https://vercel.com**

1. Faça login com GitHub
2. Clique "Add New..." → "Project"
3. Clique "Import Git Repository"
4. Procure: `scm-supabase-experimental`
5. Clique "Import"

### PASSO 3: Configurar Environment
**Em Vercel: Project Settings**

1. Clique "Environment Variables"
2. Adicione:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

3. Onde pegar?
   - Abra: https://app.supabase.com
   - Seu projeto → Settings → API
   - Copie: Project URL e anon key
   - Cole em Vercel

4. Clique "Save"

### PASSO 4: Deploy
**Em Vercel: Automatic**

1. Clique "Deploy"
2. Espere 2-3 minutos
3. Vercel gera URL: `https://seu-projeto-123.vercel.app`
4. Clique na URL → ✅ Pronto!

## TESTE RÁPIDO

**Abra a URL do seu app:**
1. http://seu-projeto.vercel.app
2. Login: admin@scm.local / password
3. Veja o dashboard funcionar
4. Clique nos menus
5. Teste produtos e movimentos

## ✅ CHECKLIST FINAL

- [ ] GitHub push feito
- [ ] Vercel projeto criado
- [ ] Environment vars configuradas
- [ ] Deploy completou sem erros
- [ ] App abre na URL
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Dados aparecem do Supabase
- [ ] Dark mode funciona

## ❓ DÚVIDAS?

**Erro "Cannot find module"?**
- Vercel não achou dependências
- Verifique se `package.json` tem `next`, `react`, `tailwindcss`
- Faça git push novamente

**Erro "Supabase connection"?**
- Environment vars erradas
- Copie novamente do Supabase
- Redeploy em Vercel

**Erro "404 page not found"?**
- App não compilou certo
- Verifique logs em Vercel
- Clique "View Logs"

---

**Parabéns! Seu SCM está no ar! 🎉**
