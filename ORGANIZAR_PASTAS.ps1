# Script para organizar arquivos do projeto

Write-Host "📁 Organizando arquivos..." -ForegroundColor Cyan

# Mover arquivos de documentação para docs/
Write-Host "`n📋 Movendo documentação..." -ForegroundColor Yellow
$docs = @(
    "ADMIN_CRIADO.md",
    "ADMIN_INTERNO.md",
    "ATUALIZAR_VERCEL.md",
    "AUTENTICACAO.md",
    "CHECKLIST_DEPLOY.md",
    "COMMIT_INSTRUCOES.md",
    "COMO_EXECUTAR_SCHEMA.md",
    "COMO_PUBLICAR_GITHUB.md",
    "CONFIGURACAO_CONCLUIDA.md",
    "CONFIGURAR_SUPABASE_COMPLETO.md",
    "CORRECAO_ERRO_REGISTRO.md",
    "CORRECOES_EXCLUSAO.md",
    "CORRECOES_IMPORTACAO.md",
    "CORRIGIR_404.md",
    "CORRIGIR_ERRO_SINTAXE.md",
    "CORRIGIR_ERRO_USER_NOT_ALLOWED.md",
    "CORRIGIR_PAGINAS.md",
    "DEPLOY_VERCEL.md",
    "GIT_STATUS.txt",
    "GUIA_SETUP_SUPABASE.md",
    "GUIA_TESTES.md",
    "ICONES_STATUS.md",
    "PLANO_TESTES.md",
    "PROTECAO_ROTAS.md",
    "PROXIMOS_PASSOS.md",
    "PUSH_MANUAL.md",
    "PUSH_VERCEL.md",
    "README_EXPERIMENTAL.txt",
    "README.md",
    "RESOLVER_ERRO_PERMISSAO.md",
    "SCHEMA_FINAL_FUNCIONANDO.md",
    "TESTE_DIRETO.md",
    "USAR_SCHEMA_MINIMO.md",
    "VERCEL_PROJECT_INFO.md"
)

foreach ($file in $docs) {
    if (Test-Path $file) {
        Move-Item $file "docs\" -Force
        Write-Host "  ✅ $file" -ForegroundColor Green
    }
}

# Mover arquivos SQL para sql/
Write-Host "`n💾 Movendo schemas SQL..." -ForegroundColor Yellow
$sqlFiles = @(
    "supabase_schema.sql",
    "supabase_schema_corrigido.sql",
    "supabase_schema_final.sql",
    "supabase_schema_minimo.sql",
    "supabase_schema_public.sql",
    "supabase_schema_safe.sql",
    "supabase_schema_simples.sql"
)

foreach ($file in $sqlFiles) {
    if (Test-Path $file) {
        Move-Item $file "sql\" -Force
        Write-Host "  ✅ $file" -ForegroundColor Green
    }
}

# Mover arquivos de teste para testes/
Write-Host "`n🧪 Movendo testes..." -ForegroundColor Yellow
$tests = @(
    "ACESSO_RAPIDO_SUPABASE.html",
    "TESTE_AUTENTICACAO.html",
    "TESTE_CONEXAO.html",
    "TESTE_CONFIG_SUPABASE.html",
    "TESTE_DIAGNOSTICO_COMPLETO.html",
    "TESTE_EXCLUSAO.html",
    "TESTE_FUNCIONALIDADES.html",
    "TESTE_IMPORTACAO.html",
    "TESTE_PAGINAS.html",
    "TESTE_SIMPLES.html",
    "TESTE_TABELAS.html",
    "verificar-deploy.html"
)

foreach ($file in $tests) {
    if (Test-Path $file) {
        Move-Item $file "testes\" -Force
        Write-Host "  ✅ $file" -ForegroundColor Green
    }
}

# Mover scripts para scripts/
Write-Host "`n⚙️ Movendo scripts..." -ForegroundColor Yellow
$scriptFiles = @(
    "PUSH_FACIL.bat",
    "PUSH_PARA_GITHUB.bat"
)

foreach ($file in $scriptFiles) {
    if (Test-Path $file) {
        Move-Item $file "scripts\" -Force
        Write-Host "  ✅ $file" -ForegroundColor Green
    }
}

Write-Host "`nOrganizacao concluida!" -ForegroundColor Green
Write-Host "`nEstrutura final:" -ForegroundColor Cyan
Write-Host "  docs/ - Documentacao do projeto"
Write-Host "  sql/ - Schemas do banco de dados"
Write-Host "  testes/ - Arquivos de teste"
Write-Host "  scripts/ - Scripts auxiliares"
Write-Host "  public/ - Arquivos publicos"
Write-Host "  Arquivos principais (HTML, JS, CSS) na raiz"
