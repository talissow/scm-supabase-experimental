# Documentação Completa do Sistema de Estoque (experimental_supabase)

Versão do repositório: experimental_supabase
Data: 2025-10-16

Esta documentação foi elaborada para dar ao leitor humano ou a um modelo de IA uma compreensão holística do sistema de estoque, sua arquitetura, funcionalidades, fluxos de dados, tecnologias utilizadas e procedimentos de instalação, teste e deploy. O objetivo é facilitar o aprendizado do sistema e acelerar integrações, manutenção e transferência de conhecimento.

---

## Sumário

1. Visão Geral
2. Tecnologias e Serviços
3. Estrutura de Pastas e Arquivos Importantes
4. Configuração de Ambiente e Execução Local
5. Arquitetura e Componentes
6. Fluxos de Operação (Online/Offline/Local)
7. Autenticação e Proteção de Rotas
8. Integração com Supabase
9. Sincronização de Dados e Cache Local
10. Testes e Diagnóstico
11. Deploy (Vercel) e Publicação
12. Segurança e Políticas
13. Erros Comuns e Resoluções
14. Convenções, Globais e Status Visual
15. Como Treinar Outro Modelo de IA com este Projeto
16. Referências Internas

---

## 1) Visão Geral

- O sistema é um aplicativo web de gestão de estoque focado em operação híbrida: quando online e com Supabase configurado, utiliza o banco remoto; quando offline ou sem configuração, utiliza banco local no navegador (IndexedDB), com rotinas de sincronização para convergir dados.
- A aplicação é escrita em HTML/CSS/JavaScript (vanilla) e integra diretamente com o SDK do Supabase carregado via CDN.
- Oferece fluxo de autenticação, painéis administrativos, páginas de usuários, e ferramentas de diagnóstico e testes para validar conexão, autenticação e sincronização.
- Há diversos utilitários e scripts para desenvolvimento, depuração, backup e automação de deploy.

---

## 2) Tecnologias e Serviços

- Frontend: HTML, CSS, JavaScript (sem framework, scripts modulares).
- Backend-as-a-Service: Supabase (Auth, Database, Policies/RLS).
- Banco Local: IndexedDB (acesso via utilitários internos em `db.js`/`cache-manager.js`).
- Autenticação: Supabase Auth (via `auth.js`, `auth-guard.js`).
- Servidor de desenvolvimento local: `python -m http.server 8000`.
- Deploy: Vercel (configurações em `vercel.json` e docs em `docs/DEPLOY_VERCEL.md`).
- Integração GitHub: utilitários em `github-integration.js` e scripts de push em `scripts/`.

---

## 3) Estrutura de Pastas e Arquivos Importantes

Estrutura resumida (ver árvore completa no repositório):

- Raiz
  - `index.html`: ponto de entrada principal do app.
  - `SCM_Supabase.html`: página de administração/gestão com scripts Supabase ordenados.
  - `styles.css`: estilos globais.
  - `app.js`: lógica de inicialização, status e sincronização.
  - `router.js`: rotas internas e navegação.
  - `auth.js`: fluxo de autenticação (login, logout, signup, reset password).
  - `auth-guard.js`: proteção de rotas (verifica sessão ativa).
  - `supabase-adapter.js`: decide onde salvar/sincronizar (Supabase vs IndexedDB).
  - `supabase-manager.js`: camada de acesso ao Supabase (cliente, queries, backup, utilitários).
  - `supabase-config.js.example`: exemplo de configuração; copie para `supabase-config.js`.
  - `db.js`, `cache-manager.js`: acesso e cache no banco local (IndexedDB).
  - `stock-alerts.js`, `pagination.js`, `toast-notifications.js`: utilitários de UI/UX.
  - `admin-interno.html`, `database-admin.html`, `usuarios.html`: páginas administrativas.
  - `login.html`: página de login.
  - `docs/`: documentação detalhada de tópicos específicos (auth, deploy, testes, schema, etc.).
  - `sql/`: schemas do Supabase (tabelas, políticas, triggers). Consulte `supabase_schema_final.sql`.
  - `testes/`: páginas de teste e diagnóstico (conexão, autenticação, funcionalidades, etc.).
  - `scripts/`: automações (push, backup, etc.).
  - `.gitignore`: inclui `supabase-config.js` para não versionar credenciais reais.

---

## 4) Configuração de Ambiente e Execução Local

1. Copie `supabase-config.js.example` para `supabase-config.js` na raiz do projeto.
2. Preencha `SUPABASE_CONFIG.url` e `SUPABASE_CONFIG.anonKey` com as credenciais do seu projeto Supabase.
3. (Compatibilidade) Caso algum módulo espere variáveis separadas:
   ```js
   window.SUPABASE_URL = SUPABASE_CONFIG.url;
   window.SUPABASE_ANON_KEY = SUPABASE_CONFIG.anonKey;
   ```
4. Inicie um servidor local no diretório raiz:
   ```bash
   python -m http.server 8000
   ```
5. Acesse `http://localhost:8000/index.html` ou utilize páginas de teste em `testes/`.

Observação: arquivos de teste em `testes/` referenciam `../supabase-config.js` (paths atualizados).

---

## 5) Arquitetura e Componentes

- Carregamento de scripts (exemplo em `SCM_Supabase.html`):
  - CDN Supabase → `supabase-config.js` → `auth.js` → `auth-guard.js` → `supabase-manager.js` → `supabase-adapter.js` → demais scripts (`app.js` etc.).
- Globais relevantes:
  - `window.SUPABASE_CONFIG`: `{ url, anonKey }` (configuração do projeto Supabase).
  - `window.SUPABASE_URL` e `window.SUPABASE_ANON_KEY` (aliases opcionais, se necessário).
  - `window.supabaseClient`: instância do cliente Supabase (criada em `supabase-manager.js` / ou durante init).
  - `window.isSupabaseOnline`: flag de status remoto (controlada em `app.js`).
  - Helpers recomendados em `supabase-config.js`: `isSupabaseConfigured()`, `initSupabase()`, `isOnline()`, `getOperationMode()`.

Componentes principais e responsabilidades:

- `supabase-manager.js`:
  - Inicializa `supabaseClient` a partir das credenciais.
  - Fornece utilitários para executar queries, obter estrutura de tabelas, fazer backups e integrações auxiliares.
  - Expõe interface global (`window.SUPABASE_MANAGER`) para facilitar operações em diversas páginas.

- `supabase-adapter.js`:
  - Funções como `saveProduct` utilizam `getOperationMode()` para decidir persistência: Supabase (online e configurado) vs IndexedDB (offline/local).
  - Inclui rotinas de sincronização: `syncLocalToSupabase()` e `syncSupabaseToLocal()`.

- `app.js`:
  - Inicializa Supabase no `DOMContentLoaded`.
  - Determina `isSupabaseOnline` combinando `isSupabaseConfigured()` e `isOnline()`.
  - Escuta eventos `online`/`offline` do navegador e dispara sincronizações quando a conexão retorna.
  - Atualiza status visual (ícones e texto) conforme modo operacional.

- `auth.js`:
  - Implementa `initAuth`, `login`, `logout`, `signUp`, `resetPassword`, utilizando `supabaseClient`.
  - Tenta inicializar Supabase caso o cliente não esteja definido (`initSupabase()`).
  - Expõe interface global (`window.auth`).

- `auth-guard.js`:
  - Verifica se há sessão ativa do Supabase.
  - Bloqueia/Redireciona o acesso a páginas protegidas quando não autenticado.

- `router.js`:
  - Define rotas internas, navegação e funções como `redirectToLogin`.

---

## 6) Fluxos de Operação (Online/Offline/Local)

- Determinação de modo:
  - `isSupabaseConfigured()` verifica presença de `SUPABASE_CONFIG.url` e `anonKey` válidos.
  - `isOnline()` verifica conectividade do navegador.
  - `getOperationMode()` retorna o modo vigente combinando as duas condições:
    - Online + Configurado → uso de Supabase.
    - Offline → uso de IndexedDB.
    - Configuração ausente → modo Local (IndexedDB), mesmo se online.

- Persistência de dados:
  - `saveProduct(...)` (em `supabase-adapter.js`) decide entre Supabase e IndexedDB pelo modo.

- Sincronização:
  - Ao voltar a ficar online, `app.js` pode disparar:
    - `syncLocalToSupabase()`: envia dados criados/alterados no IndexedDB para Supabase.
    - `syncSupabaseToLocal()`: traz dados do Supabase para o IndexedDB, garantindo convergência.

---

## 7) Autenticação e Proteção de Rotas

- Fluxo de auth (em `auth.js`):
  - `initAuth()`: prepara sessão e listeners.
  - `login(email, senha)`, `logout()`, `signUp(email, senha)`, `resetPassword(email)`.
- Guardas (em `auth-guard.js`):
  - Antes de renderizar páginas protegidas, verifica sessão do usuário no Supabase.
  - Em caso de ausência de sessão, aplica `redirectToLogin` ou bloqueia acesso.

---

## 8) Integração com Supabase

- Configuração:
  - `supabase-config.js.example` fornece o esqueleto.
  - Crie `supabase-config.js` com:
    ```js
    window.SUPABASE_CONFIG = {
      url: "https://SEU-PROJETO.supabase.co",
      anonKey: "SEU-ANON-KEY"
    };
    // aliases opcionais para compatibilidade
    window.SUPABASE_URL = SUPABASE_CONFIG.url;
    window.SUPABASE_ANON_KEY = SUPABASE_CONFIG.anonKey;
    ```
- Cliente:
  - `supabase-manager.js` cria `supabaseClient` e expõe utilitários.
- Schema e políticas:
  - Arquivos em `sql/` definem tabelas, políticas (RLS) e triggers.
  - Consulte `sql/supabase_schema_final.sql` para a versão consolidada.

---

## 9) Sincronização de Dados e Cache Local

- IndexedDB:
  - Utilizado como armazenamento local quando offline ou sem configuração.
  - Abstrações em `db.js` e `cache-manager.js` (operações de leitura/escrita e cache).
- Estratégias de convergência:
  - Ao detectar retorno de conectividade e Supabase configurado, sincroniza pendências.
  - Log e status visuais ajudam a identificar progresso e falhas.

---

## 10) Testes e Diagnóstico

As páginas em `testes/` oferecem verificação direcionada:

- `TESTE_CONFIG_SUPABASE.html`: valida cliente Supabase, URL, anonKey, conexão, sessão e cadastro.
- `TESTE_CONEXAO.html`: testa conectividade com o banco.
- `TESTE_AUTENTICACAO.html`: valida login/logout/signup/reset.
- `TESTE_FUNCIONALIDADES.html`: verifica modos (Online/Offline/Local) e sincronização.
- `TESTE_DIAGNOSTICO_COMPLETO.html`: diagnóstico abrangente do sistema.
- `TESTE_TABELAS.html`, `TESTE_EXCLUSAO.html`, `TESTE_IMPORTACAO.html`: testes focados em operações específicas.
- `ACESSO_RAPIDO_SUPABASE.html`: atalhos e verificação rápida de integração.

Observações:
- Os arquivos de teste referenciam `../supabase-config.js` (corrigido para carregar do root).
- Ícones e legendas de status são descritos em `docs/ICONES_STATUS.md`.

---

## 11) Deploy (Vercel) e Publicação

- Configuração: `vercel.json` e instruções em `docs/DEPLOY_VERCEL.md`, `docs/PUSH_VERCEL.md`.
- Publicação manual/automática: scripts e guias em `docs/PUSH_MANUAL.md`, `docs/PUSH_VERCEL.md`.
- Checklist: `docs/CHECKLIST_DEPLOY.md`.

---

## 12) Segurança e Políticas

- Supabase RLS/Policies:
  - Definidas nos arquivos `sql/` (ver `supabase_schema_final.sql`).
  - Garantem que usuários só acessem seus próprios dados conforme regras.
- Proteção de rotas:
  - `auth-guard.js` impede acesso não autorizado.
- Boas práticas:
  - Nunca comitar `supabase-config.js` real (está no `.gitignore`).
  - Tratar tokens e chaves como segredos.

---

## 13) Erros Comuns e Resoluções

- `supabase-config.js` não carregado:
  - Verifique path relativo em páginas; nos testes, use `../supabase-config.js`.
- `User not allowed` / Permissões:
  - Consulte `docs/CORRIGIR_ERRO_USER_NOT_ALLOWED.md` e `docs/RESOLVER_ERRO_PERMISSAO.md`.
- Erros 404 ou caminhos quebrados:
  - Veja `docs/CORRIGIR_404.md`.
- Sintaxe e ajustes:
  - `docs/CORRIGIR_ERRO_SINTAXE.md`.

---

## 14) Convenções, Globais e Status Visual

- Variáveis globais sugeridas:
  - `SUPABASE_CONFIG`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `supabaseClient`, `isSupabaseOnline`.
- Helpers globais em `supabase-config.js` (recomendado):
  - `isSupabaseConfigured()`: valida presença de credenciais.
  - `initSupabase()`: inicializa `supabaseClient` caso necessário.
  - `isOnline()`: verifica `navigator.onLine` e/ou ping básico.
  - `getOperationMode()`: determina modo (Online/Offline/Local).
- Status visual (exemplos):
  - 🟢 Online, 🔴 Offline, ⚪ Local. Documentado em `docs/ICONES_STATUS.md`.

---

## 15) Como Treinar Outro Modelo de IA com este Projeto

Para que um modelo de IA aprenda este sistema com contexto suficiente, recomenda-se fornecer:

- Este documento completo (`docs/DOCUMENTACAO_SISTEMA_COMPLETA.md`).
- Arquivos centrais:
  - `supabase-adapter.js` (decisão de persistência e sync).
  - `app.js` (init, status, listeners online/offline, sync triggers).
  - `auth.js` e `auth-guard.js` (autenticação e proteção de rotas).
  - `supabase-manager.js` (cliente e utilitários de acesso).
  - `router.js` (navegação interna e redirecionamentos).
  - `SCM_Supabase.html` (ordem de carregamento de scripts).
  - `index.html` e páginas funcionais (admin, usuários).
- Documentação adicional:
  - `docs/` (auth, deploy, testes, schema, próximos passos, etc.).
  - `sql/` para o schema final e políticas.
- Páginas de teste:
  - Conteúdo de `testes/` para que o modelo entenda fluxos de validação.

Âncoras de conhecimento (funções-chave e o que fazem):

- `initSupabase()`: prepara `supabaseClient` se necessário.
- `isSupabaseConfigured()`: valida `SUPABASE_CONFIG`.
- `isOnline()`: status de conectividade.
- `getOperationMode()`: determina modo operacional.
- `saveProduct(product)`: persiste produto remoto/local conforme modo.
- `syncLocalToSupabase()`: envia pendências locais ao remoto.
- `syncSupabaseToLocal()`: reflete alterações remotas no banco local.
- `initAuth()`, `login()`, `logout()`, `signUp()`, `resetPassword()`: operações de autenticação.

Com este conjunto, um modelo de IA terá base suficiente para responder dúvidas, propor alterações e navegar nos fluxos do sistema.

---

## 16) Referências Internas

- Documentos de apoio (alguns exemplos):
  - `docs/AUTENTICACAO.md`, `docs/GUIA_SETUP_SUPABASE.md`, `docs/GUIA_TESTES.md`.
  - `docs/PLANO_TESTES.md`, `docs/ICONES_STATUS.md`, `docs/PROXIMOS_PASSOS.md`.
  - `docs/SCHEMA_FINAL_FUNCIONANDO.md`, `docs/USAR_SCHEMA_MINIMO.md`.
  - `docs/RESOLVER_ERRO_PERMISSAO.md`, `docs/CORRIGIR_404.md`.
- Schemas:
  - `sql/supabase_schema_final.sql` e variantes.
- Páginas de teste:
  - `testes/TESTE_CONFIG_SUPABASE.html` e demais arquivos do diretório.

---

### Notas Finais

- Mantenha `supabase-config.js` fora do versionamento (segurança).
- Sempre validar modos de operação e sincronização ao introduzir novas entidades.
- Use as páginas de teste para reproduzir comportamentos e diagnosticar problemas rapidamente.