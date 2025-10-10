# 📁 Estrutura de Pastas Organizada

## ✅ Organização Concluída!

O projeto foi reorganizado para facilitar a navegação e manutenção.

---

## 📂 **NOVA ESTRUTURA:**

```
experimental_supabase/
│
├── 📁 docs/                    # 📋 Documentação do Projeto
│   ├── ADMIN_CRIADO.md
│   ├── ADMIN_INTERNO.md
│   ├── ATUALIZAR_VERCEL.md
│   ├── AUTENTICACAO.md
│   ├── CHECKLIST_DEPLOY.md
│   ├── COMO_EXECUTAR_SCHEMA.md
│   ├── CONFIGURACAO_CONCLUIDA.md
│   ├── DEPLOY_VERCEL.md
│   ├── GUIA_SETUP_SUPABASE.md
│   ├── README.md
│   └── ... (outros documentos)
│
├── 📁 sql/                     # 💾 Schemas do Banco de Dados
│   ├── supabase_schema_minimo.sql      (⭐ RECOMENDADO)
│   ├── supabase_schema_corrigido.sql
│   ├── supabase_schema_final.sql
│   ├── supabase_schema_public.sql
│   ├── supabase_schema_safe.sql
│   ├── supabase_schema_simples.sql
│   └── supabase_schema.sql
│
├── 📁 testes/                  # 🧪 Arquivos de Teste
│   ├── ACESSO_RAPIDO_SUPABASE.html
│   ├── TESTE_CONEXAO.html
│   ├── TESTE_AUTENTICACAO.html
│   ├── TESTE_DIAGNOSTICO_COMPLETO.html
│   ├── TESTE_FUNCIONALIDADES.html
│   └── ... (outros testes)
│
├── 📁 scripts/                 # ⚙️ Scripts Auxiliares
│   ├── PUSH_FACIL.bat
│   └── PUSH_PARA_GITHUB.bat
│
├── 📁 public/                  # 🌐 Arquivos Públicos (Vercel)
│
├── 📄 SCM_Supabase.html       # 🏠 Sistema Principal
├── 📄 login.html              # 🔐 Página de Login
├── 📄 admin-interno.html      # 👑 Admin Interno
├── 📄 usuarios.html           # 👥 Gerenciamento de Usuários
├── 📄 CRIAR_ADMIN.html        # 👑 Criar Administrador
├── 📄 index.html              # 🚀 Página Inicial (redirect)
│
├── 📄 app.js                  # 💻 Lógica Principal
├── 📄 db.js                   # 💾 IndexedDB
├── 📄 auth.js                 # 🔐 Autenticação
├── 📄 auth-guard.js           # 🛡️ Proteção de Rotas
├── 📄 supabase-config.js      # ⚙️ Config Supabase
├── 📄 supabase-adapter.js     # 🔌 Adapter Supabase
├── 📄 styles.css              # 🎨 Estilos
│
├── 📄 vercel.json             # 🚀 Config Vercel
├── 📄 .gitignore              # 🚫 Git Ignore
└── 📄 ESTRUTURA_ORGANIZADA.md # 📋 Este arquivo
```

---

## 🎯 **ARQUIVOS PRINCIPAIS:**

### **📱 Páginas do Sistema:**
- `SCM_Supabase.html` - Sistema principal de controle de materiais
- `login.html` - Página de login e registro
- `admin-interno.html` - Painel de administração interno
- `usuarios.html` - Gerenciamento de usuários
- `CRIAR_ADMIN.html` - Criar primeiro administrador
- `index.html` - Página inicial (redireciona para login)

### **💻 Scripts JavaScript:**
- `app.js` - Lógica principal do sistema
- `db.js` - Gerenciamento do IndexedDB
- `auth.js` - Sistema de autenticação
- `auth-guard.js` - Proteção de rotas
- `supabase-config.js` - Configuração do Supabase
- `supabase-adapter.js` - Adapter para Supabase API

### **🎨 Estilos:**
- `styles.css` - Estilos CSS do sistema

### **⚙️ Configuração:**
- `vercel.json` - Configuração do Vercel
- `.gitignore` - Arquivos ignorados pelo Git

---

## 📋 **DOCUMENTAÇÃO:**

Toda a documentação está organizada na pasta `docs/`:

### **📚 Principais Documentos:**
- `README.md` - Visão geral do projeto
- `CONFIGURACAO_CONCLUIDA.md` - Status da configuração atual
- `ADMIN_CRIADO.md` - Informações sobre o admin criado
- `AUTENTICACAO.md` - Guia do sistema de autenticação
- `DEPLOY_VERCEL.md` - Guia de deploy no Vercel
- `GUIA_SETUP_SUPABASE.md` - Configuração do Supabase

---

## 💾 **SCHEMAS SQL:**

Todos os schemas estão na pasta `sql/`:

### **⭐ Schema Recomendado:**
- `supabase_schema_minimo.sql` - **USE ESTE!** Schema mais simples e funcional

### **📜 Outros Schemas (para referência):**
- `supabase_schema_corrigido.sql` - Corrige erros de sintaxe
- `supabase_schema_final.sql` - Versão final sem triggers
- `supabase_schema_public.sql` - Evita schema auth
- `supabase_schema_safe.sql` - Com IF NOT EXISTS
- `supabase_schema_simples.sql` - Versão simplificada

---

## 🧪 **TESTES:**

Todos os testes estão na pasta `testes/`:

### **🔗 Acessar Testes Online:**
- [Acesso Rápido](https://scm-supabase.vercel.app/testes/ACESSO_RAPIDO_SUPABASE.html)
- [Teste de Conexão](https://scm-supabase.vercel.app/testes/TESTE_CONEXAO.html)
- [Teste de Autenticação](https://scm-supabase.vercel.app/testes/TESTE_AUTENTICACAO.html)
- [Diagnóstico Completo](https://scm-supabase.vercel.app/testes/TESTE_DIAGNOSTICO_COMPLETO.html)

---

## ⚙️ **SCRIPTS:**

Scripts auxiliares estão na pasta `scripts/`:

- `PUSH_FACIL.bat` - Push simplificado para GitHub
- `PUSH_PARA_GITHUB.bat` - Push para GitHub com autenticação
- `ORGANIZAR_PASTAS.ps1` - Script de organização (usado uma vez)

---

## 🚀 **LINKS RÁPIDOS:**

### **🌐 Sistema Online:**
- **Login:** https://scm-supabase.vercel.app/login.html
- **Sistema:** https://scm-supabase.vercel.app/SCM_Supabase.html
- **Admin Interno:** https://scm-supabase.vercel.app/admin-interno.html

### **🔧 Ferramentas:**
- **Supabase Dashboard:** https://supabase.com/dashboard/project/kaqkzrngebxfuvquromi
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repo:** https://github.com/talissow/scm-supabase-experimental

---

## 📝 **COMO USAR:**

### **1️⃣ Desenvolvimento Local:**
```bash
# Abrir diretório
cd experimental_supabase

# Ver estrutura
dir

# Editar arquivos principais (HTML, JS, CSS) na raiz
# Consultar documentação em docs/
# Executar testes em testes/
```

### **2️⃣ Acessar Documentação:**
```bash
cd docs
# Ler qualquer documento .md
```

### **3️⃣ Executar Schema SQL:**
```bash
cd sql
# Copiar conteúdo de supabase_schema_minimo.sql
# Colar no Supabase SQL Editor
```

### **4️⃣ Fazer Deploy:**
```bash
# Push para GitHub
cd scripts
PUSH_FACIL.bat

# Vercel faz deploy automático!
```

---

## 🎨 **BENEFÍCIOS DA ORGANIZAÇÃO:**

✅ **Fácil Navegação:**  Arquivos agrupados por tipo
✅ **Manutenção Simples:** Cada pasta tem um propósito claro
✅ **Deploy Limpo:** Apenas arquivos necessários na raiz
✅ **Documentação Acessível:** Tudo em `docs/`
✅ **Testes Organizados:** Todos em `testes/`
✅ **Versionamento SQL:** Histórico em `sql/`

---

## 📊 **ESTATÍSTICAS:**

- **📋 Documentos:** 34 arquivos em `docs/`
- **💾 Schemas SQL:** 7 versões em `sql/`
- **🧪 Testes:** 12 arquivos em `testes/`
- **⚙️ Scripts:** 2 arquivos em `scripts/`
- **📄 Arquivos Raiz:** ~15 arquivos principais

---

## 🔄 **ATUALIZAÇÃO:**

Para manter a organização:

1. **Novos documentos** → `docs/`
2. **Novos schemas SQL** → `sql/`
3. **Novos testes** → `testes/`
4. **Novos scripts** → `scripts/`
5. **Arquivos principais** → Raiz

---

**Estrutura organizada e pronta para uso! 🚀✨**

---

**Última atualização:** 2025-10-10
