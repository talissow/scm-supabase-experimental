#!/usr/bin/env python3
import subprocess
import os

os.chdir('/vercel/share/v0-project')

# Configurar Git
subprocess.run(['git', 'config', 'user.name', 'v0[bot]'], check=True)
subprocess.run(['git', 'config', 'user.email', 'v0[bot]@users.noreply.github.com'], check=True)

# Adicionar arquivos
files = [
    'SETUP_INTERATIVO.html',
    'CHECKLIST_SETUP.md',
    'GUIA_RAPIDO_30MIN.md',
    'docs/SETUP_COMPLETO_PASSO_A_PASSO.md'
]

for f in files:
    subprocess.run(['git', 'add', f], check=True)
    print(f'✅ Adicionado: {f}')

# Fazer commit
commit_message = """docs: adicionar guias de setup e configuração automática

- SETUP_INTERATIVO.html: interface interativa para o setup
- CHECKLIST_SETUP.md: checklist detalhado com todas as tarefas
- GUIA_RAPIDO_30MIN.md: guia simplificado para setup em 30 minutos
- docs/SETUP_COMPLETO_PASSO_A_PASSO.md: documentação passo a passo completa

Esses arquivos facilitam o processo de configuração do projeto com Supabase.

Co-authored-by: v0[bot] <v0[bot]@users.noreply.github.com>"""

subprocess.run(['git', 'commit', '-m', commit_message], check=True)
print('✅ Commit realizado com sucesso!')

# Push
subprocess.run(['git', 'push', 'origin', 'progresso-do-projeto'], check=True)
print('✅ Push realizado com sucesso!')
