# 🗑️ Funcionalidade: Limpar Todo o Estoque

## 📋 Descrição

Esta funcionalidade permite limpar/zerar todo o estoque de materiais do sistema com apenas um clique, ideal para quando você deseja recomeçar do zero ou realizar uma limpeza completa.

---

## 🔧 Como Usar

### **Passo 1: Acessar o Sistema**
Acesse a página principal do sistema: [SCM_Supabase.html](https://scm-supabase.vercel.app/SCM_Supabase.html)

### **Passo 2: Localizar o Botão**
O botão **"🗑️ Limpar Estoque"** está localizado na barra de ações, ao lado dos botões de Importar e Exportar.

### **Passo 3: Clicar no Botão**
Ao clicar, você verá duas janelas de confirmação para evitar exclusões acidentais:

#### **1ª Confirmação:**
```
⚠️ ATENÇÃO - AÇÃO IRREVERSÍVEL!

Você está prestes a EXCLUIR TODOS os X materiais do estoque.

Essa ação NÃO pode ser desfeita!

Deseja continuar?
```

Opções: **[OK]** ou **[Cancelar]**

#### **2ª Confirmação:**
```
⚠️ ÚLTIMA CONFIRMAÇÃO!

Tem CERTEZA ABSOLUTA que deseja excluir TODOS os X materiais?

Digite "CONFIRMAR" para prosseguir (ou clique em Cancelar para abortar)
```

**IMPORTANTE:** Você precisa digitar exatamente a palavra **`CONFIRMAR`** (em letras maiúsculas) para prosseguir.

---

## ✅ O que Acontece ao Limpar

Quando você confirma a limpeza, o sistema:

1. **🌐 Limpa o Supabase (nuvem)**
   - Exclui todas as movimentações
   - Exclui todos os produtos

2. **💾 Limpa o IndexedDB (local)**
   - Remove todos os dados armazenados localmente

3. **🧹 Limpa a Memória**
   - Zera os arrays de produtos e movimentações
   - Invalida o cache

4. **📦 Limpa o localStorage**
   - Remove backups locais

5. **🔄 Atualiza a Interface**
   - Recarrega todas as visualizações
   - Reseta contadores e filtros

---

## ⚠️ Avisos Importantes

### **🚨 IRREVERSÍVEL**
Esta ação **NÃO pode ser desfeita**! Todos os materiais serão permanentemente excluídos.

### **💡 Recomendação**
Antes de limpar o estoque, **faça um backup**:
1. Clique em **"📤 Exportar"**
2. Escolha **"JSON"** (backup completo com histórico)
3. Salve o arquivo em local seguro

Você poderá restaurar os dados depois usando **"📥 Importar > JSON"**.

---

## 🔒 Segurança

A função possui **dupla confirmação**:
1. **Primeira barreira:** Botão de confirmação padrão
2. **Segunda barreira:** Digitação obrigatória de "CONFIRMAR"

Isso evita exclusões acidentais causadas por cliques involuntários.

---

## 🧪 Casos de Uso

### **1. Recomeçar do Zero**
- Sistema novo ou em fase de testes
- Deseja limpar dados de exemplo

### **2. Mudança de Projeto**
- Trocar de obra/projeto
- Iniciar novo inventário

### **3. Limpeza de Dados Corrompidos**
- Dados inconsistentes
- Problemas de sincronização

### **4. Demonstrações**
- Resetar sistema para apresentações
- Limpar após treinamentos

---

## 💻 Detalhes Técnicos

### **Função Principal:**
```javascript
async function clearAllStock()
```

### **O que é excluído:**
- ✅ Todos os produtos da tabela `products`
- ✅ Todas as movimentações da tabela `movements`
- ✅ Cache em memória
- ✅ Dados do IndexedDB local
- ✅ Backups do localStorage

### **O que NÃO é excluído:**
- ❌ Tipos customizados (permanecem)
- ❌ Usuários do sistema
- ❌ Configurações
- ❌ Histórico de auditoria (se existir)

---

## 🆘 Solução de Problemas

### **Erro ao Limpar da Nuvem**
Se ocorrer erro ao limpar o Supabase:
- O sistema continuará e limpará os dados locais
- Verifique sua conexão com a internet
- Verifique as permissões no Supabase

### **Dados Não Foram Limpos**
Se após confirmar os dados não foram excluídos:
1. Verifique o console do navegador (F12)
2. Recarregue a página (F5)
3. Tente novamente

### **Quero Recuperar os Dados**
Se excluiu por engano:
- **COM BACKUP:** Importe o arquivo JSON de backup
- **SEM BACKUP:** Não há como recuperar os dados 😔

---

## 🎯 Exemplo Prático

### **Cenário: Reset para Nova Obra**

**Situação:** Você terminou uma obra e quer usar o sistema para uma nova.

**Passos:**
1. ✅ **Exportar dados atuais** (backup da obra anterior)
   - Clique em "📤 Exportar > JSON"
   - Salve como: `Obra_Predio_A_2025.json`

2. ✅ **Limpar estoque**
   - Clique em "🗑️ Limpar Estoque"
   - Confirme a exclusão
   - Digite "CONFIRMAR"

3. ✅ **Começar novo inventário**
   - Sistema zerado e pronto para novos cadastros
   - Nenhum material antigo no sistema

4. ✅ **Consultar obra anterior**
   - Se precisar ver dados antigos, importe o backup
   - Ou abra o arquivo JSON em um editor

---

## 📝 Notas de Versão

**Data de Implementação:** 2025-10-10  
**Versão:** 1.1.0  
**Status:** ✅ Funcional e testado

---

## 📞 Suporte

Se precisar de ajuda com esta funcionalidade:
- Consulte a documentação principal: [README.md](README.md)
- Verifique os logs no console (F12)
- Entre em contato com o suporte técnico

---

**⚠️ LEMBRE-SE: Sempre faça backup antes de limpar o estoque!**

---

**Última atualização:** 2025-10-10

