# Guia de Testes Locais

## Estrutura de Testes

Você deve testar:
1. **Autenticação** - Login/Logout
2. **Navegação** - Menu e rotas
3. **Funcionalidades** - CRUD de dados
4. **Performance** - Velocidade e responsividade
5. **Dark Mode** - Tema alternado
6. **Responsividade** - Mobile/Tablet/Desktop

---

## 1. Teste de Autenticação

### Login
- [ ] Abra http://localhost:3000
- [ ] Será redirecionado para `/login`
- [ ] Digite: **admin@scm.local**
- [ ] Senha: **password**
- [ ] Clique "Entrar"
- [ ] Deve ir para Dashboard
- [ ] Verifique nome do usuário na navbar

### Logout
- [ ] Clique no seu nome (navbar canto superior)
- [ ] Clique "Sair"
- [ ] Deve retornar para login
- [ ] Tente acessar `/products` - redireciona para login

---

## 2. Teste de Navegação

### Sidebar (Desktop)
- [ ] Clique em "Dashboard" - vai para home
- [ ] Clique em "Produtos" - vai para /products
- [ ] Clique em "Movimentos" - vai para /movements
- [ ] Clique em "Admin" - vai para /admin
- [ ] Breadcrumb atualiza (ex: Dashboard > Produtos)

### Mobile (Redimensione para 375px)
- [ ] Sidebar vira hambúrguer (3 linhas)
- [ ] Clique no hambúrguer - sidebar abre
- [ ] Clique em um item - sidebar fecha
- [ ] Navegação funciona normalmente

### Navbar
- [ ] Logo "SCM" clicável (vai para home)
- [ ] Ícone de lua/sol (muda tema)
- [ ] Seu nome/email aparece
- [ ] Dropdown com logout funciona

---

## 3. Teste de Dashboard

```bash
# URL: http://localhost:3000/
```

- [ ] 4 cards aparecem (Produtos, Movimentos, Baixo Estoque, Valor)
- [ ] Valores mostram 0 (dados de demo)
- [ ] Gráfico aparece (Últimos 7 dias)
- [ ] "Movimentos Recentes" vazio (normalmente)
- [ ] "Atividades" vazio (normalmente)

---

## 4. Teste de Produtos

```bash
# URL: http://localhost:3000/products
```

### Listar Produtos
- [ ] Tabela carrega com dados do Supabase
- [ ] Colunas: Nome, Descrição, Quantidade, Mín, Ações
- [ ] Se nenhum produto: "Nenhum produto registrado"

### Buscar Produtos
- [ ] Campo "Buscar..." funciona
- [ ] Filtra enquanto digita
- [ ] Limpar busca restaura todos

### Criar Produto
- [ ] Clique "Novo Produto"
- [ ] Modal abre com formulário
- [ ] Preenchaa:
  - **Nome:** Produto Teste
  - **Descrição:** Teste de produto
  - **Quantidade:** 100
  - **Mínimo:** 10
  - **Unidade:** UN
- [ ] Clique "Criar"
- [ ] Modal fecha
- [ ] Novo produto aparece na tabela

### Editar Produto
- [ ] Clique lápis (ícone edit)
- [ ] Modal abre com dados preenchidos
- [ ] Altere algo (ex: quantidade)
- [ ] Clique "Atualizar"
- [ ] Valor atualiza na tabela

### Deletar Produto
- [ ] Clique lixeira (ícone delete)
- [ ] Confirmação aparece
- [ ] Clique "Deletar"
- [ ] Produto desaparece da tabela

---

## 5. Teste de Movimentos

```bash
# URL: http://localhost:3000/movements
```

### Registrar Movimento
- [ ] Select "Selecione um produto" mostra lista
- [ ] Selecione um produto
- [ ] Formulário aparece
- [ ] Escolha tipo: "Entrada" ou "Saída"
- [ ] Digite quantidade: 5
- [ ] Clique "Registrar"
- [ ] Sucesso: "Movimento registrado"
- [ ] Volte em Produtos - quantidade mudou

### Verificar Histórico
- [ ] Abra "Histórico de Movimentos"
- [ ] Movimento recém criado aparece
- [ ] Mostra: Data, Tipo, Qtd, Usuário
- [ ] Último apareça no topo

---

## 6. Teste de Dark Mode

### Mudar Tema
- [ ] Clique ícone lua (na navbar)
- [ ] Interface muda para preto
- [ ] Clique novamente (sol)
- [ ] Retorna ao branco

### Verificar em Todas as Páginas
- [ ] Dashboard - dark mode funciona
- [ ] Produtos - dark mode funciona
- [ ] Movimentos - dark mode funciona
- [ ] Admin - dark mode funciona
- [ ] Login - dark mode funciona
- [ ] Reload página - tema persiste (localStorage)

---

## 7. Teste de Responsividade

### Desktop (1440px)
- [ ] Layout em 4 colunas (stats)
- [ ] Sidebar visível
- [ ] Tabelas com scroll horizontal se necessário

### Tablet (768px)
- [ ] Redimensione browser para 768px
- [ ] Layout em 2 colunas
- [ ] Sidebar vira hambúrguer
- [ ] Tudo funciona normalmente

### Mobile (375px)
- [ ] Redimensione para 375px
- [ ] Texto legível (sem zoom)
- [ ] Botões clicáveis (>44px)
- [ ] Sem overflow horizontal
- [ ] Formulários funcionam

Para testar no DevTools:
1. Pressione F12
2. Clique ícone device (toggle device mode)
3. Escolha iPhone/iPad

---

## 8. Teste de Performance

### Carregamento
- [ ] Dashboard carrega em <1s
- [ ] Tabela de produtos carrega em <2s
- [ ] Movimentos atualiza em <1s

### Busca/Filtro
- [ ] Busca é instantânea
- [ ] Sem lag ao digitar

### Navegação
- [ ] Transições suaves (animações não travam)
- [ ] Cliques respondem imediatamente

---

## 9. Teste de Erros

### Tentar Criar Produto Vazio
- [ ] Deixe campos em branco
- [ ] Clique "Criar"
- [ ] Mensagem de erro aparece
- [ ] Formulário não é enviado

### Registrar Movimento Negativo
- [ ] Tente quantidade: -5
- [ ] Clique "Registrar"
- [ ] Erro ou não permite

### Sem Conexão Supabase
- [ ] Desabilite internet
- [ ] Tente fazer ação
- [ ] Mensagem de erro clara
- [ ] Não trava

---

## 10. Checklist Final

Antes de fazer deploy, confirme:

- [ ] Login/Logout funciona
- [ ] Todas as rotas funcionam
- [ ] Tabelas carregam com dados
- [ ] CRUD completo (Create, Read, Update, Delete)
- [ ] Busca/Filtro funciona
- [ ] Dark mode funciona
- [ ] Mobile responsivo
- [ ] Sem erros no console
- [ ] Performance boa
- [ ] Todas as animações suaves

---

## Console Check

Abra DevTools (F12) → Console

Verifique:
- [ ] Sem erros vermelhos
- [ ] Sem warnings críticos
- [ ] Supabase conecta sem erro

---

## Próximas Ações

1. ✓ Todos os testes passaram?
2. Fazer commit com `git add .`
3. Fazer push: `git push origin progresso-do-projeto`
4. Deploy em Vercel (próximo passo)

---

**Bom teste! Se algum erro: anote e me avise! 🧪**
