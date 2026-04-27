#!/usr/bin/env python3
import subprocess
import os

os.chdir("/vercel/share/v0-project")

# Configurar git
subprocess.run('git config user.email "v0[bot]@users.noreply.github.com"', shell=True)
subprocess.run('git config user.name "v0[bot]"', shell=True)

# Add, commit, push
subprocess.run("git add -A", shell=True)
subprocess.run('git commit -m "FASE 4 COMPLETO: Redesign React profissional com componentes, animações e deploy ready" --allow-empty', shell=True)
subprocess.run("git push origin progresso-do-projeto", shell=True)

print("Deploy concluído!")
