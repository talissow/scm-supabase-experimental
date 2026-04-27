# Sistema de Controle de Materiais (SCM) - React Edition

Novo redesign moderno do SCM com React, Next.js e Tailwind CSS.

## Stack Tecnológico

- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS 3
- **Backend:** Supabase
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Charts:** Recharts

## Estrutura de Pastas

```
.
├── app/                    # Next.js App Router
│   ├── page.tsx           # Dashboard principal
│   ├── login/             # Páginas de autenticação
│   ├── layout.tsx         # Layout global
│   └── globals.css        # Estilos globais
├── src/
│   ├── components/        # Componentes React
│   │   ├── common/        # Componentes base (Button, Input, etc)
│   │   └── features/      # Componentes específicos
│   ├── lib/               # Lógica compartilhada
│   │   ├── context/       # Contextos (Auth, Theme)
│   │   └── supabase.ts    # Cliente Supabase
│   ├── types/             # Tipos TypeScript
│   └── config/            # Configurações
├── package.json           # Dependências
├── tailwind.config.ts     # Configuração Tailwind
└── next.config.ts         # Configuração Next.js
```

## Como Executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## Progresso - FASE 1 ✅

- [x] Setup Next.js + React + Tailwind
- [x] Contextos (Auth, Theme)
- [x] Componentes base (Button, Input, Card, Modal)
- [x] Login page com theme toggle
- [x] Dashboard principal
- [x] Integração Supabase

**Próxima:** FASE 2 - Layouts e componentes de navegação
