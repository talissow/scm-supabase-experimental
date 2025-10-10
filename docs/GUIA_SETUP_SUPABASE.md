# 🚀 Guia de Setup - Supabase para SCM

## ⚠️ VERSÃO EXPERIMENTAL - NÃO SUBSTITUI O SISTEMA ATUAL!

**Sistema original continua funcionando em:**  
`C:\Users\t010704\Desktop\Estoque 1.0\SCM.html`

**Esta é apenas uma POC (Proof of Concept) para testar Supabase!**

---

## 📋 **PASSO A PASSO COMPLETO:**

### **FASE 1: Criar Conta no Supabase** (5 minutos)

#### **1.1 Acessar Supabase:**
```
→ Abra: https://supabase.com
→ Clique em "Start your project"
→ Clique em "Sign Up" (criar conta)
```

#### **1.2 Criar Conta:**
```
Opções:
- GitHub (recomendado - 1 clique)
- Google
- Email/senha

Escolha uma e faça login.
```

#### **1.3 Criar Projeto:**
```
→ Clique em "New Project"
→ Nome: SCM
→ Database Password: [crie uma senha forte]
→ Region: South America (São Paulo)
→ Pricing Plan: Free (grátis)
→ Clique em "Create new project"

Aguarde 2-3 minutos (criando infraestrutura)
```

---

### **FASE 2: Configurar Banco de Dados** (10 minutos)

#### **2.1 Abrir SQL Editor:**
```
→ Sidebar esquerda: Clique em "SQL Editor"
→ Clique em "New query"
```

#### **2.2 Executar Schema:**
```
→ Copie TODO o conteúdo de: supabase_schema.sql
→ Cole no editor SQL
→ Clique em "Run" (ou Ctrl+Enter)

Você verá:
✅ Success. No rows returned

Tabelas criadas:
- products
- movements
- custom_types
```

#### **2.3 Verificar Tabelas:**
```
→ Sidebar: Clique em "Table Editor"
→ Deve ver 3 tabelas:
   ✅ products
   ✅ movements
   ✅ custom_types
```

---

### **FASE 3: Obter Credenciais** (2 minutos)

#### **3.1 Pegar URL e Chave:**
```
→ Sidebar: Clique em "Settings" (⚙️)
→ Clique em "API"
→ Você verá:

📋 Project URL:
https://xyzcompany.supabase.co
[Copiar]

📋 anon public key:
eyJhbGc... (chave longa)
[Copiar]
```

#### **3.2 Copie os dois valores!**
- URL do projeto
- Chave pública (anon key)

---

### **FASE 4: Configurar Sistema** (5 minutos)

#### **4.1 Editar supabase-config.js:**
```javascript
// Abra: experimental_supabase/supabase-config.js

// ANTES:
url: 'COLE_SUA_URL_AQUI',
anonKey: 'COLE_SUA_CHAVE_PUBLICA_AQUI'

// DEPOIS:
url: 'https://xyzcompany.supabase.co', // Cole sua URL
anonKey: 'eyJhbGc...' // Cole sua chave
```

#### **4.2 Editar SCM_Supabase.html:**
```html
<!-- Adicione ANTES de </head> -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase-config.js"></script>
<script src="supabase-adapter.js"></script>
```

---

### **FASE 5: Testar** (10 minutos)

#### **5.1 Abrir Sistema:**
```
→ Duplo clique em: experimental_supabase/SCM_Supabase.html
→ Pressione F12 (console)
```

#### **5.2 Verificar Inicialização:**
```
Console deve mostrar:
✅ Supabase inicializado com sucesso!
✅ Modo: online
```

#### **5.3 Adicionar Material de Teste:**
```
→ Cadastre um material: "Cimento Teste"
→ Veja no console: "✅ Produto adicionado no Supabase"
```

#### **5.4 Verificar no Supabase:**
```
→ Volte para https://supabase.com
→ Table Editor → products
→ Deve ver o material "Cimento Teste"! 🎉
```

---

## 🎯 **COMPARAÇÃO:**

### **Sistema Original (SCM.html):**
```
✅ Funciona 100% offline
✅ Dados em IndexedDB local
✅ Não precisa internet
✅ Simples e confiável
```

### **Versão Experimental (SCM_Supabase.html):**
```
✅ Funciona online E offline
✅ Dados no Supabase (nuvem)
✅ Acessa de qualquer lugar
✅ Multi-usuário
⚠️ Experimental
```

---

## 🆚 **MODOS DE OPERAÇÃO:**

### **Modo Online (Internet OK):**
```
SCM_Supabase.html
      ↓
  Supabase
      ↓
Banco na Nuvem
```
- Salva direto na nuvem
- Outros usuários veem em tempo real
- Acessa de qualquer dispositivo

### **Modo Offline (Sem Internet):**
```
SCM_Supabase.html
      ↓
  IndexedDB
      ↓
Banco Local
```
- Funciona normalmente
- Quando conectar → Sincroniza

---

## 📊 **ESTRUTURA DE ARQUIVOS EXPERIMENTAL:**

```
experimental_supabase/
├── SCM_Supabase.html ← Sistema adaptado
├── app.js ← Lógica (cópia)
├── db.js ← IndexedDB (fallback)
├── styles.css ← Estilos (cópia)
│
├── 📦 NOVOS ARQUIVOS SUPABASE:
├── supabase_schema.sql ← SQL para criar tabelas
├── supabase-config.js ← Configuração
└── supabase-adapter.js ← Funções de integração
```

---

## ✅ **CHECKLIST DE SETUP:**

- [ ] 1. Criar conta no Supabase
- [ ] 2. Criar projeto "SCM"
- [ ] 3. Executar supabase_schema.sql
- [ ] 4. Copiar URL e chave
- [ ] 5. Colar em supabase-config.js
- [ ] 6. Adicionar scripts no HTML
- [ ] 7. Abrir SCM_Supabase.html
- [ ] 8. Testar adicionar material
- [ ] 9. Verificar no dashboard Supabase
- [ ] 10. Comemorar! 🎉

---

## 🧪 **TESTES A FAZER:**

### **Teste 1: Adicionar Material**
1. Adicione material no sistema
2. Vá no Supabase → Table Editor
3. Material deve aparecer lá!

### **Teste 2: Editar Material**
1. Edite material no sistema
2. Atualize tabela no Supabase
3. Mudança deve aparecer!

### **Teste 3: Dois Navegadores**
1. Abra sistema em Chrome
2. Abra sistema em Edge (mesma URL se hospedar)
3. Edite em um → Atualiza no outro!

### **Teste 4: Modo Offline**
1. Desconecte internet
2. Sistema deve continuar funcionando
3. Salva no IndexedDB local
4. Conecte internet → Sincroniza!

---

## 🎯 **PRÓXIMOS PASSOS APÓS SETUP:**

### **Se funcionar bem:**
1. Hospedar frontend (Netlify/Vercel - grátis)
2. Adicionar autenticação (login/senha)
3. Melhorar sincronização
4. Adicionar real-time (atualiza automático)
5. Criar versão mobile (PWA)

### **Se não funcionar:**
1. Voltar para SCM.html original
2. Sistema atual está intacto!
3. Sem problema, foi só teste!

---

## 💰 **CUSTO:**

**Supabase Plano Grátis:**
- ✅ 500 MB de banco (milhares de materiais)
- ✅ 2 GB de armazenamento
- ✅ Unlimited API requests
- ✅ Real-time
- ✅ Autenticação
- ✅ Dashboard

**Custo: R$ 0/mês**

---

## ⚠️ **IMPORTANTE:**

### **Esta é uma versão EXPERIMENTAL!**

✅ **Sistema original (SCM.html) continua funcionando**  
✅ **Sem risco de perder dados**  
✅ **Pode testar sem medo**  
✅ **Se não gostar, deleta pasta experimental**  

---

## 🆘 **PROBLEMAS COMUNS:**

### **Erro ao conectar Supabase:**
- Verifique URL e chave em supabase-config.js
- Verifique se script Supabase foi incluído no HTML
- Veja console (F12) para erro específico

### **Tabelas não criadas:**
- Execute supabase_schema.sql novamente
- Verifique se selecionou projeto correto

### **Dados não aparecem:**
- Verifique Table Editor no Supabase
- Veja console para erros
- Tente modo offline primeiro

---

## 🎓 **O QUE VOCÊ VAI APRENDER:**

- ✅ Como usar Supabase
- ✅ Backend as a Service (BaaS)
- ✅ API REST automática
- ✅ Real-time databases
- ✅ PostgreSQL básico
- ✅ Sincronização de dados

---

## 🔄 **ROLLBACK:**

**Se quiser voltar:**
```
1. Deletar pasta: experimental_supabase/
2. Continuar usando: SCM.html
3. Fim! Sistema original intacto.
```

---

## 🎉 **BOA SORTE NO EXPERIMENTO!**

**Lembre-se:**
- É só teste!
- Sistema original seguro!
- Pode explorar sem medo!

**Qualquer dúvida, consulte a documentação do Supabase:**
https://supabase.com/docs

---

**Desenvolvido por Talishow Tech © 2025**

