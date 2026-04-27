# 🚀 Comece a Testar Agora! - 5 Passos

## Passo 1: Clonar e Instalar (3 min)

```bash
# Clone o projeto
git clone https://github.com/talissow/scm-supabase-experimental.git
cd scm-supabase-experimental
git checkout progresso-do-projeto

# Instale dependências
npm install
```

## Passo 2: Configurar Ambiente (2 min)

```bash
# Copie arquivo de exemplo
cp .env.local.example .env.local

# Edite .env.local com suas credenciais Supabase:
# NEXT_PUBLIC_SUPABASE_URL=https://seu-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

**Como obter as credenciais:**
1. Abra https://supabase.com/dashboard
2. Settings → API
3. Copie "Project URL" e "anon public"

## Passo 3: Rodar Localmente (1 min)

```bash
npm run dev
```

Abra: **http://localhost:3000**

## Passo 4: Fazer Login (1 min)

- **Email:** admin@scm.local
- **Senha:** password

Clique "Entrar"

## Passo 5: Testar Funcionalidades (5 min)

Abra `CHECKLIST_TESTES_LOCAL.md` e execute os testes rápidos

---

## Tempo Total: ~15 minutos

---

## Se Tiver Problema?

### Erro: "Cannot find module"
```bash
rm -rf node_modules
npm install
```

### Erro: "Supabase connection failed"
- Verifique `.env.local` (copiar/colar errado?)
- Confirme que projeto Supabase está online

### Porta 3000 já em uso
```bash
npm run dev -- -p 3001
# Acesse http://localhost:3001
```

---

## Documentação Completa

Depois de começar, leia:
- **SETUP_LOCAL.md** - Guia detalhado
- **TESTES_LOCAIS.md** - Testes completos
- **PROJETO_COMPLETO.md** - Visão geral do projeto

---

**Pronto? Comece agora! 🎯**
