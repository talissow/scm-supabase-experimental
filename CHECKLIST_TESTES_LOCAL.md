# Checklist de Testes Locais - Rápido

Use este checklist para validar rapidamente se está tudo funcionando:

## Setup Inicial

- [ ] `npm install` - Dependências instaladas sem erro
- [ ] `.env.local` configurado com Supabase credentials
- [ ] `npm run dev` - Servidor iniciou em http://localhost:3000

---

## Autenticação

- [ ] Página de login carrega
- [ ] Login com admin@scm.local / password funciona
- [ ] Dashboard carrega após login
- [ ] Logout funciona
- [ ] Sem login: redireciona para /login

---

## Navegação

- [ ] Dashboard acessível
- [ ] Produtos acessível
- [ ] Movimentos acessível
- [ ] Admin acessível
- [ ] Breadcrumb atualiza
- [ ] Hamburger menu funciona em mobile

---

## Funcionalidades

### Dashboard
- [ ] 4 stats cards aparecem
- [ ] Gráfico aparece
- [ ] Dark mode funciona

### Produtos
- [ ] Tabela carrega
- [ ] Busca funciona
- [ ] Novo Produto → Modal abre
- [ ] Criar produto funciona
- [ ] Editar produto funciona
- [ ] Deletar produto funciona

### Movimentos
- [ ] Select de produtos carrega
- [ ] Registrar movimento funciona
- [ ] Quantidade atualiza em Produtos
- [ ] Histórico mostra movimentos

---

## Experiência

- [ ] Dark mode switch funciona
- [ ] Mobile responsivo (redimensione)
- [ ] Sem erros no console
- [ ] Sem lag/travamento
- [ ] Animações suaves

---

## Antes de Deploy

- [ ] Todos items acima ✓
- [ ] Criou pelo menos 1 produto teste
- [ ] Registrou pelo menos 1 movimento
- [ ] Testou mobile (F12 → toggle device)
- [ ] Console sem erros

---

**Se tudo ✓ → PRONTO PARA DEPLOY!**

Se tiver ✗ → Anote o erro e entre em contato
