@echo off
chcp 65001 > nul
echo ========================================
echo  Git Commit e Push - SAAS Tio Fabinho
echo ========================================
echo.

REM Verificar se é um repositório git
if not exist .git (
    echo Inicializando repositório Git...
    git init
    echo.
)

echo Adicionando arquivos...
git add .
echo.

echo Fazendo commit...
git commit -m "feat: adicionar sistema de correção de valores de pagamentos - Scripts SQL e documentação completa para corrigir valores R$ 0,00 nos pagamentos dos freelancers"
echo.

echo ========================================
echo  Commit realizado com sucesso!
echo ========================================
echo.

echo Para fazer push, execute:
echo   git remote add origin [URL-DO-SEU-REPOSITORIO]
echo   git push -u origin master
echo.

pause

