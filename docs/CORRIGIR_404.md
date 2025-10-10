# 🔧 Corrigir Erro 404 no Vercel

## ❌ Problema
O Vercel está mostrando erro 404 porque não encontrou a página inicial.

## ✅ Solução Aplicada

Criei os seguintes arquivos para corrigir:

1. **`index.html`** - Página inicial que redireciona para login
2. **`vercel.json`** - Atualizado para usar `rewrites` em vez de `routes`

---

## 🚀 Como Aplicar a Correção

### Opção 1: GitHub Desktop (RECOMENDADO)

1. **Abra o GitHub Desktop**
2. Você verá os arquivos modificados:
   - `index.html` (novo)
   - `vercel.json` (modificado)
3. **Summary:** `Corrigir erro 404 - adicionar index.html`
4. **Description:**
   ```
   - Adicionado index.html para página inicial
   - Atualizado vercel.json para usar rewrites
   - Corrige erro 404 no Vercel
   ```
5. **Commit to main**
6. **Push origin** (botão azul)

### Opção 2: PowerShell

```powershell
cd "C:\Users\t010704\Desktop\Estoque 1.0\experimental_supabase"
git add index.html vercel.json
git commit -m "Corrigir erro 404 - adicionar index.html"
git push origin main
```

---

## ⏱️ Após o Push

1. **Aguarde ~30 segundos** (Vercel atualiza automaticamente)
2. **Acesse sua URL do Vercel** novamente
3. **Deve redirecionar** para `/login.html` automaticamente

---

## 🧪 Testar

Acesse:
```
https://scm-supabase.vercel.app
```

**Deve:**
- ✅ Carregar a página inicial
- ✅ Redirecionar automaticamente para `/login.html`
- ✅ Mostrar a tela de login

---

## 🆘 Se Ainda Der 404

### Teste Direto:
```
https://scm-supabase.vercel.app/login.html
```

Se funcionar, o problema é só no redirecionamento da raiz.

### Verificar Deploy:
1. No Vercel Dashboard
2. Vá em **Deployments**
3. Veja se o último deploy foi bem-sucedido
4. Clique no commit mais recente

---

## 📋 Próximos Passos (Após Corrigir 404)

1. ✅ **Configurar Supabase Authentication**
   - Site URL: `https://scm-supabase.vercel.app`
   - Redirect URLs: adicionar todas as páginas

2. ✅ **Criar Conta Admin**
   - Acesse: `https://scm-supabase.vercel.app/CRIAR_ADMIN.html`

3. ✅ **Testar Sistema Completo**
   - Login, CRUD, movimentações, etc.

---

**A correção deve resolver o 404! 🚀**

---

**Última atualização:** 2025-10-10
