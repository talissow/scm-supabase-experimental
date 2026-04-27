# Setup Local - Guia Completo

## 1. Pré-requisitos

Instale antes de começar:
- **Node.js** 18+ (baixe em https://nodejs.org/)
- **npm** ou **yarn** (vem com Node.js)
- **Git** (para clonar o repositório)

Verifique instalação:
```bash
node --version
npm --version
git --version
```

## 2. Clonar o Repositório

```bash
# Clone o repositório
git clone https://github.com/talissow/scm-supabase-experimental.git

# Entre na pasta
cd scm-supabase-experimental

# Mude para a branch de desenvolvimento
git checkout progresso-do-projeto
```

## 3. Instalar Dependências

```bash
# Instale todas as dependências
npm install

# Ou se usar yarn:
yarn install

# Ou se usar pnpm:
pnpm install
```

**Tempo esperado:** 2-3 minutos (depende da internet)

## 4. Configurar Variáveis de Ambiente

### Copie o arquivo de exemplo:
```bash
cp .env.local.example .env.local
```

### Edite `.env.local` com suas credenciais Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

Como obter as credenciais:
1. Abra https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em "Settings" → "API"
4. Copie `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
5. Copie `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 5. Criar Schema no Supabase (Se não existir)

Se seu banco está vazio, execute:

```bash
# Vá até a pasta SQL
cd sql

# Abra o arquivo schema-minimo.sql no Supabase SQL Editor
# Copie todo o conteúdo e execute no Supabase Dashboard
```

Ou automaticamente:
```bash
# Seu projeto tem arquivo setup de SQL em /sql/schema-minimo.sql
# Copie e execute no SQL Editor do Supabase
```

## 6. Criar Usuário Admin (Se não existir)

```bash
# Abra o Supabase Dashboard
# Vá em Authentication → Users
# Clique em "Add user"
# Email: admin@scm.local
# Password: password
```

## 7. Rodar Localmente

```bash
# Inicie o servidor de desenvolvimento
npm run dev

# Ou com yarn:
yarn dev

# Ou com pnpm:
pnpm dev
```

Output esperado:
```
  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 1.2s
```

## 8. Acessar no Navegador

Abra: **http://localhost:3000**

Será redirecionado para login automaticamente:
- **Email:** admin@scm.local
- **Senha:** password

## 9. Testar Funcionalidades

### Dashboard
- [ ] Carrega sem erros
- [ ] Mostra 4 cards com estatísticas
- [ ] Dark mode funciona (clique na lua)

### Produtos
- [ ] Lista carrega do Supabase
- [ ] Busca funciona
- [ ] Clique em "Novo Produto" abre modal
- [ ] Criar novo produto funciona

### Movimentos
- [ ] Select de produtos carrega
- [ ] Registra movimento (entrada/saída)
- [ ] Quantidade do produto atualiza
- [ ] Histórico mostra últimos movimentos

### Admin
- [ ] Página carrega
- [ ] Mostra informações do sistema

### Geral
- [ ] Navegação funciona (sidebar + menu)
- [ ] Dark mode em todas as páginas
- [ ] Logout funciona
- [ ] Responsividade mobile (redimensione o navegador)

## 10. Parar o Servidor

```bash
# Pressione Ctrl+C no terminal
```

## Troubleshooting

### "ENOENT: no such file or directory"
```bash
# Recrie node_modules
rm -rf node_modules package-lock.json
npm install
```

### "Cannot find module"
```bash
# Limpe cache Next.js
rm -rf .next
npm run dev
```

### "Supabase connection failed"
- Verifique `.env.local` tem as credenciais corretas
- Teste a conexão: http://localhost:3000/api/health (se existir)
- Confirme que seu projeto Supabase está online

### Porta 3000 já está em uso
```bash
# Use outra porta
npm run dev -- -p 3001
# Acesse http://localhost:3001
```

### Dark mode não muda
- Verifique se localStorage está ativado
- Limpe cookies: DevTools → Application → Cookies → Delete

## Próximos Passos

1. **Testar tudo localmente** ✓
2. **Criar mais produtos** para teste
3. **Registrar movimentos** e ver atualizações
4. **Testar dark mode** em todas as páginas
5. **Testar mobile** (F12 → Toggle device)
6. Depois fazer **deploy em Vercel**

## Comandos Úteis

```bash
# Build para produção (testa se tudo compila)
npm run build

# Verificar erros de linting
npm run lint

# Abrir DevTools do navegador
F12

# Reload do página (limpa cache)
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

## Dúvidas?

Verifique:
- `/docs/` - Documentação detalhada
- `PROJETO_COMPLETO.md` - Visão geral
- `README_REACT.md` - Info sobre React

---

**Boa sorte com os testes locais! Qualquer erro, me avise! 🚀**
