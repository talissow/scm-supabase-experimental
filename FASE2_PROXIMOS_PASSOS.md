# FASE 2: Autenticação & Layout (Próximos Passos)

**Status:** Começando agora  
**Tempo Estimado:** 9 horas  
**Deadline:** Próximos 2-3 dias

---

## O que será feito em FASE 2

### 1. Componentes de Layout (4 horas)

#### 1.1 Navigation Bar
- Logo/Branding no topo
- User menu com dropdown
- Theme toggle
- Logout botão
- Responsivo em mobile

#### 1.2 Sidebar
- Links para navegação principal
- Ícones com labels
- Collapse em mobile
- Active state indicators

#### 1.3 Breadcrumb
- Navegação hierárquica
- Links funcionais
- Mobile-friendly

#### 1.4 MainLayout
- Wrapper reutilizável
- Navbar + Sidebar + Content
- Responsive grid

### 2. Proteção de Rotas (2 horas)

#### 2.1 ProtectedRoute Component
- Verificar autenticação
- Redirecionar se não autenticado
- Loading state

#### 2.2 PublicRoute Component
- Redirecionar se autenticado
- Para login/registro

### 3. Melhorias de Autenticação (3 horas)

#### 3.1 Session Persistence
- Manter usuário logado
- Refresh token automático
- Logout em segurança

#### 3.2 User Menu
- Dropdown com opções
- Perfil (futuro)
- Configurações (futuro)
- Logout

---

## Arquivos que serão criados

```
src/
├── components/
│   └── layouts/
│       ├── Navigation.tsx          [~80 linhas]
│       ├── Sidebar.tsx             [~100 linhas]
│       ├── MainLayout.tsx          [~50 linhas]
│       ├── Breadcrumb.tsx          [~60 linhas]
│       └── index.ts
│
├── lib/
│   └── hooks/
│       ├── useRouter.ts (custom)   [~30 linhas]
│       └── useNavigation.ts        [~30 linhas]
│
├── config/
│   └── navigation.ts               [~40 linhas]

app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx                [Refatorado]
│   └── layout.tsx                  [~30 linhas]
│
└── (app)/
    ├── layout.tsx                  [~20 linhas]
    ├── page.tsx                    [Refatorado]
    ├── products/
    │   └── page.tsx                [Nova página]
    ├── movements/
    │   └── page.tsx                [Nova página]
    └── admin/
        └── page.tsx                [Nova página]

TOTAL: ~7 novos arquivos, ~600 linhas de código
```

---

## Timeline Recomendada

### Dia 1 (3 horas)
- [ ] Criar Navigation.tsx
- [ ] Criar Sidebar.tsx
- [ ] Criar MainLayout.tsx

### Dia 2 (3 horas)
- [ ] Criar Breadcrumb.tsx
- [ ] Criar ProtectedRoute component
- [ ] Refatorar layout estrutura

### Dia 3 (3 horas)
- [ ] Adicionar navegação config
- [ ] Criar páginas stubs (products, movements, admin)
- [ ] Testar navegação completa
- [ ] Polimentos finais

---

## Como Estruturar

### Navigation.tsx (Top Bar)

```tsx
'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { Button } from '@/components/common';

export function Navigation() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-slate-800 shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="font-bold text-xl">SCM</div>
        
        {/* Center - can be empty or add search */}
        
        {/* Right - User menu */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </Button>
          {/* User dropdown */}
          <Button variant="secondary" onClick={signOut}>
            Sair
          </Button>
        </div>
      </div>
    </nav>
  );
}
```

### Sidebar.tsx (Left Navigation)

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/products', label: 'Produtos', icon: '📦' },
    { href: '/movements', label: 'Movimentos', icon: '📤' },
    { href: '/admin', label: 'Admin', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 shadow h-screen">
      <nav className="p-4 space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`
              block p-2 rounded
              ${pathname === link.href
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-600'
                : 'hover:bg-gray-100 dark:hover:bg-slate-700'
              }
            `}
          >
            {link.icon} {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

### MainLayout.tsx (Wrapper)

```tsx
import { Navigation } from './Navigation';
import { Sidebar } from './Sidebar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col">
      <Navigation />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## Páginas a Criar

### Products Page
```tsx
export default function ProductsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Produtos</h1>
      {/* Tabela de produtos */}
      <p>Produtos em desenvolvimento...</p>
    </div>
  );
}
```

### Movements Page
```tsx
export default function MovementsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Movimentos</h1>
      {/* Histórico de movimentos */}
      <p>Movimentos em desenvolvimento...</p>
    </div>
  );
}
```

### Admin Page
```tsx
export default function AdminPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Administração</h1>
      {/* Painel admin */}
      <p>Admin em desenvolvimento...</p>
    </div>
  );
}
```

---

## Checklist para FASE 2

### Componentes
- [ ] Navigation.tsx criado
- [ ] Sidebar.tsx criado
- [ ] MainLayout.tsx criado
- [ ] Breadcrumb.tsx criado
- [ ] ProtectedRoute.tsx criado

### Páginas
- [ ] /products/page.tsx
- [ ] /movements/page.tsx
- [ ] /admin/page.tsx
- [ ] Layout principal refatorado

### Autenticação
- [ ] Session persistence
- [ ] User menu dropdown
- [ ] Logout funcionando
- [ ] Rotas protegidas

### Responsividade
- [ ] Mobile menu funcional
- [ ] Sidebar collapsa
- [ ] Layout adaptável

### Testes
- [ ] Navegação funciona
- [ ] Protected routes funcionam
- [ ] Dark mode em todos componentes
- [ ] Mobile testing

---

## Comandos para Proceder

```bash
# 1. Instalar deps (se ainda não feito)
npm install

# 2. Executar dev server
npm run dev

# 3. Abrir em outro terminal
# http://localhost:3000/login

# 4. Depois de criar arquivos
npm run build  # Verificar se compila
npm run lint   # Checar código
```

---

## Próxima Fase Após FASE 2

### FASE 3: Dashboard & Funcionalidades (20 horas)

O que virá:
- [ ] Componente ProductTable com dados reais
- [ ] Componente MovementForm
- [ ] Dashboard stats cards com dados
- [ ] Gráficos com Recharts
- [ ] Filtros e busca
- [ ] Paginação
- [ ] Export de dados

---

## Dúvidas Comuns para FASE 2

### P: Por que usar App Router?
**R:** Melhor performance, Server Components, routing mais limpo

### P: Como fazer dark mode funcionar?
**R:** Já feito! UseTheme hook cuida disso

### P: Como proteger rotas?
**R:** Criaremos ProtectedRoute component que verifica auth

### P: Preciso refatorar o código antigo?
**R:** Não! Novo código roda em paralelo. O antigo fica em backup.

---

## Status Final da FASE 1

```
✅ Setup completo
✅ Design system funcional
✅ Login page pronta
✅ Dashboard básico pronto
✅ Dark mode funcionando
✅ TypeScript 100%
✅ Supabase integrado

👉 PRONTO PARA FASE 2!
```

---

**Vamos começar FASE 2 quando você estiver pronto!**

Quer que eu comece agora ou você quer revisar algo primeiro?
