# 🧪 PLANO DE TESTES - SCM + SUPABASE

## 📋 **CHECKLIST DE TESTES:**

### ✅ **1. TESTE DE CONEXÃO**
- [ ] Abrir `TESTE_CONEXAO.html`
- [ ] Verificar status: 🟢 Online
- [ ] Testar conexão básica
- [ ] Testar acesso às tabelas
- [ ] Verificar logs no console

### ✅ **2. TESTE DO SISTEMA PRINCIPAL**
- [ ] Abrir `SCM_Supabase.html`
- [ ] Verificar ícone 🟢 no header
- [ ] Verificar logs: "🟢 SCM rodando em modo ONLINE"
- [ ] Verificar se carrega dados do Supabase

### ✅ **3. TESTE DE PRODUTOS (CRUD)**
- [ ] **Criar produto:**
  - [ ] Adicionar novo material
  - [ ] Verificar no console: "✅ Produto salvo no Supabase"
  - [ ] Verificar no Supabase Table Editor
- [ ] **Editar produto:**
  - [ ] Modificar material existente
  - [ ] Verificar no console: "✅ Produto atualizado no Supabase"
  - [ ] Verificar no Supabase Table Editor
- [ ] **Deletar produto:**
  - [ ] Remover material
  - [ ] Verificar se foi removido do Supabase

### ✅ **4. TESTE DE MOVIMENTAÇÕES**
- [ ] **Entrada:**
  - [ ] Fazer entrada de material
  - [ ] Verificar se salva no Supabase
- [ ] **Saída:**
  - [ ] Fazer saída de material
  - [ ] Verificar se salva no Supabase
- [ ] **Histórico:**
  - [ ] Verificar histórico de movimentações

### ✅ **5. TESTE OFFLINE/ONLINE**
- [ ] **Modo Offline:**
  - [ ] Desligar internet
  - [ ] Verificar ícone muda para 🔴
  - [ ] Adicionar produto (deve salvar local)
  - [ ] Verificar logs: "🔴 SCM rodando em modo OFFLINE"
- [ ] **Volta Online:**
  - [ ] Ligar internet
  - [ ] Verificar ícone muda para 🟢
  - [ ] Verificar sincronização automática
  - [ ] Verificar logs: "🟢 Conexão restaurada"

### ✅ **6. TESTE DE SINCRONIZAÇÃO**
- [ ] **Carregamento inicial:**
  - [ ] Limpar dados locais
  - [ ] Recarregar página
  - [ ] Verificar se carrega do Supabase
- [ ] **Sincronização bidirecional:**
  - [ ] Modificar dados offline
  - [ ] Reconectar
  - [ ] Verificar se sincroniza

### ✅ **7. TESTE DE PERFORMANCE**
- [ ] **Cache inteligente:**
  - [ ] Primeira carga (deve ser lenta)
  - [ ] Segunda carga (deve ser rápida)
  - [ ] Verificar logs de cache
- [ ] **Responsividade:**
  - [ ] Interface deve responder rapidamente
  - [ ] Sem travamentos

### ✅ **8. TESTE DE VALIDAÇÕES**
- [ ] **Validações de produto:**
  - [ ] Nome duplicado (deve bloquear)
  - [ ] Campos obrigatórios
  - [ ] Quantidades negativas
- [ ] **Validações de movimentação:**
  - [ ] Saída maior que estoque
  - [ ] Campos obrigatórios

---

## 🎯 **CRITÉRIOS DE SUCESSO:**

### ✅ **OBRIGATÓRIOS:**
- [ ] Conexão com Supabase funcionando
- [ ] Produtos salvando na nuvem
- [ ] Sistema funcionando offline
- [ ] Sincronização automática
- [ ] Interface responsiva

### ✅ **DESEJÁVEIS:**
- [ ] Performance otimizada
- [ ] Logs informativos
- [ ] Ícones de status funcionando
- [ ] Validações robustas

---

## 🚨 **POSSÍVEIS PROBLEMAS:**

### **Conexão:**
- Supabase não configurado
- Credenciais incorretas
- Tabelas não criadas

### **Sincronização:**
- Conflitos de dados
- Perda de dados offline
- Falha na sincronização

### **Performance:**
- Carregamento lento
- Interface travando
- Cache não funcionando

---

## 📝 **RELATÓRIO DE TESTES:**

Após cada teste, marque:
- ✅ **SUCESSO** - Funcionou perfeitamente
- ⚠️ **PARCIAL** - Funcionou com problemas
- ❌ **FALHA** - Não funcionou

**Observações:**
```
[Escreva aqui problemas encontrados e soluções]
```

---

**Vamos começar os testes! Me guie pelos resultados!** 🚀
