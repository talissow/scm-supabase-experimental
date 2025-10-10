# 🚀 SCM - Controle de Materiais (Versão Experimental Supabase)

> **IMPORTANTE:** Esta é uma versão experimental do Sistema de Controle de Materiais integrada com Supabase. O sistema principal permanece 100% funcional com IndexedDB local.

## 📋 Sobre

Este é um experimento para adicionar funcionalidades de backend ao SCM usando Supabase como BaaS (Backend as a Service). O objetivo é permitir:

- ✅ Sincronização em nuvem dos dados
- ✅ Acesso multi-dispositivo
- ✅ Backup automático
- ✅ Colaboração em tempo real (futuro)

## 🛠️ Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript Puro
- **Database Local:** IndexedDB
- **Backend:** Supabase (PostgreSQL)
- **Real-time:** Supabase Real-time subscriptions

## 📦 Estrutura

```
experimental_supabase/
├── SCM_Supabase.html          # Interface principal
├── app.js                      # Lógica de negócio
├── db.js                       # IndexedDB (fallback local)
├── styles.css                  # Estilos
├── supabase-config.js          # ⚠️ Configuração Supabase (não commitado)
├── supabase-adapter.js         # Adapter para Supabase
├── supabase_schema.sql         # Schema do banco de dados
├── GUIA_SETUP_SUPABASE.md     # Guia de configuração
└── README_EXPERIMENTAL.txt     # Notas do experimento
```

## 🚀 Como usar

### 1. Criar conta no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto

### 2. Criar as tabelas

1. No Supabase, vá em **SQL Editor**
2. Execute o script em `supabase_schema.sql`

### 3. Configurar credenciais

1. Copie o arquivo `supabase-config.js.example` para `supabase-config.js`:
   ```bash
   copy supabase-config.js.example supabase-config.js
   ```

2. Edite `supabase-config.js` com suas credenciais:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'https://seu-projeto.supabase.co',
       anonKey: 'sua-chave-publica-aqui'
   };
   ```

### 4. Abrir o sistema

Simplesmente abra `SCM_Supabase.html` no navegador!

## 🔒 Segurança

⚠️ **IMPORTANTE:** O arquivo `supabase-config.js` está no `.gitignore` e NÃO deve ser commitado com suas credenciais reais!

Para compartilhar o projeto:
- Use `supabase-config.js.example` como template
- Nunca commite credenciais reais
- Configure Row Level Security (RLS) no Supabase

## 📚 Documentação Completa

Leia o arquivo `GUIA_SETUP_SUPABASE.md` para instruções detalhadas de setup e configuração.

## 🔄 Sistema Híbrido

O sistema funciona em modo híbrido:
- **Online:** Salva no Supabase + IndexedDB local
- **Offline:** Salva apenas no IndexedDB
- **Sincronização:** Ao voltar online, sincroniza automaticamente

## 🎯 Status

- [x] Schema do banco criado
- [x] Adapter básico implementado
- [ ] Integração completa com o app.js
- [ ] Sincronização bidirecional
- [ ] Resolução de conflitos
- [ ] Interface de status online/offline
- [ ] Testes de carga

## 📝 Licença

Projeto experimental - Uso livre

## 👨‍💻 Contribuindo

Este é um experimento. Sinta-se livre para fazer fork e melhorar!

---

**Sistema Principal:** O SCM original continua funcionando 100% offline com IndexedDB no diretório raiz do projeto.

