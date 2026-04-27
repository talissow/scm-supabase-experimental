#!/bin/bash
cd /vercel/share/v0-project

# Configurar Git
git config user.name "v0[bot]"
git config user.email "v0[bot]@users.noreply.github.com"

# Adicionar arquivos
git add SETUP_INTERATIVO.html
git add CHECKLIST_SETUP.md
git add GUIA_RAPIDO_30MIN.md
git add docs/SETUP_COMPLETO_PASSO_A_PASSO.md

# Fazer commit
git commit -m "docs: adicionar guias de setup e configuração automática

- SETUP_INTERATIVO.html: interface interativa para o setup
- CHECKLIST_SETUP.md: checklist detalhado com todas as tarefas
- GUIA_RAPIDO_30MIN.md: guia simplificado para setup em 30 minutos
- docs/SETUP_COMPLETO_PASSO_A_PASSO.md: documentação passo a passo completa

Esses arquivos facilitam o processo de configuração do projeto com Supabase."

# Push para GitHub
git push origin progresso-do-projeto

echo "✅ Commit realizado com sucesso!"
