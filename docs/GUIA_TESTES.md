# 🧪 GUIA DE TESTES - SCM + SUPABASE

## 🚀 **COMO EXECUTAR OS TESTES:**

### **Passo 1: Teste de Conexão Básica**
1. **Abra:** `TESTE_CONEXAO.html`
2. **Verifique:** Status deve mostrar "✅ Conexão com Supabase estabelecida"
3. **Clique:** "Testar Tabelas"
4. **Resultado esperado:** Todas as 3 tabelas acessíveis

### **Passo 2: Teste de Funcionalidades**
1. **Abra:** `TESTE_FUNCIONALIDADES.html`
2. **Verifique:** Status no topo deve mostrar "🟢 Online (Supabase)"
3. **Execute os testes em ordem:**
   - 🔗 **Teste 1:** Testar Conexão → Testar Tabelas
   - 📦 **Teste 2:** Criar Produto → Atualizar Produto → Deletar Produto
   - 📊 **Teste 3:** Criar Movimentação → Listar Movimentações
   - 🔄 **Teste 4:** Testar Sincronização

### **Passo 3: Teste do Sistema Principal**
1. **Abra:** `SCM_Supabase.html`
2. **Verifique:** Ícone 🟢 no header
3. **Teste manual:**
   - Adicionar um material
   - Verificar no console: "✅ Produto salvo no Supabase"
   - Verificar no Supabase Table Editor

### **Passo 4: Teste Offline/Online**
1. **No SCM_Supabase.html:**
   - Desligue a internet
   - Verifique ícone muda para 🔴
   - Adicione um material (deve salvar local)
   - Ligue a internet
   - Verifique ícone muda para 🟢
   - Verifique sincronização

---

## 📊 **RESULTADOS ESPERADOS:**

### ✅ **SUCESSO TOTAL:**
- 🟢 Conexão com Supabase funcionando
- 🟢 Todos os CRUDs funcionando
- 🟢 Sincronização offline/online
- 🟢 Interface responsiva
- 🟢 Logs informativos

### ⚠️ **PROBLEMAS POSSÍVEIS:**
- 🔴 Erro de conexão (verificar credenciais)
- 🔴 Tabelas não encontradas (executar SQL)
- 🔴 Timeout de rede (verificar internet)
- 🔴 Erro de permissão (verificar RLS)

---

## 🎯 **CHECKLIST DE VALIDAÇÃO:**

### **Teste de Conexão:**
- [ ] TESTE_CONEXAO.html carrega
- [ ] Status: ✅ Conexão estabelecida
- [ ] Todas as 3 tabelas acessíveis
- [ ] Logs mostram 🟢

### **Teste de Funcionalidades:**
- [ ] TESTE_FUNCIONALIDADES.html carrega
- [ ] Status: 🟢 Online (Supabase)
- [ ] Criar produto: ✅ Sucesso
- [ ] Atualizar produto: ✅ Sucesso
- [ ] Deletar produto: ✅ Sucesso
- [ ] Criar movimentação: ✅ Sucesso
- [ ] Listar movimentações: ✅ Sucesso

### **Teste do Sistema Principal:**
- [ ] SCM_Supabase.html carrega
- [ ] Ícone 🟢 no header
- [ ] Adicionar material funciona
- [ ] Console mostra: "✅ Produto salvo no Supabase"
- [ ] Dados aparecem no Supabase

### **Teste Offline/Online:**
- [ ] Offline: Ícone muda para 🔴
- [ ] Offline: Adicionar material funciona (local)
- [ ] Online: Ícone muda para 🟢
- [ ] Online: Sincronização automática

---

## 🚨 **SE DER PROBLEMA:**

### **Erro de Conexão:**
1. Verifique se executou o SQL no Supabase
2. Confirme se as credenciais estão corretas
3. Teste a internet

### **Tabelas não encontradas:**
1. Vá no Supabase → SQL Editor
2. Execute o `supabase_schema.sql`
3. Verifique em Table Editor

### **Produtos não salvam:**
1. Verifique console do navegador
2. Confirme se está online (🟢)
3. Verifique permissões RLS

---

## 📝 **RELATÓRIO DE TESTES:**

Após executar todos os testes, marque:

### **Teste de Conexão:**
- [ ] ✅ SUCESSO
- [ ] ⚠️ PARCIAL  
- [ ] ❌ FALHA

### **Teste de Funcionalidades:**
- [ ] ✅ SUCESSO
- [ ] ⚠️ PARCIAL
- [ ] ❌ FALHA

### **Teste do Sistema Principal:**
- [ ] ✅ SUCESSO
- [ ] ⚠️ PARCIAL
- [ ] ❌ FALHA

### **Teste Offline/Online:**
- [ ] ✅ SUCESSO
- [ ] ⚠️ PARCIAL
- [ ] ❌ FALHA

**Observações:**
```
[Escreva aqui problemas encontrados e soluções]
```

---

**Execute os testes e me informe os resultados!** 🚀
