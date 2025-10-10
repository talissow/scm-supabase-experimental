# 📤 Como Publicar no GitHub

## ✅ Passo 1: Criar Repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique no botão **"+"** no canto superior direito
3. Selecione **"New repository"**
4. Configure:
   - **Nome:** `scm-supabase-experimental` (ou o nome que preferir)
   - **Descrição:** Sistema de Controle de Materiais com Supabase
   - **Visibilidade:** Public ou Private
   - ❌ **NÃO marque** "Initialize this repository with a README"
5. Clique em **"Create repository"**

## ✅ Passo 2: Conectar ao Repositório

O GitHub vai mostrar instruções. Use estas opções:

### Opção A: Se ainda não configurou o remote

```bash
git remote add origin https://github.com/SEU-USUARIO/scm-supabase-experimental.git
git branch -M main
git push -u origin main
```

### Opção B: Comandos completos no PowerShell

```powershell
# 1. Adicionar o remote (substitua SEU-USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU-USUARIO/scm-supabase-experimental.git

# 2. Renomear branch para main (padrão GitHub)
git branch -M main

# 3. Fazer o primeiro push
git push -u origin main
```

## 🔐 Autenticação

Na primeira vez, o Git vai pedir suas credenciais do GitHub.

### Opção 1: Token de Acesso Pessoal (Recomendado)

1. Vá em GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Gere um novo token com permissão **"repo"**
3. Use o token como senha quando o Git pedir

### Opção 2: GitHub CLI (gh)

Se tiver o GitHub CLI instalado:

```bash
gh auth login
gh repo create scm-supabase-experimental --source=. --public --push
```

## ✅ Passo 3: Verificar

Após o push, visite seu repositório no GitHub:
```
https://github.com/SEU-USUARIO/scm-supabase-experimental
```

Você deve ver todos os arquivos, incluindo o README.md formatado!

## 📝 Próximas Atualizações

Para fazer updates futuros:

```bash
git add .
git commit -m "Descrição das mudanças"
git push
```

## ⚠️ Importante

- ✅ O arquivo `supabase-config.js` está no `.gitignore` (não será enviado)
- ✅ Apenas o template `supabase-config.js.example` é commitado
- ✅ Suas credenciais estão seguras

## 🎯 Status Atual

✅ Repositório Git inicializado
✅ Commit inicial feito
✅ .gitignore configurado
✅ README criado
⏳ Aguardando conexão com GitHub

## 🆘 Problemas?

### Erro: "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/SEU-USUARIO/scm-supabase-experimental.git
```

### Erro de autenticação

- Use um Personal Access Token em vez de senha
- Ou instale o GitHub CLI para facilitar

---

**Dica:** Copie e cole os comandos um por vez no PowerShell dentro da pasta `experimental_supabase`!

