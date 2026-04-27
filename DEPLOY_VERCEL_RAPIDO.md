# 🚀 Deploy Vercel - 2 Minutos

## O mais rápido possível

Sem Node instalado, sem máquina travada. Seu app vive na internet.

---

## 5 Passos

### 1️⃣ Abra Vercel
https://vercel.com

### 2️⃣ Clique "Add New..."
Depois: "Project"

### 3️⃣ Selecione GitHub
- Conecte sua conta GitHub
- Procure por: `scm-supabase-experimental`
- Clique "Import"

### 4️⃣ Configure Environment
Vai pedir seu `.env`:

```
NEXT_PUBLIC_SUPABASE_URL=https://kaqkzrngebxfuvquromi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

(Copie do seu `.env.local.example`)

### 5️⃣ Clique "Deploy"

---

## Pronto!

Em 2 minutos seu app está vivo:

```
https://scm-supabase-yourname.vercel.app
```

Acessa do celular, tablet, qualquer lugar.

---

## Testes Rápidos

1. Login: admin@scm.local / password
2. Vê dashboard
3. Clica em Products
4. Vê tabela vazia (normal, é novo)
5. Clica "Novo Produto" → modal abre
6. Testa dark mode (ícone lua canto superior)
7. Testa mobile (F12)

---

## Se der erro

**"Build failed"**
- Falta env var
- Copie todas do seu arquivo

**"Can't connect Supabase"**
- URL ou KEY errados
- Verifique no seu .env.local

---

## Pronto!

Seu app está na internet. Pode usar, compartilhar, mostrar para o time.

Parabéns! 🎉
