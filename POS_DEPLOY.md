# ✅ Checklist Pós-Deploy

Depois que o app estiver no Vercel, faça esses testes:

## Checklist Rápido

### Acesso
- [ ] App abre na URL fornecida
- [ ] Sem erros 404
- [ ] Página de login carrega

### Login
- [ ] Email: admin@scm.local
- [ ] Senha: password
- [ ] Efetua login com sucesso
- [ ] Redireciona para Dashboard

### Dashboard
- [ ] Dashboard carrega completo
- [ ] Cards de stats aparecem
- [ ] Dark mode funciona (clique no ícone)
- [ ] Sidebar abre em mobile (F12)

### Navegação
- [ ] Clique em "Produtos" funciona
- [ ] Tabela de produtos carrega
- [ ] Clique em "Movimentos" funciona
- [ ] Clique em "Admin" funciona

### Dados
- [ ] Produtos aparecem da base Supabase
- [ ] Pode criar novo produto (botão "Novo")
- [ ] Pode registrar movimento
- [ ] Quantidade atualiza automaticamente

### Responsividade
- [ ] Clique F12 para Developer Tools
- [ ] Clique no ícone mobile (canto superior)
- [ ] Teste em iPhone, iPad, Android
- [ ] Tudo responsivo?

### Performance
- [ ] Abra Inspector (F12)
- [ ] Vá até "Lighthouse"
- [ ] Clique "Generate Report"
- [ ] Performance > 80?

## Se Tiver Problema

### Erro "Cannot POST"
- Supabase credentials erradas
- Verifique .env vars no Vercel

### Tabela vazia
- Dados não estão no Supabase
- Execute o schema SQL no Supabase

### Erro "CORS"
- Problema de configuração
- Envie a URL do Vercel para Supabase Auth URLs

## Status Final

Se tudo ✅ → Deploy bem-sucedido!

Se algo ❌ → Envie o erro, ajudamos!
