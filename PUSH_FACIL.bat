@echo off
chcp 65001 >nul
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║            PUSH PARA GITHUB - MÉTODO FÁCIL                 ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📌 Este script vai fazer o push para:
echo    https://github.com/talissonsousa10-ship-it/scm-supabase-experimental
echo.
echo ⚠️  IMPORTANTE - Você tem 2 opções:
echo.
echo ┌────────────────────────────────────────────────────────────┐
echo │ OPÇÃO 1: Usar token na URL (mais rápido)                  │
echo └────────────────────────────────────────────────────────────┘
echo.
set /p "token=Cole seu token do GitHub aqui (começa com ghp_): "
echo.
if "%token%"=="" (
    echo ❌ Token não fornecido!
    echo.
    echo Copie seu token de: https://github.com/settings/tokens
    pause
    exit /b 1
)
echo 🔄 Configurando remote com token...
git remote set-url origin https://%token%@github.com/talissonsousa10-ship-it/scm-supabase-experimental.git
echo.
echo 🚀 Fazendo push...
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║                  ✅ SUCESSO! 🎉                            ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    echo 🌐 Acesse: https://github.com/talissonsousa10-ship-it/scm-supabase-experimental
    echo.
    echo 🔐 Seu token foi salvo localmente e não será enviado ao GitHub
    echo.
) else (
    echo.
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║                  ❌ ERRO NO PUSH                           ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    echo Possíveis causas:
    echo   - Token inválido ou expirado
    echo   - Token sem permissão "repo"
    echo   - Repositório não existe no GitHub
    echo.
    echo Soluções:
    echo   1. Gere um novo token: https://github.com/settings/tokens
    echo   2. Marque a opção "repo" ao criar o token
    echo   3. Verifique se o repositório existe no GitHub
    echo.
)
pause

