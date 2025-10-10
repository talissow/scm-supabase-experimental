@echo off
echo ========================================
echo   PUSH PARA GITHUB
echo ========================================
echo.
echo Repositorio: scm-supabase-experimental
echo Usuario: talissonsousa10-ship-it
echo.
echo IMPORTANTE:
echo - Quando pedir PASSWORD, use seu Personal Access Token
echo - NAO use sua senha do GitHub
echo.
echo Como criar o token:
echo 1. Acesse: https://github.com/settings/tokens
echo 2. Generate new token (classic)
echo 3. Marque a opcao "repo"
echo 4. Copie o token gerado
echo.
pause
echo.
echo Executando push...
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo   SUCESSO! ^_^
    echo ========================================
    echo.
    echo Acesse: https://github.com/talissonsousa10-ship-it/scm-supabase-experimental
    echo.
) else (
    echo ========================================
    echo   ERRO! :(
    echo ========================================
    echo.
    echo Leia o arquivo PUSH_MANUAL.md para instrucoes
    echo.
)
pause

